#!/usr/bin/env bash
set -xeo pipefail

# Run if we're not on Jenkins
if [[ -n "${JENKINS_URL}" ]]; then
  export PATH=$(npm bin):${PATH}
  export HOME=$(pwd)
  if [[ -z "${CHANGE_ID}" ]]; then
    # If on master, just test the latest commit
    commitlint --from="${GIT_SHA}~1"
  else
    # If on a branch, test all commits between this branch and master
    commitlint --from="origin/${CHANGE_TARGET}" --to="${GIT_BASE_COMMIT}"

    # Lint PR title
    if [[ -n ${CHANGE_TITLE} ]]; then
      titleLength=$(echo -n "${CHANGE_TITLE}" | wc -c)
      titleResult=0
      if [ "${titleLength}" -ge 65 ] ; then
        echo "PR title has a long comment. This will fail when squashing and merging the Pull Request"
        titleResult=1
      fi
      echo "${CHANGE_TITLE}" | commitlint
      exit ${titleResult}
    fi
  fi
# Run if we're not on Travis
elif [[ -z "$CI" ]]; then
  GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

  if [[ "$GIT_BRANCH" == "master" ]]; then
    # If on master, just test the latest commit
    commitlint --edit
  else
    # If on a branch, test all commits between this branch and master
    commitlint --from=master
  fi
fi
