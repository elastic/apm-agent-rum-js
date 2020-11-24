# shellcheck disable=SC1091
source /usr/local/bin/bash_standard_lib.sh

readonly NODEJS_VERSION="$(cat ./dev-utils/.node-version)"

DOCKER_IMAGES="docker.elastic.co/observability-ci/node-playwright:${NODEJS_VERSION}
docker.elastic.co/observability-ci/node-puppeteer:${NODEJS_VERSION}"

if [ -x "$(command -v docker)" ]; then
  for di in ${DOCKER_IMAGES}
  do
  (retry 2 docker pull "${di}") || echo "Error pulling ${di} Docker image, we continue"
  done
fi