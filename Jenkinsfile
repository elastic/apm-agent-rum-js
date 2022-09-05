#!/usr/bin/env groovy

@Library('apm@current') _

pipeline {
  agent { label 'linux && immutable' }
  environment {
    REPO = 'apm-agent-rum-js'
    BASE_DIR = "src/github.com/elastic/${env.REPO}"
    NOTIFY_TO = credentials('notify-to')
    JOB_GCS_BUCKET = credentials('gcs-bucket')
    PIPELINE_LOG_LEVEL = 'INFO'
    CODECOV_SECRET = 'secret/apm-team/ci/apm-agent-rum-codecov'
    SAUCELABS_SECRET = 'secret/apm-team/ci/apm-agent-rum-saucelabs@elastic/apm-rum'
    DOCKER_ELASTIC_SECRET = 'secret/apm-team/ci/docker-registry/prod'
    GITHUB_CHECK_ITS_NAME = 'Integration Tests'
    ITS_PIPELINE = 'apm-integration-tests-selector-mbp/main'
    OPBEANS_REPO = 'opbeans-frontend'
    NPMRC_SECRET = 'secret/jenkins-ci/npmjs/elasticmachine'
    TOTP_SECRET = 'totp/code/npmjs-elasticmachine'
    PATH = "${env.PATH}:${env.WORKSPACE}/bin"
    MODE = "none"
    STACK_VERSION = "${params.stack_version}"
  }
  options {
    //timeout(time: 3, unit: 'HOURS')
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '20', daysToKeepStr: '30'))
    timestamps()
    ansiColor('xterm')
    disableResume()
    durabilityHint('PERFORMANCE_OPTIMIZED')
    rateLimitBuilds(throttle: [count: 60, durationName: 'hour', userBoost: true])
    quietPeriod(10)
  }
  triggers {
    issueCommentTrigger("(${obltGitHubComments()}|^run benchmark tests)")
  }
  parameters {
    booleanParam(name: 'Run_As_Main_Branch', defaultValue: false, description: 'Allow to run any steps on a PR, some steps normally only run on main branch.')
    booleanParam(name: 'saucelab_test', defaultValue: "true", description: "Enable run a Sauce lab test")
    booleanParam(name: 'bench_ci', defaultValue: true, description: 'Enable benchmarks')
    booleanParam(name: 'release', defaultValue: false, description: 'Release. If so, all the other parameters will be ignored when releasing from main.')
    string(name: 'stack_version', defaultValue: '8.4.1', description: "What's the Stack Version to be used for the load testing?")
  }
  stages {
    stage('Initializing'){
      options { skipDefaultCheckout() }
      stages {
        /**
        Checkout the code and stash it, to use it on other stages.
        */
        stage('Checkout') {
          steps {
            pipelineManager([ cancelPreviousRunningBuilds: [ when: 'PR' ] ])
            deleteDir()
            gitCheckout(basedir: "${BASE_DIR}", githubNotifyFirstTimeContributor: true)
            stash allowEmpty: true, name: 'source', useDefaultExcludes: false
            script {
              dir("${BASE_DIR}"){
                // Look for changes related to the benchmark, if so then set the env variable.
                def patternList =[
                  '^packages/.*/test/benchmarks/.*',
                  '^scripts/benchmarks.js',
                  '^packages/rum-core/karma.bench.conf.js'
                ]
                env.BENCHMARK_UPDATED = isGitRegionMatch(patterns: patternList)

                // Skip all the stages except docs for PR's with asciidoc/md changes only
                env.ONLY_DOCS = isGitRegionMatch(patterns: [ '.*\\.(asciidoc|md)' ], shouldMatchAll: true)
              }
            }

            whenTrue(params.release) {
              setEnvVar('PRE_RELEASE_STAGE', 'true')
              notifyStatus(slackStatus: 'warning', subject: "[${env.REPO}] Release build just started",
                           body: "Please go to (<${env.BUILD_URL}|here>) to see the build status or wait for further notifications.")
            }
          }
        }
        /**
        Lint the code.
        */
        stage('Lint') {
          when {
            beforeAgent true
            not {
              expression { return isTag() }
            }
          }
          steps {
            withGithubNotify(context: 'Lint') {
              deleteDir()
              unstash 'source'
              script{
                docker.image('node:12').inside(){
                  dir("${BASE_DIR}"){
                    sh(label: "Lint", script: 'HOME=$(pwd) .ci/scripts/lint.sh')
                    bundlesize()
                  }
                  stash allowEmpty: true, name: 'cache', includes: "${BASE_DIR}/.npm/**", useDefaultExcludes: false
                }
                dir("${BASE_DIR}"){
                  // To run in the worker otherwise some tools won't be in place when using the above docker container
                  generateReport(id: 'bundlesize', input: 'packages/rum/reports/apm-*-report.html', template: true, compare: true, templateFormat: 'md')
                }
              }
            }
          }
        }
        stage('Test Puppeteer') {
          when {
            beforeAgent true
            allOf {
              expression { return env.ONLY_DOCS == "false" }
              not {
                expression { return isTag() }
              }
            }
          }
          matrix {
            axes {
              axis {
                name 'ELASTIC_STACK_VERSION'
                // The below line is part of the bump release automation
                // if you change anything please modifies the file
                // .ci/bump-stack-release-version.sh
                values '8.0.0-SNAPSHOT', '8.4.1'
              }
              axis {
                name 'SCOPE'
                values (
                  '@elastic/apm-rum',
                  '@elastic/apm-rum-core',
                  '@elastic/apm-rum-react',
                  '@elastic/apm-rum-angular',
                  '@elastic/apm-rum-vue',
                )
              }
            }
            stages {
              stage('Scope Test') {
                steps {
                  runTest(stack: env.ELASTIC_STACK_VERSION, scope: env.SCOPE, allocateNode: true)
                }
              }
            }
          }
        }
        stage('Stack 8.0.0-SNAPSHOT SauceLabs') {
          agent { label 'linux && immutable' }
          environment {
            MODE = "saucelabs"
          }
          when {
            allOf {
              anyOf {
                branch 'main'
                changeRequest()
              }
              expression { return params.saucelab_test }
              expression { return env.ONLY_DOCS == "false" }
              // Releases from main should skip this particular stage.
              not {
                allOf {
                  branch 'main'
                  expression { return params.release }
                }
              }
            }
          }
          steps {
            runAllScopes(stack: "8.0.0-SNAPSHOT")
          }
          post {
            cleanup {
              dir("${BASE_DIR}") {
                wrappingUp()
              }
            }
          }
        }
        stage('Integration Tests') {
          agent none
          when {
            beforeAgent true
            allOf {
              anyOf {
                changeRequest()
                expression { return !params.Run_As_Main_Branch }
              }
              expression { return env.ONLY_DOCS == "false" }
            }
          }
          steps {
            build(job: env.ITS_PIPELINE, propagate: false, wait: false,
                  parameters: [string(name: 'INTEGRATION_TEST', value: 'RUM'),
                               string(name: 'BUILD_OPTS', value: "--rum-agent-branch ${env.GIT_BASE_COMMIT}"),
                               string(name: 'GITHUB_CHECK_NAME', value: env.GITHUB_CHECK_ITS_NAME),
                               string(name: 'GITHUB_CHECK_REPO', value: env.REPO),
                               string(name: 'GITHUB_CHECK_SHA1', value: env.GIT_BASE_COMMIT)])
            githubNotify(context: "${env.GITHUB_CHECK_ITS_NAME}", description: "${env.GITHUB_CHECK_ITS_NAME} ...", status: 'PENDING', targetUrl: "${env.JENKINS_URL}search/?q=${env.ITS_PIPELINE.replaceAll('/','+')}")
          }
        }
        /**
        Run Benchmarks and send the results to ES.
        */
        stage('Benchmarks') {
          when {
            beforeAgent true
            allOf {
              anyOf {
                branch 'main'
                expression { return params.Run_As_Main_Branch }
                expression { return env.BENCHMARK_UPDATED != "false" }
                expression { return env.GITHUB_COMMENT?.contains('benchmark tests') }
              }
              expression { return params.bench_ci }
              expression { return env.ONLY_DOCS == "false" }
              // Releases from main should skip this particular stage.
              not {
                allOf {
                  branch 'main'
                  expression { return params.release }
                }
              }
            }
          }
          parallel {
            stage('Benchmarks') {
              agent { label 'microbenchmarks-pool' }
              environment {
                REPORT_FILE = 'apm-agent-benchmark-results.json'
              }
              steps {
                withGithubNotify(context: 'Benchmarks') {
                  deleteDir()
                  unstash 'source'
                  unstash 'cache'
                  dockerLogin(secret: "${DOCKER_ELASTIC_SECRET}", registry: 'docker.elastic.co')
                  dir("${BASE_DIR}") {
                    sh './.ci/scripts/benchmarks.sh'
                  }
                }
              }
              post {
                always {
                  archiveArtifacts(allowEmptyArchive: true, artifacts: "${BASE_DIR}/${env.REPORT_FILE}", onlyIfSuccessful: false)
                  catchError(message: 'sendBenchmarks failed', buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    log(level: 'INFO', text: "sendBenchmarks is ${env.CHANGE_ID?.trim() ? 'not enabled for PRs' : 'enabled for branches'}")
                    whenTrue(env.CHANGE_ID == null){
                      sendBenchmarks(file: "${BASE_DIR}/${env.REPORT_FILE}", index: 'benchmark-rum-js')
                    }
                  }
                  catchError(message: 'deleteDir failed', buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    deleteDir()
                  }
                }
              }
            }
            stage('Load testing') {
              agent { label 'microbenchmarks-pool' }
              options {
                warnError('load testing failed')
              }
              environment {
                REPORT_FILE = 'apm-agent-load-testing-results.json'
              }
              steps {
                withGithubNotify(context: 'Load testing') {
                  deleteDir()
                  unstash 'source'
                  unstash 'cache'
                  dockerLogin(secret: "${DOCKER_ELASTIC_SECRET}", registry: 'docker.elastic.co')
                  dir("${BASE_DIR}") {
                    sh ".ci/scripts/load-testing.sh ${env.STACK_VERSION}"
                  }
                }
              }
              post {
                always {
                  archiveArtifacts(allowEmptyArchive: true, artifacts: "${BASE_DIR}/${env.REPORT_FILE}", onlyIfSuccessful: false)
                  catchError(message: 'sendBenchmarks failed', buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    log(level: 'INFO', text: "sendBenchmarks is ${env.CHANGE_ID?.trim() ? 'not enabled for PRs' : 'enabled for branches'}")
                    whenTrue(env.CHANGE_ID == null){
                      sendBenchmarks(file: "${BASE_DIR}/${env.REPORT_FILE}", index: 'benchmarks-rum-load-test')
                    }
                  }
                  catchError(message: 'deleteDir failed', buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    deleteDir()
                  }
                }
              }
            }
          }
        }
        /**
        Execute code coverage only once.
        */
        stage('Coverage') {
          options { skipDefaultCheckout() }
          when {
            beforeAgent true
            allOf {
              expression { return env.ONLY_DOCS == "false" }
              not {
                expression { return isTag() }
              }
            }
          }
          steps {
            withGithubNotify(context: 'Coverage') {
              // No scope is required as the coverage should run for all of them
              runScript(label: 'coverage', stack: "${env.STACK_VERSION}", scope: '', goal: 'coverage')
              codecov(repo: env.REPO, basedir: "${env.BASE_DIR}", secret: "${env.CODECOV_SECRET}")
            }
          }
          post {
            always {
              coverageReport("${BASE_DIR}/packages/**")
              publishCoverage(adapters: [coberturaAdapter("${BASE_DIR}/packages/**/coverage-*-report.xml")],
                              sourceFileResolver: sourceFiles('STORE_ALL_BUILD'))
            }
          }
        }
        stage('Release') {
          options {
            skipDefaultCheckout()
            timeout(time: 12, unit: 'HOURS')
          }
          environment {
            HOME = "${env.WORKSPACE}"
          }
          when {
            beforeAgent true
            allOf {
              branch 'main'
              expression { return params.release }
            }
          }
          stages {
            stage('Notify') {
              options { skipDefaultCheckout() }
              steps {
                setEnvVar('PRE_RELEASE_STAGE', 'false')
                deleteDir()
                unstash 'source'
                dir("${BASE_DIR}") {
                  prepareRelease() {
                    script {
                      sh(label: 'Lerna version dry-run', script: 'npx lerna version --no-push --yes', returnStdout: true)
                      def releaseVersions = sh(label: 'Gather versions from last commit', script: 'git log -1 --format="%b"', returnStdout: true)
                      log(level: 'INFO', text: "Versions: ${releaseVersions}")
                      notifyStatus(slackStatus: 'warning', subject: "[${env.REPO}] Release ready to be pushed",
                                   body: "Please go to (<${env.BUILD_URL}input|here>) to approve or reject within 12 hours.\n Changes: ${releaseVersions}")
                      input(message: 'Should we release a new version?', ok: 'Yes, we should.',
                            parameters: [text(description: 'Look at the versions to be released. They cannot be edited here',
                                              defaultValue: "${releaseVersions}", name: 'versions')])
                    }
                  }
                }
              }
            }
            stage('Release CI') {
              options { skipDefaultCheckout() }
              steps {
                deleteDir()
                unstash 'source'
                dir("${BASE_DIR}") {
                  prepareRelease() {
                    sh 'npm run release-ci'
                  }
                }
              }
              post {
                success {
                  notifyStatus(slackStatus: 'good', subject: "[${env.REPO}] Release published", body: "Great news, the release has been done successfully. (<${env.RUN_DISPLAY_URL}|Open>). \n Release URL: (<https://github.com/elastic/apm-agent-rum-js/releases|Here>)")
                }
                always {
                  script {
                    currentBuild.description = "${currentBuild.description?.trim() ? currentBuild.description : ''} released"
                  }
                  archiveArtifacts(allowEmptyArchive: true, artifacts: "${env.BASE_DIR}/packages/rum/dist/bundles/*.js")
                }
              }
            }
            stage('Publish CDN') {
              options { skipDefaultCheckout() }
              steps {
                dir("${BASE_DIR}") {
                  uploadToCDN()
                }
              }
            }
          }
          post {
            failure {
              notifyStatus(slackStatus: 'danger', subject: "[${env.REPO}] Release failed", body: "(<${env.RUN_DISPLAY_URL}|Open>)")
            }
          }
        }
        stage('Opbeans') {
          options { skipDefaultCheckout() }
          when {
            beforeAgent true
            tag pattern: '@elastic/apm-rum@\\d+\\.\\d+\\.\\d+$', comparator: 'REGEXP'
          }
          environment {
            REPO_NAME = "${OPBEANS_REPO}"
          }
          steps {
            deleteDir()
            dir("${OPBEANS_REPO}"){
              git(credentialsId: 'f6c7695a-671e-4f4f-a331-acdce44ff9ba',
                  url: "git@github.com:elastic/${OPBEANS_REPO}.git",
                  branch: 'main')
              sh script: ".ci/bump-version.sh '${env.BRANCH_NAME}'", label: 'Bump version'
              // The opbeans pipeline will trigger a release for the main branch.
              gitPush()
              // The opbeans pipeline will trigger a release for the release tag.
              gitCreateTag(tag: "${env.BRANCH_NAME}")
            }
          }
        }
      }
    }
  }
  post {
    cleanup {
      // bundlesize id was generated previously with the generateReport step in the lint stage.
      notifyBuildResult(prComment: true, newPRComment: [ 'bundlesize': 'bundlesize.md' ])
    }
    failure {
      whenTrue(params.release && env.PRE_RELEASE_STAGE == 'true') {
        notifyStatus(slackStatus: 'danger', subject: "[${env.REPO}] Pre-release steps failed", body: "(<${env.RUN_DISPLAY_URL}|Open>)")
      }
    }
  }
}

