#!/usr/bin/env bash
set -xueo pipefail

echo 0 > test_exit_code

USER_ID="$(id -u):$(id -g)" \
docker-compose \
  -f ./dev-utils/docker-compose.yml \
  --log-level INFO \
  up \
  --quiet-pull \
  --exit-code-from node-puppeteer \
  --remove-orphans \
  "node-puppeteer || (echo 1 > test_exit_code && exit 1)"
echo "Exit code from docker-compose $?"
exit $(cat test_exit_code)
