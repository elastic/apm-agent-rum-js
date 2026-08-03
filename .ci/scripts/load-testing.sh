#!/usr/bin/env bash

STACK_VERSION=${1:-8.19.6}
USER_ID="$(id -u):$(id -g)"

USER_ID="${USER_ID}" \
STACK_VERSION=${STACK_VERSION} \
docker-compose -f ./dev-utils/docker-compose.yml down \
  --remove-orphans \
  --volumes || true

USER_ID="${USER_ID}" \
STACK_VERSION=${STACK_VERSION} \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --build \
  --exit-code-from load-testing \
  load-testing
