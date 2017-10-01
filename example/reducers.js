import graphs from './graphs';

export default function reducers(state = {
    scale: 1,
    grapsNames: Object.keys(graphs),
    graphJSON: graphs.components,
}, action) {
    switch (action.type) {
    case 'UPDATE_GRAPH_JSON':
        return {
            ...state,
            graphJSON: graphs[action.graphName] || {nodes: [], edges: []},
        };
    default:
        return state;
    }
}
