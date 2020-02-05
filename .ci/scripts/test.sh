#!/usr/bin/env bash
USER_ID="$(id -u):$(id -g)" \
docker-compose -f ./dev-utils/docker-compose.yml \
  --log-level INFO \
  up \
  --quiet-pull \
  --abort-on-container-exit \
  --exit-code-from node-puppeteer \
  --remove-orphans \
  node-puppeteer