def uploadToCDN() {
  def source = 'packages/rum/dist/bundles/*.js'
  def target = 'gs://apm-rum-357700bc'
  def secret = 'secret/gce/elastic-cdn/service-account/apm-rum-admin'
  def version = sh(label: 'Get package version', script: 'jq --raw-output .version packages/rum/package.json', returnStdout: true)
  def majorVersion = "${version.split('\\.')[0]}.x"

  // Publish version with the semver format and cache them for 1 year.
  publishToCDN(headers: ["Cache-Control:public,max-age=31536000,immutable"],
               source: "${source}",
               target: "${target}/${version}",
               secret: "${secret}")

  // Publish major.x and cache for 7 days
  publishToCDN(headers: ["Cache-Control:public,max-age=604800,immutable"],
               source: "${source}",
               target: "${target}/${majorVersion}",
               secret: "${secret}")

  // Prepare index.html, publish and cache for 7 days
  sh(label: 'prepare index.html', script: """ sed "s#VERSION#${majorVersion}#g" .ci/scripts/index.html.template > index.html""")
  publishToCDN(headers: ["Cache-Control:public,max-age=604800,immutable"],
               source: "index.html",
               target: "${target}",
               secret: "${secret}")
}

def runScript(Map args = [:]){
  def stack = args.stack
  def scope = args.scope
  def label = args.label
  def goal = args.get('goal', 'test')

  deleteDir()
  unstash 'source'
  unstash 'cache'
  dockerLogin(secret: "${DOCKER_ELASTIC_SECRET}", registry: "docker.elastic.co")
  dir("${BASE_DIR}"){
    withEnv([
      "STACK_VERSION=${stack}",
      "SCOPE=${scope}",
      "APM_SERVER_URL=http://apm-server:8200",
      "KIBANA_URL=http://kibana:5601",
      "APM_SERVER_PORT=8200",
      "GOAL=${goal}"]) {
      retryWithSleep(retries: 2, seconds: 5, sleepFirst: true) {
        sh(label: 'Pull and build docker infra', script: '.ci/scripts/pull_and_build.sh')
      }
      try {
        // Another retry in case there are any environmental issues
        retryWithSleep(retries: 3, seconds: 5, sleepFirst: true) {
          if(env.MODE == 'saucelabs'){
            withSaucelabsEnv(){
              sh(label: "Run tests: Elastic Stack ${stack} - ${scope} - ${env.MODE}", script: '.ci/scripts/test.sh')
            }
          } else {
            sh(label: "Run tests: Elastic Stack ${stack} - ${scope} - ${env.MODE}", script: '.ci/scripts/test.sh')
          }
        }
      } finally {
        dockerLogs(step: "${label}-${stack}", failNever: true)
        wrappingUp()
      }
    }
  }
}

