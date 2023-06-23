#!/usr/bin/env groovy

@Library('apm@current') _

pipeline {
  agent { label 'linux && immutable' }
  environment {
    REPO = 'apm-agent-rum-js'
    BASE_DIR = "src/github.com/elastic/${env.REPO}"
    PIPELINE_LOG_LEVEL = 'INFO'
    OPBEANS_REPO = 'opbeans-frontend'
    PATH = "${env.PATH}:${env.WORKSPACE}/bin"
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
    stage('Initializing'){
      options { skipDefaultCheckout() }
      stages {
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
            dir("${OPBEANS_REPO}") {
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
}
