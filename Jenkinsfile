#!/usr/bin/env groovy

@Library('apm@current') _

pipeline {
  agent { label 'linux && immutable' }
  environment {
    REPO = 'apm-agent-rum-js'
    BASE_DIR = "${env.REPO}"
    NOTIFY_TO = credentials('notify-to')
    JOB_GCS_BUCKET = credentials('gcs-bucket')
    PIPELINE_LOG_LEVEL='INFO'
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
  stages {
    stage('Checkout') {
      options { skipDefaultCheckout() }
      steps {
        pipelineManager([ cancelPreviousRunningBuilds: [ when: 'PR' ] ])
        deleteDir()
        sh "git clone https://github.com/elastic/apm-agent-rum-js.git ${BASE_DIR}"
        gitCheckout(basedir: "${BASE_DIR}", githubNotifyFirstTimeContributor: true)
        stash allowEmpty: true, name: 'source', useDefaultExcludes: false
      }
    }
    stage('Lint') {
      options { skipDefaultCheckout() }
      steps {
        withGithubNotify(context: 'Lint') {
          deleteDir()
          unstash 'source'
          script{
            docker.image('node:8').inside(){
              dir("${BASE_DIR}"){
                sh(label: "Lint", script: 'HOME=$(pwd) .ci/scripts/lint.sh')
              }
              stash allowEmpty: true, name: 'cache', includes: "${BASE_DIR}/.npm/**", useDefaultExcludes: false
            }
          }
        }
      }
    }
    stage('Benchmarks') {
      options { skipDefaultCheckout() }
      agent { label 'metal' }
      environment {
        REPORT_FILE = 'apm-agent-benchmark-results.json'
      }
      steps {
        deleteDir()
        unstash 'source'
        unstash 'cache'
        dockerLogin(secret: "${DOCKER_ELASTIC_SECRET}", registry: 'docker.elastic.co')
        dir("${BASE_DIR}"){
          script {
            sh 'git log --pretty=format:"%H %ct000" --after="2020-03-09" --until="2020-04-05" --reverse > commits.txt'
            def file = readFile(file: 'commits.txt')
            file?.split("\n").each { line ->
              content = line.split(' ')
              withEnv(["REPORT_FILE=apm-agent-benchmark-results-${content[0]}.json",
                       "COMMIT_TIMESTAMP=${content[1]}"]) {
                sh 'git co ${COMMIT_TIMESTAMP}'
                sh './.ci/scripts/benchmarks.sh || true'
                sh '''
                  if [ -e "${REPORT_FILE}" ] ; then
                    set +e
                    cat ${REPORT_FILE} | sed "s#@timestamp\":.*#@timestamp\":${COMMIT_TIMESTAMP}}#g" > ${REPORT_FILE}.new.json
                  fi
                '''
                archiveArtifacts(allowEmptyArchive: true, artifacts: "${BASE_DIR}/${env.REPORT_FILE}.*", onlyIfSuccessful: false)
              }
            }
          }
        }
      }
      post {
        always {
          catchError(message: 'deleteDir failed', buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            deleteDir()
          }
        }
      }
    }
  }
  post {
    cleanup {
      notifyBuildResult()
    }
  }
}
