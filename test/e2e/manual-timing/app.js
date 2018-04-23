import { init as initApm } from '../../..'

var apm = initApm({

  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'manual-timing',

  // Set custom APM Server URL (default: http://localhost:8200)
  // serverUrl: '',
  hasRouterLibrary: true,
  sendNavigationTimingTransaction: false,
  operationMode: 'manual',
// Set service version (required for sourcemap feature)
// serviceVersion: ''
})

var tr = apm.startTransaction('tr-name1', 'tr-type')
tr.addTask('load-event')
window.addEventListener('load', function () {
  setTimeout(() => {
    tr.addNavigationTimingMarks()
    tr.removeTask('load-event')
  })
})

var span = tr.startSpan('span-name', 'span-type')
span.end()

var url = '/test/e2e/react/data.json?test=hamid'
var httpSpan = tr.startSpan('FETCH ' + url, 'http')
fetch(url)
  .then(() => {
    httpSpan.end()
  })
