#!/usr/bin/env bash
set -xueo pipefail

pip install docker-compose>=1.25.4

USER_ID="$(id -u):$(id -g)" \
docker-compose \
  -f ./dev-utils/docker-compose.yml \
  --log-level INFO \
  up \
  --quiet-pull \
  --exit-code-from node-puppeteer \
  --remove-orphans \
  node-puppeteer
echo "Exit code from docker-compose $?"
