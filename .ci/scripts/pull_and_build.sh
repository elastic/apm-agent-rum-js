#!/usr/bin/env bash
docker-compose -f ./dev-utils/docker-compose.yml --log-level INFO pull --quiet --ignore-pull-failures
docker-compose -f ./dev-utils/docker-compose.yml --log-level INFO build --quiet --force-rm
