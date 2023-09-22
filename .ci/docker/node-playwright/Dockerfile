# Little bit customized version of microsoft/playwright:bionic image
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

# 2. Install Browser (Chrome, Firefox and Webkit) dependencies
RUN apt-get -qq install -y  --no-install-recommends \
    fonts-liberation \
    libasound2  \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libpango-1.0 \
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
    fonts-unifont \
    libfontconfig \
    libfreetype6 \
    xfonts-cyrillic \
    xfonts-scalable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-tlwg-loma-otf \
    fonts-freefont-ttf \
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
    libenchant-2-dev \
    libepoxy0 \
    libevdev2 \
    libgl1 \
    libgles2 \
    libgstreamer-gl1.0-0 \
    libgstreamer1.0-0 \
    libharfbuzz-icu0 \
    libharfbuzz0b \
    libhyphen0 \
    libicu-dev \
    libjpeg-turbo8 \
    libnotify4 \
    libopenjp2-7 \
    libopus0 \
    libpng16-16 \
    libsecret-1-0 \
    libvpx-dev \
    libwayland-client0 \
    libwayland-egl1 \
    libwayland-server0 \
    libwebp-dev \
    libwebpdemux2 \
    libwoff1 \
    libxkbcommon0 \
    libxml2 \
    libxslt1.1 \
    libc6 \
    libexpat1 \
    libgcc1 \
    libstdc++6 \
    libxss1 \
    libxtst6


# 3. Install Chromium to run karma benchmark tests inside puppeteer
# before we were using the Chrome unstable, but with the unstable one the benchmarks were failing, karma launcher was crashing.
# The error was "Cannot start ChromeHeadless", no more details were provided by the tool.
RUN apt-get -qq install -y \
    chromium-browser \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    --no-install-recommends

# 4. the node-gyp we use is only compatible with Python versions less than 3.10,
# so we need to make sure we use a previous version
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -qq install -y software-properties-common g++ build-essential && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get -qq install -y python3.9

# 4.1 make python 3.9 the default version (for python and for python3)
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1