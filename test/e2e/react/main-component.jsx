import React from 'react'

import { apm } from '../../..'

class MainComponent extends React.Component {
  constructor (props, state) {
    super(props, state)
    var path = this.props.match.path
    this.state = {
      userName: '',
      path: path
    }
    apm.startTransaction('Main - ' + path, 'route-change')
    this.fetchData()
  }
  fetchData () {
    var transactionService = apm.getTransactionService()
    var url = '/test/e2e/react/data.json'
    var span = transactionService.startSpan('Fetching ' + url, 'xhr')
    var taskId = transactionService.addTask()

    fetch(url)
      .then((resp) => {
        return resp.json()
      }).then((data) => {
        this.setState({ userName: data.userName })
        span.end()
        transactionService.removeTask(taskId)
        transactionService.detectFinish()
      })
  }
  render () {
    return (
      <div>
        <h3>
          <span>{this.state.path}</span>
        </h3>
        <span>{this.state.userName}</span>
      </div>
    )
  }
}

module.exports = MainComponent
