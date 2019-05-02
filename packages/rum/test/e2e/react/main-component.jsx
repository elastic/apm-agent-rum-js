/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import React from 'react'

import { apm } from './rum'

class MainComponent extends React.Component {
  constructor(props, state) {
    super(props, state)
    var path = this.props.match.path
    this.state = {
      userName: '',
      path
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
      .then(resp => {
        var tid = this.transaction.addTask()
        var span = this.transaction.startSpan('Timeout span')
        setTimeout(() => {
          span.end()
          this.transaction.removeTask(tid)
        }, 500)
        return resp.json()
      })
      .then(data => {
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

export default MainComponent
