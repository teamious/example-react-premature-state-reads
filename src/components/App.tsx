import * as React from 'react';
import { data, NodeValue } from '../data';
import { Tree } from './Tree';

interface AppState {
    nodes: NodeValue[];
}

export class App extends React.Component<{}, AppState> {
    constructor() {
        super()
        this.onChange = this.onChange.bind(this);
        this.state = {
            nodes: data
        }
    }

    private onChange(nodes: NodeValue[]) {
        this.setState({
            nodes
        })
    }

    render() {
        return (
            <Tree onChange={this.onChange} nodes={this.state.nodes}/>
        );
    }
}
