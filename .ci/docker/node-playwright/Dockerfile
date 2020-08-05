# Little bit customized version of microsoft/playwright:bionic image

FROM ubuntu:bionic

# 1. Install node12
RUN apt-get -qq update && apt-get -qq install -y curl && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get -qq install -y nodejs

# 2. Install git (used to tag commit in benchmark runner)
RUN apt-get -qq install -y git --no-install-recommends

# 3. Install WebKit dependencies
RUN apt-get -qq install -y  --no-install-recommends \
    libwoff1 \
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
    libvpx5 \
    libxcomposite1 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libepoxy0 \
    libgtk-3-0 \
    libharfbuzz-icu0 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    gstreamer1.0-plugins-good

# 4. Install Chromium dependencies
RUN apt-get install -y --no-install-recommends \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-noto-color-emoji \
    libxtst6

# 5. Install Chrome unstable to run karma benchmark tests inside puppeteer
RUN apt-get -qq install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get -qq update  \
    && apt-get -qq install -y \
        google-chrome-unstable \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        --no-install-recommends

# 6. Install Firefox dependencies
RUN apt-get install -y --no-install-recommends \
    libdbus-glib-1-2 \
    libxt6