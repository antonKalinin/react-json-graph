export default {
    nodes: [{
        id: '0',
        label: 'User',
        position: {x: 150, y: 250},
    },
    {
        id: '1',
        label: 'Robot',
        position: {x: 350, y: 350},
    },
    {
        id: '2',
        label: 'Frontend',
        position: {x: 400, y: 150},
        inputs: {
            id: '1',
            label: 'HTTP',
        },
    },
    {
        id: '3',
        label: 'Backend',
        position: {x: 700, y: 250},
    },
    {
        id: '4',
        label: 'DB',
        position: {x: 1000, y: 300},
    }],
    edges: [
        {source: '0', target: '2'},
        {source: '1', target: '3'},
        {source: '2', target: '3'},
        {source: '3', target: '4'},
    ],
};
