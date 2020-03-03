#!/usr/bin/env bash

cat <<EOF
>Environment Vars

USER=$(id)
GOAL=${GOAL}
MODE=${MODE}
SCOPE=${SCOPE}
STACK_VERSION=${STACK_VERSION}
NODE_VERSION=${NODE_VERSION}
YARN_VERSION=${YARN_VERSION}

>Installed tools

NODE=$(node --version)
NPM=$(npm --version)
NPX=$(npx --version)
EOF

cd /app
npm install
npm install puppeteer --unsafe-perm=true --allow-root
set -eo pipefail
npm run ${GOAL}
