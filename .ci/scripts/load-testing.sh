#!/usr/bin/env bash
USER_ID="$(id -u):$(id -g)" \
NODEJS_VERSION=$(cat ./dev-utils/.node-version) \
STACK_VERSION=${1:-7.10.0} \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from load-testing \
  --remove-orphans \
  load-testing
