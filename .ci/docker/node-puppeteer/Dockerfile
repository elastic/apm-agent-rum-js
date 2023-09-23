ARG NODEJS_VERSION
FROM ubuntu:jammy
# this second declaration is needed because ARG before FROM works differently. See https://docs.docker.com/compose/compose-file/#args
ARG NODEJS_VERSION

# Install node
 RUN apt-get update && apt-get install -y ca-certificates curl gnupg && \
 mkdir -p /etc/apt/keyrings && \
 curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
 echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODEJS_VERSION.x nodistro main" | \
 tee /etc/apt/sources.list.d/nodesource.list && \
 apt-get update && apt-get install nodejs -y && \
 rm -rf /etc/apt/keyrings && rm /etc/apt/sources.list.d/nodesource.list

# the node-gyp we use is only compatible with Python versions less than 3.10,
# so we need to make sure we use a previous version
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -qq install -y software-properties-common g++ build-essential && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get -qq install -y python3.9

# 4.1 make python 3.9 the default version (for python and for python3)
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get install -y wget && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
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
      fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Always put COPY instructions at the end, so that Docker will reuse the above layers on builds
COPY run-test.sh /run-test.sh