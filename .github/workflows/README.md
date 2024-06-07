## CI/CD

There are 4 main stages that run on GitHub actions:

* Lint
* Test
* Coverage
* Release

There are some other stages that run for every push on the main branches:

* [Microbenchmark](./microbenchmark.yml)

### Scenarios

* Tests should be triggered on branch, tag and PR basis.
* Commits that are only affecting the docs files should not trigger any test or similar stages that are not required.
* Automated release in the CI gets triggered through a GitHub workflow.
* **This is not the case yet**, but if Github secrets are required then Pull Requests from forked repositories won't run any build accessing those secrets. If needed, then create a feature branch.

### How to interact with the CI?

#### On a PR basis

Once a PR has been opened then there are two different ways you can trigger builds in the CI:

1. Commit based
1. UI based, any Elasticians can force a build through the GitHub UI

#### Branches

Every time there is a merge to main or any release branches the whole workflow will compile and test on Linux.

### Release process

This process has been fully automated and it gets triggered manually when running the [release](https://github.com/elastic/apm-agent-java/actions/workflows/release.yml) workflow.

The tag release follows the naming convention: `v.<major>.<minor>.<patch>`, where `<major>`, `<minor>` and `<patch>`.

### OpenTelemetry

Every workflow and its logs are exported to OpenTelemetry traces/logs/metrics. Those details can be seen [here](https://ela.st/oblt-ci-cd-stats) (**NOTE**: only available for Elasticians).

## Bump automation

[updatecli](https://www.updatecli.io/) is the tool we use to automatically bump some of the dependencies related to
the [Elastic Stack versions](./bump-elastic-stack.yml) used for the different tests.