def withSaucelabsEnv(Closure body){
  def jsonValue = getVaultSecret(secret: "${SAUCELABS_SECRET}")
  withEnvMask(vars: [
    [var: 'SAUCE_USERNAME', password: "${jsonValue.data.SAUCE_USERNAME}"],
    [var: 'SAUCE_ACCESS_KEY', password: "${jsonValue.data.SAUCE_ACCESS_KEY}"],
  ]){
    try { //https://issues.jenkins-ci.org/browse/JENKINS-61034
      timeout(activity: true, time: 300, unit: 'SECONDS') { //SauceLab uncatch exceptions
        body()
      }
    } catch(err){
      error("The test failed")
    }
  }
}

def bundlesize(){
  catchError(buildResult: 'SUCCESS', message: 'Bundlesize report issues', stageResult: 'UNSTABLE') {
    sh(label: "Bundlesize", script: '''#!/bin/bash
      set -o pipefail
      npm run bundlesize|tee bundlesize.txt
    ''')
  }
  catchError(buildResult: 'SUCCESS', message: 'Bundlesize report issues', stageResult: 'UNSTABLE') {
    sh(label: "Process Bundlesize out", script: '''#!/bin/bash
      grep -e "\\(FAIL\\|PASS\\)" bundlesize.txt|cut -d ":" -f 2 >bundlesize-lines.txt
    ''')
    def file = readFile(file: "bundlesize-lines.txt")
    file?.split("\n").each { line ->
      withGithubNotify(context: "Bundle Size :${line}"){
        echo "Bundle Size :${line}"
      }
    }
  }
}

