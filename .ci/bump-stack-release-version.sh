#!/usr/bin/env bash
#
# Given the stack version this script will bump the release version.
#
# This script is executed by the automation we are putting in place
# and it requires the git add/commit commands.
#
# Parameters:
#	$1 -> the minor version to be bumped. Mandatory.
#	$1 -> the major version to be bumped. Mandatory.
#
set -euo pipefail
MSG="parameter missing."
VERSION_RELEASE=${1:?$MSG}
VERSION_DEV=${2:?$MSG}

OS=$(uname -s| tr '[:upper:]' '[:lower:]')

if [ "${OS}" == "darwin" ] ; then
	SED="sed -i .bck"
else
	SED="sed -i"
fi

echo "Update stack with versions ${VERSION_RELEASE} and ${VERSION_DEV}"
${SED} -E -e "s#(values '.+-SNAPSHOT',) '[0-9]+\.[0-9]+\.[0-9]+'#\1 '${VERSION_DEV}'#g" Jenkinsfile
${SED} -E -e "s#(defaultValue:) '[0-9]+\.[0-9]+\.[0-9]+'#\1 '${VERSION_RELEASE}'#g" Jenkinsfile
git add Jenkinsfile
for FILE in .ci/scripts/load-testing.sh .ci/scripts/pull_and_build.sh .ci/scripts/test.sh dev-utils/docker-compose.yml ; do
  ${SED} -E -e "s#:-[0-9]+\.[0-9]+\.[0-9]+#:-${VERSION_RELEASE}#g" $FILE
  git add $FILE
done

git diff --staged --quiet || git commit -m "chore: update elastic stack release ${VERSION_RELEASE} and ${VERSION_DEV}"
git --no-pager log -1

echo "You can now push and create a Pull Request"
