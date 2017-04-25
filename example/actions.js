export function setGraph(graphName) {
    return {
        type: 'UPDATE_GRAPH_JSON',
        graphName,
    };
}
