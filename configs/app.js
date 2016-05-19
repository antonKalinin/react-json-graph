export default {
    nodes: [
        {
            id: 'balancer1',
            title: 'Balancer #1'
        },
        {
            id: 'nginx1',
            title: 'Front Nginx #1'
        },
        {
            id: 'nginx2',
            title: 'Front Nginx #2'
        },
        {
            id: 'nginx3',
            title: 'Front Nginx #3'
        },
        {
            id: 'node1',
            title: 'Node #1'
        },
        {

            id: 'node2',
            title: 'Node #2'
        },
        {

            id: 'node3',
            title: 'Node #3'
        },
        {
            id: 'balancer2',
            title: 'Balancer #2'
        },
        {
            id: 'back1',
            title: 'Back #1'
        },
        {
            id: 'back2',
            title: 'Back #2'
        },
        {
            id: 'back3',
            title: 'Back #3'
        },
        {
            id: 'mongo1',
            title: 'MongoDB'
        },
        {
            id: 'elastic',
            title: 'Elastic'
        }
    ],
    links: [
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
};