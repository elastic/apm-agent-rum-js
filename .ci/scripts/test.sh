#!/usr/bin/env bash
set -xo pipefail

STACK_VERSION=${STACK_VERSION:-"8.6.1"}
APM_SERVER_PORT=${APM_SERVER_PORT:-"8200"}
APM_SERVER_URL=${APM_SERVER_URL:-"http://apm-server:8200"}
KIBANA_URL=${KIBANA_URL:-"http://kibana:5601"}

# As long as there are issues with the ssl lets use 6.1.3
# see https://github.com/docker/docker-py/issues/3194
pip3 uninstall docker
pip3 install docker==6.1.3

pip install docker-compose>=1.25.4

# https://github.com/docker/docker-py/issues/3256
pip3 uninstall requests
pip3 install requests==2.31.0


# Tests are run within the node-puppeteer container and can fails.
# To avoid flakiness, we retry up to 3 times to run them.
for i in {1..3};
do
  USER_ID="$(id -u):$(id -g)" \
  NODEJS_VERSION=$(cat .nvmrc) \
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
    node-puppeteer;
    status=${?}
    if [ "${status}" -eq "0" ]; then
      break
    fi
  sleep 5;
done
echo "Exit code from docker compose ${status}"
exit ${status}
