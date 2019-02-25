import React from 'react'

import { apm } from './rum'

class MainComponent extends React.Component {
  constructor(props, state) {
    super(props, state)
    var path = this.props.match.path
    this.state = {
      userName: '',
      path: path
    }
    this.transaction = apm.startTransaction('Main - ' + path, 'route-change')
  }

  componentDidMount() {
    this.fetchData()
    this.transaction.detectFinish()
  }
  fetchData() {
    var url = '/test/e2e/react/data.json'

    fetch(url)
      .then((resp) => {
        var tid = this.transaction.addTask()
        var span = this.transaction.startSpan('Timeout span')
        setTimeout(() => {
          span.end()
          this.transaction.removeTask(tid)
        }, 500);
        return resp.json()
      }).then((data) => {
        this.setState({ userName: data.userName })
      })
  }
  render() {
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
