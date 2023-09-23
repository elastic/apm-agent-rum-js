#Dockerfile for docker.elastic.co/observability-ci/node-playwright:${NODEJS_VERSION}
# When changing Node version, please build the Docker image for RUM here:
#   https://apm-ci.elastic.co/job/apm-shared/job/apm-docker-images-pipeline/build?delay=0sec
# Remember checking the 'rum' parameter
# Little bit customized version of microsoft/playwright:bionic image
ARG NODEJS_VERSION
FROM ubuntu:bionic
# this second declaration is needed because ARG before FROM works differently. See https://docs.docker.com/compose/compose-file/#args
ARG NODEJS_VERSION

# 1. Install node
RUN apt-get -qq update && apt-get -qq install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get -qq install -y nodejs

# 2. Install git (used to tag commit in benchmark runner)
RUN apt-get -qq install -y git --no-install-recommends

# 3. Install Browser (Chrome, Firefox and Webkit) dependencies
RUN apt-get -qq install -y  --no-install-recommends \
    fonts-liberation \
    libasound2  \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libegl1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    xvfb \
    fonts-noto-color-emoji \
    ttf-unifont \
    libfontconfig \
    libfreetype6 \
    xfonts-cyrillic \
    xfonts-scalable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-tlwg-loma-otf \
    ttf-ubuntu-font-family \
    ffmpeg \
    libcairo-gobject2 \
    libdbus-glib-1-2 \
    libfontconfig1 \
    libgdk-pixbuf2.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libxcb-shm0 \
    libxcursor1 \
    libxi6 \
    libxrender1 \
    libxt6 \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    libbrotli1 \
    libenchant1c2a \
    libepoxy0 \
    libevdev2 \
    libgl1 \
    libgles2 \
    libgstreamer-gl1.0-0 \
    libgstreamer1.0-0 \
    libharfbuzz-icu0 \
    libharfbuzz0b \
    libhyphen0 \
    libicu60 \
    libjpeg-turbo8 \
    libnotify4 \
    libopenjp2-7 \
    libopus0 \
    libpng16-16 \
    libsecret-1-0 \
    libvpx5 \
    libwayland-client0 \
    libwayland-egl1 \
    libwayland-server0 \
    libwebp6 \
    libwebpdemux2 \
    libwoff1 \
    libxkbcommon0 \
    libxml2 \
    libxslt1.1

# 4. Install Chrome stable to run karma benchmark tests inside puppeteer
# before we were using the Chrome unstable, but with the unstable one the benchmarks were failing, karma launcher was crashing.
# The error was "Cannot start ChromeHeadless", no more details were provided by the tool.
RUN apt-get -qq install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get -qq update  \
    && apt-get -qq install -y \
        google-chrome-stable \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        --no-install-recommends
