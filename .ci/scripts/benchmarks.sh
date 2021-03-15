#!/usr/bin/env bash
USER_ID="$(id -u):$(id -g)" \
NODEJS_VERSION=$(cat ./dev-utils/.node-version) \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from node-benchmark \
  --remove-orphans \
  node-benchmark
