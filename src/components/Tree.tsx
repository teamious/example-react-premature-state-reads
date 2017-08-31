import * as React from 'react';
import { NodeValue } from '../data';
import { Node } from './Node';

interface TreeProps {
    onChange: (value: NodeValue[]) => void;
    nodes: NodeValue[];
}

interface TreeState {
    nodes: NodeValue[];
}

export class Tree extends React.Component<TreeProps, TreeState> {
    constructor(props: TreeProps) {
        super(props);
        this.renderNodeOrTree = this.renderNodeOrTree.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            nodes: this.props.nodes
        }
    }

    private renderNodeOrTree(node: NodeValue, index: number): JSX.Element {
        if (node.type === 'Node') {
            return <Node key={node.key} onChange={this.onChange.bind(this, index)} value={node.value as string}/>
        } else {
            return <Tree key={node.key} onChange={this.onChange.bind(this, index)} nodes={node.value as NodeValue[]}/>
        }
    }

    private onChange(index: number, value: string | NodeValue[]) {
        this.setState((state: TreeState, props: TreeProps): TreeState => {
            const nodes = state.nodes.slice()
            const node = {
                ...nodes[index],
                value
            }
            nodes[index] = node;
            props.onChange(nodes);
            return {nodes};
        });
    }

    render() {
        return (
            <div className='tree'>
                {this.state.nodes.map(this.renderNodeOrTree)}
            </div>
        )
    }
}