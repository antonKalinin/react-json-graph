export default {
    graph: {
        label: 'Web Service Schema',
        nodes: [
            {
                id: 'balancer1',
                label: 'Balancer #1'
            },
            {
                id: 'nginx1',
                label: 'Front Nginx #1'
            },
            {
                id: 'nginx2',
                label: 'Front Nginx #2'
            },
            {
                id: 'nginx3',
                label: 'Front Nginx #3'
            },
            {
                id: 'node1',
                label: 'Node #1'
            },
            {

                id: 'node2',
                label: 'Node #2'
            },
            {

                id: 'node3',
                label: 'Node #3'
            },
            {
                id: 'balancer2',
                label: 'Balancer #2'
            },
            {
                id: 'back1',
                label: 'Back #1'
            },
            {
                id: 'back2',
                label: 'Back #2'
            },
            {
                id: 'back3',
                label: 'Back #3'
            },
            {
                id: 'mongo1',
                label: 'MongoDB'
            },
            {
                id: 'elastic',
                label: 'Elastic'
            }
        ],
        edges: [
            { source: 'balancer1', target: 'nginx1'},
            { source: 'balancer1' , target: 'nginx2'},
            { source: 'balancer1', target: 'nginx3'},

            { source: 'nginx1', target: 'node1'},
            { source: 'nginx2', target: 'node2'},
            { source: 'nginx3', target: 'node3'},

            { source: 'node1', target: 'balancer2'},
            { source: 'node2', target: 'balancer2'},
            { source: 'node3', target: 'balancer2'},

            { source: 'balancer2', target: 'back1'},
            { source: 'balancer2', target: 'back2'},
            { source: 'balancer2', target: 'back3'},

            { source: 'back1', target: 'mongo1'},
            { source: 'back2', target: 'mongo1'},
            { source: 'back3', target: 'mongo1'},

            { source: 'back1', target: 'elastic'},
            { source: 'back2', target: 'elastic'},
            { source: 'back3', target: 'elastic'},
        ]
    }
};