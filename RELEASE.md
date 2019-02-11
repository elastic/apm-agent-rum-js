# Releasing

Before releasing a new version of packages to the NPM and GitHub, Its advisable to follow the below steps in order

- Update the dependencies `npm run clean`
- Bootstrap the deps using `npm run bootstrap`
- Make sure all tests passes `npm run test`

### Releasing all packages

To publish all the packages run `npm run release`. It will run `lerna publish`(we use --independent) so it will prompt the version number for every package.

- Automatically determining a semantic version bump (based on the types of commits landed)
- Creating annonated Git tags for all the packages that has changed since last release
- Generating `CHANGELOG.md` using conventional commit messages.
- Publishing the packages via `npm publish`

**Note: To override the semantic version bump, use `npm run release -- (minor|patch|major)`**

### Releasing single package

To publish a single package, run `npm run release-package -- elastic-apm-js-base` which uses `lerna publish` under the hood to publish single package to NPM

### Releasing artifacts to GitHub

Use `npm run release-github` in the root directory, the script takes care of building, testing the `elastic-apm-js-base` package and creating a release in GitHub with the previous annonated tag.

**Note: Make sure you pass the GITHUB_TOKEN (with push access) in your environment variable while releasing**
