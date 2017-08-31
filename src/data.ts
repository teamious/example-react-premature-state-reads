export interface NodeValue {
    key: number;
    type: 'Node' | 'Tree';
    value: string | NodeValue[];
}

export const data: NodeValue[] = [
    {
        key: 1,
        type: 'Node',
        value: 'Andrew'
    },
    {
        key: 2,
        type: 'Node',
        value: 'Brooke',
    },
    {
        key: 3,
        type: 'Tree',
        value: [
            {
                key: 4,
                type: 'Node',
                value: 'Dan'
            },
            {
                key: 5,
                type: 'Node',
                value: 'Erick',
            },
        ]
    }
]