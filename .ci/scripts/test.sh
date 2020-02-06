#!/usr/bin/env bash
set -xueo pipefail

USER_ID="$(id -u):$(id -g)" \
docker-compose \
  -f ./dev-utils/docker-compose.yml \
  --log-level INFO \
  up \
  --quiet-pull \
  --exit-code-from node-puppeteer \
  --abort-on-container-exit \
  --remove-orphans \
  node-puppeteer
