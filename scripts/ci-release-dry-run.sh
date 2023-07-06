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
  echo "if you wanted to release the agent, the versions would be: \n${VERSIONING}" >> "${GITHUB_OUTPUT}"
fi
## also show this on standard output in order to make debuggability easier until we have the comment added in github :)
echo "if you wanted to release the agent, the versions would be: \n${VERSIONING}"


# Cleanup
rm -rf "${WORKSPACE}"

# exits the temporal branch
git checkout -
