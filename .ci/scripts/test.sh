#!/usr/bin/env bash
set -xo pipefail

NODEJS_VERSION="18"
STACK_VERSION=${STACK_VERSION:-"8.19.5"}
APM_SERVER_PORT=${APM_SERVER_PORT:-"8200"}
APM_SERVER_URL=${APM_SERVER_URL:-"http://apm-server:8200"}
KIBANA_URL=${KIBANA_URL:-"http://kibana:5601"}

# Tests are run within the node-puppeteer container and can fails.
# To avoid flakiness, we retry up to 3 times to run them.
for i in {1..3};
do
  USER_ID="$(id -u):$(id -g)" \
  NODEJS_VERSION=${NODEJS_VERSION} \
  STACK_VERSION=${STACK_VERSION} \
  APM_SERVER_PORT=${APM_SERVER_PORT} \
  APM_SERVER_URL=${APM_SERVER_URL} \
  KIBANA_URL=${KIBANA_URL} \
  docker --log-level INFO compose \
    -f ./dev-utils/docker-compose.yml \
    up \
    --quiet-pull \
    --exit-code-from node-puppeteer \
    --remove-orphans \
    node-puppeteer \
    >docker-compose.log 2>docker-compose.err;
    status=${?}
    if [ "${status}" -eq "0" ]; then
      break
    else
      echo "Docker compose failed, see the below log output"
      cat docker-compose.log && rm docker-compose.log
      cat docker-compose.err && rm docker-compose.err
    fi
  sleep 5;
done
echo "Exit code from docker compose ${status}"
exit ${status}
