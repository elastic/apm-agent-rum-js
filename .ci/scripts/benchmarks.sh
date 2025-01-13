#!/usr/bin/env bash

USER_ID="$(id -u):$(id -g)"
# The migration of this to Node.js 18 will wait. To update playwright (and browsers)
# to make it work in Node.js 18 and latest version in ubuntu (or another OS)
# will require us to invest a certain amount of time
NODEJS_VERSION=14

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
