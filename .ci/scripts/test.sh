#!/usr/bin/env bash
set -xueo pipefail

USER_ID="$(id -u):$(id -g)" \
docker-compose -f ./dev-utils/docker-compose.yml up \
  --no-ansi \
  --log-level ERROR \
  --abort-on-container-exit \
  --exit-code-from node-puppeteer \
  --abort-on-container-exit \
  --remove-orphans \
  node-puppeteer
