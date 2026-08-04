#!/usr/bin/env bash

USER_ID="$(id -u):$(id -g)"

# Ensure local bin is in PATH, needed for updated docker-compose, see https://github.com/elastic/observability-robots/issues/2960
export PATH="$HOME/.local/bin:$PATH"

docker-compose -f ./dev-utils/docker-compose.yml down \
  --remove-orphans \
  --volumes || true

docker-compose -f ./dev-utils/docker-compose.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from node-benchmark \
  --remove-orphans \
  node-benchmark
