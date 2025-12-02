#Dockerfile for docker.elastic.co/observability-ci/node-playwright:${NODEJS_VERSION}
# When changing Node version, please build the Docker image for RUM here:
#   https://apm-ci.elastic.co/job/apm-shared/job/apm-docker-images-pipeline/build?delay=0sec
# Remember checking the 'rum' parameter
# Little bit customized version of microsoft/playwright:noble image
FROM mcr.microsoft.com/playwright:v1.57.0-noble

# 2. Install git (used to tag commit in benchmark runner)
RUN apt-get -qq update && apt-get -qq install -y git --no-install-recommends

# 3. Install Chrome stable to run karma benchmark tests inside puppeteer
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


# 4. Install Browser (Chrome, Firefox and Webkit) dependencies
RUN npx playwright install-deps firefox webkit chrome chromium