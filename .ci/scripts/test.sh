#!/usr/bin/env bash
set -xo pipefail
STACK_VERSION=${STACK_VERSION:-8.6.1}

pip install docker-compose>=1.25.4

# Tests are run within the node-puppeteer container and can fails.
# To avoid flakiness, we retry up to 3 times to run them.
for i in {1..3};
do
  USER_ID="$(id -u):$(id -g)" \
  NODEJS_VERSION=$(cat .nvmrc) \
  STACK_VERSION=${STACK_VERSION} \
  docker-compose \
    -f ./dev-utils/docker-compose.yml \
    --log-level INFO \
    up \
    --quiet-pull \
    --exit-code-from node-puppeteer \
    --remove-orphans \
    node-puppeteer && break;
  sleep 5;
done
echo "Exit code from docker-compose $?"
