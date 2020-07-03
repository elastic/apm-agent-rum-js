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
    SAUCELABS_SECRET_CORE = 'secret/apm-team/ci/apm-agent-rum-saucelabs@elastic/apm-rum-core'
    SAUCELABS_SECRET = 'secret/apm-team/ci/apm-agent-rum-saucelabs@elastic/apm-rum'
    DOCKER_ELASTIC_SECRET = 'secret/apm-team/ci/docker-registry/prod'
    GITHUB_CHECK_ITS_NAME = 'Integration Tests'
    ITS_PIPELINE = 'apm-integration-tests-selector-mbp/master'
    OPBEANS_REPO = 'opbeans-frontend'
    NPMRC_SECRET = 'secret/jenkins-ci/npmjs/elasticmachine'
    TOTP_SECRET = 'totp/code/npmjs-elasticmachine'
    PATH = "${env.PATH}:${env.WORKSPACE}/bin"
    MODE = "none"
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
    issueCommentTrigger('(?i).*(?:jenkins\\W+)?run\\W+(?:the\\W+)?(?:benchmark\\W+)?tests(?:\\W+please)?.*')
  }
  parameters {
    booleanParam(name: 'Run_As_Master_Branch', defaultValue: false, description: 'Allow to run any steps on a PR, some steps normally only run on master branch.')
    booleanParam(name: 'saucelab_test', defaultValue: "true", description: "Enable run a Sauce lab test")
    booleanParam(name: 'parallel_test', defaultValue: "true", description: "Enable run tests in parallel")
    booleanParam(name: 'bench_ci', defaultValue: true, description: 'Enable benchmarks')
    booleanParam(name: 'release', defaultValue: false, description: 'Release.')
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
          }
        }
        stage('Release') {
          options {
            skipDefaultCheckout()
          }
          environment {
            HOME = "${env.WORKSPACE}"
          }
          stages {
            stage('Notify') {
              options { skipDefaultCheckout() }
              steps {
                deleteDir()
                unstash 'source'
                dir("${BASE_DIR}") {
                  sh(label: 'Lerna run build', script: 'npx lerna run build')
                }
              }
            }
            stage('Publish CDN') {
              options { skipDefaultCheckout() }
              steps {
                dir("${BASE_DIR}") {
                  sh 'ls -ltrah packages/rum/dist/bundles/*.js || true'
                  uploadToCDN()
                }
              }
              post {
                always {
                  archiveArtifacts(allowEmptyArchive: true, artifacts: "${env.BASE_DIR}/packages/rum/dist/bundles/*.js,${env.BASE_DIR}/index.html")
                }
              }
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
  }
}

def uploadToCDN() {
  def source = 'packages/rum/dist/bundles/*.js'
  def target = 'gs://beats-ci-temp/rum-test'
  def secret = 'secret/observability-team/ci/service-account/test-google-storage-plugin'
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
      "APM_SERVER_PORT=8200",
      "GOAL=${goal}"]) {
      retry(2) {
        sleep randomNumber(min: 5, max: 10)
        sh(label: 'Pull and build docker infra', script: '.ci/scripts/pull_and_build.sh')
      }
      try {
        // Another retry in case there are any environmental issues
        retry(3) {
          sleep randomNumber(min: 5, max: 10)
          if(env.MODE == 'saucelabs'){
            withSaucelabsEnv(){
              sh(label: "Start Elastic Stack ${stack} - ${scope} - ${env.MODE}", script: '.ci/scripts/test.sh')
            }
          } else {
            sh(label: "Start Elastic Stack ${stack} - ${scope} - ${env.MODE}", script: '.ci/scripts/test.sh')
          }
        }
      } catch(e) {
        throw e
      } finally {
        dockerLogs(step: "${label}-${stack}", failNever: true)
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
    testResults: "${env.BASE_DIR}/packages/**/reports/TESTS-*.xml")
  archiveArtifacts(allowEmptyArchive: true, artifacts: "${env.BASE_DIR}/.npm/_logs,${env.BASE_DIR}/packages/**/reports/TESTS-*.xml")
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

def runAllScopes(){
  def scopes = [
    'SCOPE=@elastic/apm-rum-core',
    'SCOPE=@elastic/apm-rum',
    'SCOPE=@elastic/apm-rum-react',
    'SCOPE=@elastic/apm-rum-angular',
    'SCOPE=@elastic/apm-rum-vue'
  ]
  scopes.each{ s ->
    withEnv([s]){
      runTest()
    }
  }
}

def runTest(){
  def mode = env.MODE == 'none' ? 'Puppeteer' : env.MODE
  withGithubNotify(context: "Test ${SCOPE} - ${STACK_VERSION} - ${mode}", tab: 'tests') {
    runScript(
      label: "${SCOPE}",
      stack: "${STACK_VERSION}",
      scope: "${SCOPE}",
      goal: 'test'
    )
  }
}
