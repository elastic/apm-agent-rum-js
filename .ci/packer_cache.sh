# shellcheck disable=SC1091
source /usr/local/bin/bash_standard_lib.sh

ARCH=$(uname -m| tr '[:upper:]' '[:lower:]')

if [ "${ARCH}" != "x86_64" ] ; then
  echo "The existing docker images on ARM are not supported yet."
  exit 0
fi

readonly NODEJS_VERSION="$(cat ./dev-utils/.node-version)"

FLAVOURS="playwright
puppeteer"

if [ -x "$(command -v docker)" ]; then
  for flavour in ${FLAVOURS}
  do
  di="docker.elastic.co/observability-ci/node-${flavour}:${NODEJS_VERSION}"
  (retry 2 docker pull "${di}") || echo "Error pulling ${di} Docker image, we continue"
  docker build --build-arg NODEJS_VERSION="${NODEJS_VERSION}" -t "${di}" .ci/docker/node-"${flavour}"  || echo "Error building ${flavour} Docker image, we continue"
  done
fi
