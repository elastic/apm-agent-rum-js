#Dockerfile for docker.elastic.co/observability-ci/node-puppeteer:12
FROM ubuntu:bionic

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs \
    --no-install-recommends

RUN apt-get install -y git --no-install-recommends

# These dependencies are the ones we have found in:
# https://github.com/arjun27/playwright-github-actions/blob/master/Dockerfile
RUN apt-get install -y libwoff1 \
                       libopus0 \
                       libwebp6 \
                       libwebpdemux2 \
                       libenchant1c2a \
                       libgudev-1.0-0 \
                       libsecret-1-0 \
                       libhyphen0 \
                       libgdk-pixbuf2.0-0 \
                       libegl1 \
                       libnotify4 \
                       libxslt1.1 \
                       libevent-2.1-6 \
                       libgles2 \
                       libgl1 \
                       libegl1 \
                       libvpx5 \
                       # for chromium
                       libnss3 \
                       libxss1 \
                       libasound2 \
                       # for firefox
                       libdbus-glib-1-2 \
                       libxt6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
