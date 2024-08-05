#!/usr/bin/env bash
export NODEJS_VERSION=$(cat .nvmrc)
export STACK_VERSION=${STACK_VERSION:-8.6.1}

STACK_VERSION=${STACK_VERSION} \
docker --log-level INFO compose -f ./dev-utils/docker-compose.yml pull --quiet --ignore-pull-failures

# We are building the images here even though the Docker images are already cached in Packer.
# This is because there could be changes in the PR affecting the files copied to the Docker image,
# which we want to test in the current build.
NODEJS_VERSION="${NODEJS_VERSION}" \
STACK_VERSION=${STACK_VERSION} \
docker --log-level INFO compose -f ./dev-utils/docker-compose.yml build >docker-compose.log 2>docker-compose.err
if [ $? -gt 0 ] ; then
  echo "Docker compose failed, see the below log output"
  cat docker-compose.log && rm docker-compose.log
  cat docker-compose.err && rm docker-compose.err
  exit 1
else
  rm docker-compose.log docker-compose.err
fi
