# Releasing

Before releasing a new version of packages to the NPM and GitHub, Set all the environment variables necessary for the testing and release scripts. The required variables are
- APM_SERVER_URL
- GITHUB_TOKEN

```
$ GITHUB_TOKEN=<token> APM_SERVER_URL=<server-url> npm run release
```

### Releasing all packages

To publish all the packages run `npm run release` with the required environment variables. It will run `lerna publish`(we use --independent) so it will prompt the version number for every package.

- Automatically determining a semantic version bump (based on the types of commits landed)
- Creating annotated Git tags for all the packages that has changed since last release
- Generating `CHANGELOG.md` using conventional commit messages.
- Publishing the packages via `npm publish`

**Note: To override the semantic version bump, use `npm run release -- (minor|patch|major)`**

### Releasing single package

To publish a single package, run `npm run release-package -- @elastic/apm-rum` which uses `lerna publish` under the hood to publish single package to NPM

### Releasing artifacts to GitHub

Use `npm run github-release` in the root directory, the script takes care packaging and creating a release for `@elastic/apm-rum` in GitHub with the previous annonated tag.

**Note: Make sure you pass the GITHUB_TOKEN (with push access) in your environment variable while releasing**

### Documentation for releases

Before releasing, be sure to update the following documentation:

- Update `CHANGELOG.asciidoc` to add release notes for the new version. Headings should follow this format: `==== x.x.x (yyyy-MM-dd)`.
- For Major and minor releases: Add a new row to the EOL table in `docs/upgrading.asciidoc`. The EOL date is the release date plus 18 months.