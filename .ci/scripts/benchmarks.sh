#!/usr/bin/env bash

USER_ID="$(id -u):$(id -g)"
NODEJS_VERSION=$(cat .nvmrc)

USER_ID="${USER_ID}" \
NODEJS_VERSION="${NODEJS_VERSION}" \
docker-compose -f ./dev-utils/docker-compose.yml down \
  --remove-orphans \
  --volumes || true

USER_ID="${USER_ID}" \
NODEJS_VERSION="${NODEJS_VERSION}" \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from node-benchmark \
  --remove-orphans \
  node-benchmark
