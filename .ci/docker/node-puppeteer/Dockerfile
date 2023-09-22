ARG NODEJS_VERSION
FROM ubuntu:jammy
# this second declaration is needed because ARG before FROM works differently. See https://docs.docker.com/compose/compose-file/#args
ARG NODEJS_VERSION

# 1. Install node
 RUN apt-get update && apt-get install -y ca-certificates curl gnupg && \
 mkdir -p /etc/apt/keyrings && \
 curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
 echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODEJS_VERSION.x nodistro main" | \
 tee /etc/apt/sources.list.d/nodesource.list && \
 apt-get update && apt-get install nodejs -y && \
 rm -rf /etc/apt/keyrings && rm /etc/apt/sources.list.d/nodesource.list

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y \
      chromium-browser \
      libxss1 \
      libxtst6 \
      libnspr4 \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libgbm1 \
      libasound2 \
      fonts-ipafont-gothic \
      fonts-wqy-zenhei \
      fonts-thai-tlwg \
      fonts-kacst \
      fonts-freefont-ttf \
      libpango-1.0 \
      fonts-liberation \
      libc6 \
      libcairo2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgcc1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcursor1 \
      libxext6 \
      libxrender1 \
      --no-install-recommends

# the node-gyp we use is only compatible with Python versions less than 3.10,
# so we need to make sure we use a previous version
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -qq install -y software-properties-common g++ build-essential && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get -qq install -y python3.9

# 4.1 make python 3.9 the default version (for python and for python3)
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Always put COPY instructions at the end, so that Docker will reuse the above layers on builds
COPY run-test.sh /run-test.sh