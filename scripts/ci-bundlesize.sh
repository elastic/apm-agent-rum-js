#!/usr/bin/env bash

# Bash strict mode
set -eo pipefail
trap 's=$?; echo >&2 "$0: Error on line "$LINENO": $BASH_COMMAND"; exit $s' ERR

# Create a tmp dir
WORKSPACE=$(mktemp -d)
BUNDLESIZE_PATH="${WORKSPACE}/bundlesize.txt"

# Execute bundlesize
npm run bundlesize | tee "${BUNDLESIZE_PATH}" || true

# Extract passed and failed
BUNDLESIZE_PASS=$(grep "✔" "${BUNDLESIZE_PATH}" | wc -l) || true
BUNDLESIZE_FAIL=$(grep "✖" "${BUNDLESIZE_PATH}" | wc -l) || true
if [ ! -z "${GITHUB_OUTPUT}" ]; then
  echo "bundlesize_pass=${BUNDLESIZE_PASS}" >> "${GITHUB_OUTPUT}"
  echo "bundlesize_fail=${BUNDLESIZE_FAIL}" >> "${GITHUB_OUTPUT}"
fi

# Cleanup
rm -rf "${WORKSPACE}"
