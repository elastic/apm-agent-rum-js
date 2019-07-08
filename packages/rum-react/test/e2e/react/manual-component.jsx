import React from 'react'
import { withTransaction } from '../../../src';


class ManualComponent extends React.Component {
    constructor(props, state) {
        super(props, state)
        this.state = {
            userName: ''
        }
    }

    componentDidMount() {
        this.fetchData()
    }
    fetchData() {
        var url = '/test/e2e/react/data.json'
        fetch(url)
            .then(resp => {
                return resp.json()
            })
            .then(data => {
                this.setState({ userName: data.userName })
            })
    }
    render() {
        return (
            <div>
                Manual
            </div>
        )
    }
}


export default withTransaction('ManualComponent', 'component')(ManualComponent)