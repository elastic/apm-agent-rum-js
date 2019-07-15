#!/usr/bin/env bash
docker-compose -f ./dev-utils/docker-compose.yml pull --ignore-pull-failures
docker-compose -f ./dev-utils/docker-compose.yml build --force-rm
