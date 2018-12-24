export MODE=saucelabs
export SAUCE_USERNAME=elastic-apm-base
export SAUCE_ACCESS_KEY=4b6720f1-ecdc-448d-85be-ebf947e14507

echo $MODE

npm run buildE2eBundles && node ./scripts/run-script.js runE2eLocal
