#!/usr/bin/env bash
USER_ID="$(id -u):$(id -g)" \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --abort-on-container-exit \
  --exit-code-from node-benchmark \
  --remove-orphans \
  node-benchmark
