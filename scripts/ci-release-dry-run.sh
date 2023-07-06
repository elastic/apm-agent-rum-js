#!/usr/bin/env bash

# Bash strict mode
set -eo pipefail
trap 's=$?; echo >&2 "$0: Error on line "$LINENO": $BASH_COMMAND"; exit $s' ERR

# Create a tmp dir
WORKSPACE=$(mktemp -d)
DRYRUN_PATH="${WORKSPACE}/dryrun.txt"

# Setup git env to allow lerna to generate versions properly
git checkout -b dry-run-branch -f
git config user.email "CI email"
git config user.name "CI name"

npm run release-dry-run | tee "${DRYRUN_PATH}" || true

# Extract passed and failed
VERSIONING=$(git log -1 --format="%b")
if [ ! -z "${GITHUB_OUTPUT}" ]; then
  EOF=$(dd if=/dev/urandom bs=15 count=1 status=none | base64)
  echo "DRYRUN_RESPONSE<<$EOF" >> "$GITHUB_OUTPUT"
  echo "dryrun_response=${VERSIONING}" >> "${GITHUB_OUTPUT}"
  echo "$EOF" >> "$GITHUB_OUTPUT"
fi

# Cleanup
rm -rf "${WORKSPACE}"

# exits the temporal branch
git checkout -
