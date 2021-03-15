#Dockerfile for docker.elastic.co/observability-ci/node-puppeteer:12
# When changing Node version, please build the Docker image for RUM here:
#   https://apm-ci.elastic.co/job/apm-shared/job/apm-docker-images-pipeline/build?delay=0sec
# Remember checking the 'rum' parameter
ARG NODEJS_VERSION
FROM node:${NODEJS_VERSION}

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y \
      google-chrome-unstable \
      libxss1 \
      libxtst6 \
      fonts-ipafont-gothic \
      fonts-wqy-zenhei \
      fonts-thai-tlwg \
      fonts-kacst \
      ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Always put COPY instructions at the end, so that Docker will reuse the above layers on builds
COPY run-test.sh /run-test.sh
