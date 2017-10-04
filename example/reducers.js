/* global location */

import graphs from './graphs';

let graph = null;

if (location.hash.length > 0) {
    graph = graphs[location.hash.slice(1)];
}

export default function reducers(state = {
    scale: 1,
    grapsNames: Object.keys(graphs),
    graphJSON: graph || graphs.components,
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
