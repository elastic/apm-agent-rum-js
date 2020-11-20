#!/usr/bin/env bash
docker-compose -f ./dev-utils/docker-compose.yml --log-level INFO pull --quiet --ignore-pull-failures
docker-compose -f ./dev-utils/docker-compose.yml --log-level INFO build --force-rm >docker-compose.log 2>docker-compose.err
if [ $? -gt 0 ] ; then
  echo "Docker compose failed, see the below log output"
  cat docker-compose.log && rm docker-compose.log
  cat docker-compose.err && rm docker-compose.err
  exit 1
else
  rm docker-compose.log docker-compose.err
fi
