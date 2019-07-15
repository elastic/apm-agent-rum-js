#!/usr/bin/env bash
docker-compose -f ./dev-utils/docker-compose.yml up \
  --abort-on-container-exit \
  --exit-code-from node-puppeteer \
  --remove-orphans \
  node-puppeteer
