#!/usr/bin/env bash
npm install
npm run lint
echo "Commitlint ..."
scripts/lint-commits.sh