def wrappingUp(){
  junit(allowEmptyResults: true,
    keepLongStdio: true,
    testResults: "packages/**/reports/TESTS-*.xml")
  archiveArtifacts(allowEmptyArchive: true, artifacts: ".npm/_logs,packages/**/reports/TESTS-*.xml")
}

def prepareRelease(String nodeVersion='node:lts', Closure body){
  withNpmrc(secret: "${env.NPMRC_SECRET}", path: "${env.WORKSPACE}/${env.BASE_DIR}") {
    docker.image(nodeVersion).inside(){
      withEnv(["HOME=${env.WORKSPACE}/${env.BASE_DIR}"]) {
        withGitRelease(credentialsId: '2a9602aa-ab9f-4e52-baf3-b71ca88469c7-UserAndToken') {
          sh 'npm ci'
          withTotpVault(secret: "${env.TOTP_SECRET}", code_var_name: 'TOTP_CODE'){
            body()
          }
        }
      }
    }
  }
}

def runAllScopes(Map args = [:]) {
  def stack = args.stack
  def scopes = [
    '@elastic/apm-rum-core',
    '@elastic/apm-rum',
    '@elastic/apm-rum-react',
    '@elastic/apm-rum-angular',
    '@elastic/apm-rum-vue'
  ]
  scopes.each{ scope ->
    runTest(stack: stack, scope: scope)
  }
}

def runTest(Map args = [:]){
  def stack = args.stack
  def scope = args.scope
  def allocateNode = args.get('allocateNode', false)
  def mode = env.MODE == 'none' ? 'Puppeteer' : env.MODE
  def stackVersion = (stack == '7.x') ? artifactsApi(action: '7.x-version') : stack

  withGithubNotify(context: "Test ${scope} - ${stack} - ${mode}", tab: 'tests') {
    if (allocateNode) {
      withNode(labels: 'linux && immutable', sleepMax: 5, forceWorspace: true, forceWorker: true){
        runScript(label: "${scope}", stack: "${stackVersion}", scope: "${scope}", goal: 'test')
      }
    } else {
      runScript(label: "${scope}", stack: "${stackVersion}", scope: "${scope}", goal: 'test')
    }
  }
}

def notifyStatus(def args = [:]) {
  releaseNotification(slackChannel: '#apm-agent-js',
                      slackColor: args.slackStatus,
                      slackCredentialsId: 'jenkins-slack-integration-token',
                      to: "${env.NOTIFY_TO}",
                      subject: args.subject,
                      body: args.body)
}
