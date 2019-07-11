#!/usr/bin/env groovy

@Library('apm@current') _

import co.elastic.matrix.*
import groovy.transform.Field

/**
This is the parallel tasks generator,
it is need as field to store the results of the tests.
*/
@Field def rumTasksGen

pipeline {
  agent { label 'linux && immutable' }
  environment {
    REPO = 'apm-agent-rum-js'
    BASE_DIR = "src/github.com/elastic/${env.REPO}"
    NOTIFY_TO = credentials('notify-to')
    JOB_GCS_BUCKET = credentials('gcs-bucket')
    PIPELINE_LOG_LEVEL='INFO'
    CODECOV_SECRET = 'secret/apm-team/ci/apm-agent-rum-codecov'
    SAUCELABS_SECRET = 'secret/apm-team/ci/apm-agent-rum-saucelabs'
    DOCKER_ELASTIC_SECRET = 'secret/apm-team/ci/docker-registry/prod'
    GITHUB_CHECK_ITS_NAME = 'Integration Tests'
    ITS_PIPELINE = 'apm-integration-tests-selector-mbp/master'
  }
  options {
    timeout(time: 3, unit: 'HOURS')
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '20', daysToKeepStr: '30'))
    timestamps()
    ansiColor('xterm')
    disableResume()
    durabilityHint('PERFORMANCE_OPTIMIZED')
    rateLimitBuilds(throttle: [count: 60, durationName: 'hour', userBoost: true])
    quietPeriod(10)
  }
  triggers {
    issueCommentTrigger('(?i).*(?:jenkins\\W+)?run\\W+(?:the\\W+)?tests(?:\\W+please)?.*')
  }
  parameters {
    booleanParam(name: 'saucelab_test', defaultValue: "false", description: "Enable run a Sauce lab test")
    booleanParam(name: 'parallel_test', defaultValue: "true", description: "Enable run tests in parallel")
  }
  stages {
    stage('Initializing'){
      agent { label 'linux && immutable' }
      options { skipDefaultCheckout() }
      environment {
        PATH = "${env.PATH}:${env.WORKSPACE}/bin"
      }
      stages {
        /**
        Checkout the code and stash it, to use it on other stages.
        */
        stage('Checkout') {
          steps {
            deleteDir()
            gitCheckout(basedir: "${BASE_DIR}", githubNotifyFirstTimeContributor: true)
            stash allowEmpty: true, name: 'source', useDefaultExcludes: false
          }
        }
        /**
        Lint the code.
        */
        stage('Lint') {
          steps {
            withGithubNotify(context: 'Lint') {
              deleteDir()
              unstash 'source'
              script{
                docker.image('node:8').inside(){
                  dir("${BASE_DIR}"){
                    sh(label: "Lint", script: 'HOME=$(pwd) .ci/scripts/lint.sh')
                    bundlesize()
                  }
                  stash allowEmpty: true, name: 'cache', includes: "${BASE_DIR}/.npm/**", useDefaultExcludes: false
                }
              }
            }
          }
        }
        /**
        Execute unit tests.
        */
        stage('Test') {
          steps {
            withGithubNotify(context: 'Test', tab: 'tests') {
              deleteDir()
              unstash 'source'
              dir("${BASE_DIR}"){
                runParallelTest()
              }
            }
          }
        }
        /**
        Build the documentation.
        */
        stage('Documentation') {
          steps {
            withGithubNotify(context: 'Documentation') {
              deleteDir()
              unstash 'source'
              dir("${BASE_DIR}"){
                buildDocs(docsDir: "docs", archive: true)
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
                environment name: 'GIT_BUILD_CAUSE', value: 'pr'
                expression { return !params.Run_As_Master_Branch }
              }
            }
          }
          steps {
            log(level: 'INFO', text: 'Launching Async ITs')
            build(job: env.ITS_PIPELINE, propagate: false, wait: false,
                  parameters: [string(name: 'AGENT_INTEGRATION_TEST', value: 'RUM'),
                               string(name: 'BUILD_OPTS', value: "--rum-agent-branch ${env.GIT_BASE_COMMIT} --rum-agent-repo ${env.CHANGE_FORK?.trim() ?: 'elastic' }/${env.REPO}"),
                               string(name: 'GITHUB_CHECK_NAME', value: env.GITHUB_CHECK_ITS_NAME),
                               string(name: 'GITHUB_CHECK_REPO', value: env.REPO),
                               string(name: 'GITHUB_CHECK_SHA1', value: env.GIT_BASE_COMMIT)])
            githubNotify(context: "${env.GITHUB_CHECK_ITS_NAME}", description: "${env.GITHUB_CHECK_ITS_NAME} ...", status: 'PENDING', targetUrl: "${env.JENKINS_URL}search/?q=${env.ITS_PIPELINE.replaceAll('/','+')}")
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

/**
Parallel task generator for the integration tests.
*/
class RumParallelTaskGenerator extends DefaultParallelTaskGenerator {

  public RumParallelTaskGenerator(Map params){
    super(params)
  }

  /**
  build a clousure that launch and agent and execute the corresponding test script,
  then store the results.
  */
  public Closure generateStep(x, y){
    return {
      steps.node('linux && immutable && docker'){
        def label = "${this.tag}:${x}#${y}"
        try {
          steps.runScript(label: label, stack: x, scope: y)
          saveResult(x, y, 1)
        } catch(e){
          saveResult(x, y, 0)
          error("${label} tests failed : ${e.toString()}\n")
        } finally {
          steps.wrappingUp()
        }
      }
    }
  }
}

def runParallelTest(){
  rumTasksGen = new RumParallelTaskGenerator(
    xFile: '.ci/.jenkins_stack_versions.yaml',
    xKey: 'STACK_VERSION',
    yFile: '.ci/.jenkins_scope.yaml',
    yKey: 'SCOPE',
    excludedVersions: ['empty'],
    tag: "Rum",
    name: "Rum",
    steps: this
  )
  def mapPatallelTasks = rumTasksGen.generateParallelTests()

  if(params.parallel_test){
    parallel(mapPatallelTasks)
  } else {
    mapPatallelTasks.each{ k, v ->
      stage(k){
        v()
      }
    }
  }
}

def runScript(Map params = [:]){
  def stack = params.stack
  def scope = params.scope
  def label = params.label

  env.STACK_VERSION = "${stack}"
  env.SCOPE = "${scope}"
  env.APM_SERVER_URL = 'http://apm-server:8200'
  env.APM_SERVER_PORT = '8200'

  deleteDir()
  unstash 'source'
  unstash 'cache'
  dockerLogin(secret: "${DOCKER_ELASTIC_SECRET}", registry: "docker.elastic.co")
  dir("${BASE_DIR}"){
    if(params.saucelab_test){
      env.MODE = 'saucelabs'
      withSaucelabsEnv(){
        sh(label: "Start Elastic Stack ${stack}", script: '.ci/scripts/test.sh')
      }
    } else {
      env.MODE = 'none'
      sh(label: "Start Elastic Stack ${stack}", script: '.ci/scripts/test.sh')
    }
  }
}

def withSaucelabsEnv(Closure body){
  def jsonValue = getVaultSecret(secret: "${SAUCELABS_SECRET}${SCOPE}")
  wrap([$class: 'MaskPasswordsBuildWrapper', varPasswordPairs: [
    [var: 'SAUCE_USERNAME', password: jsonValue.data.SAUCE_USERNAME],
    [var: 'SAUCE_ACCESS_KEY', password: jsonValue.data.SAUCE_ACCESS_KEY],
  ]]) {
    withEnv([
      "SAUCE_USERNAME=${jsonValue.data.SAUCE_USERNAME}",
      "SAUCE_ACCESS_KEY=${jsonValue.data.SAUCE_ACCESS_KEY}"]) {
        body()
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
    testResults: "**/spec/rum-agent-junit.xml")
  archiveArtifacts(allowEmptyArchive: true, artifacts: "**/.npm/_logs")
  codecov(repo: 'apm-agent-rum', basedir: "${steps.env.BASE_DIR}",
    secret: "${steps.env.CODECOV_SECRET}")
}
