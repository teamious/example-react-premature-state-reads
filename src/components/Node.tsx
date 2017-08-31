import * as React from 'react';

interface NodeProps {
    onChange: (value: string) => void;
    value: string;
}

export class Node extends React.Component<NodeProps, {}> {
    componentDidMount() {
        this.props.onChange(this.props.value + this.props.value);
    }

    render() {
        return (
            <div className='node'>
                {this.props.value}
            </div>
        )
    }
}