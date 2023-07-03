#!/usr/bin/env bash

# Bash strict mode
set -eo pipefail

# Found current script directory
RELATIVE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Found project directory
BASE_PROJECT="$(dirname "$(dirname "${RELATIVE_DIR}")")"

## Buildkite specific configuration
if [ "${CI}" == "true" ] ; then
  # If HOME is not set then use the Buildkite workspace
  # that's normally happening when running in the CI
  # owned by Elastic.
  if [ -z "${HOME}" ] ; then
    export HOME="${BUILDKITE_BUILD_CHECKOUT_PATH}"
    export HOME
  fi

  # required when running the benchmark
  PATH="${PATH}:${HOME}/.local/bin"
  export PATH

  echo 'Docker login is done in the Buildkite hooks'
fi

# Validate env vars
[ -z "${ES_USER_SECRET}" ] && echo "Environment variable 'ES_USER_SECRET' must be defined" && exit 1;
[ -z "${ES_PASS_SECRET}" ] && echo "Environment variable 'ES_PASS_SECRET' must be defined" && exit 1;
[ -z "${ES_URL_SECRET}" ] && echo "Environment variable 'ES_URL_SECRET' must be defined" && exit 1;
[ -z "${STACK_VERSION}" ] && echo "Environment variable 'STACK_VERSION' must be defined" && exit 1;

# Debug env vars
echo "Will run microbenchmarks on STACK_VERSION=${STACK_VERSION}"

# It does not fail so it runs for benchmark, load testing and then we report the error at the end.
set +e
status=0

# Run the benchmarks
REPORT_FILE="apm-agent-benchmark-results.json" "${BASE_PROJECT}/.ci/scripts/benchmarks.sh"

# Gather error if any
if [ $? -gt 0 ] ; then
  status=1
fi

# Then we ship the data using the helper
sendBenchmark "${ES_USER_SECRET}" "${ES_PASS_SECRET}" "${ES_URL_SECRET}" "${BASE_PROJECT}/apm-agent-benchmark-results.json"

# Run the load testing
REPORT_FILE="apm-agent-load-testing-results.json" "${BASE_PROJECT}/.ci/scripts/load-testing.sh" "${STACK_VERSION}"

# Gather error if any
if [ $? -gt 0 ] ; then
  status=1
fi

# Then we ship the data using the helper
sendBenchmark "${ES_USER_SECRET}" "${ES_PASS_SECRET}" "${ES_URL_SECRET}" "${BASE_PROJECT}/apm-agent-load-testing-results.json"

# Report status
exit $status
