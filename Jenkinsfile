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
    booleanParam(name: 'bench_ci', defaultValue: true, description: 'Enable benchmarks')
    booleanParam(name: 'release', defaultValue: false, description: 'Release. If so, all the other parameters will be ignored when releasing from main.')
    string(name: 'stack_version', defaultValue: "8.6.1", description: "What's the Stack Version to be used for the load testing?")
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
    failure {
      whenTrue(params.release && env.PRE_RELEASE_STAGE == 'true') {
        notifyStatus(slackStatus: 'danger', subject: "[${env.REPO}] Pre-release steps failed", body: "(<${env.RUN_DISPLAY_URL}|Open>)")
      }
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
