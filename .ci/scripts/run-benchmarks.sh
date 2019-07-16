#!/usr/bin/env bash

## For debugging purposes only
node --version
npm --version
npx --version
export

npm install
node ./scripts/run-benchmarks.js "$1"
