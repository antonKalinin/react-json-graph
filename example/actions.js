/* global history */

export function setGraph(graphName) {
    if (history && history.pushState) {
        history.pushState(null, null, `#${graphName}`);
    }

    return {
        type: 'UPDATE_GRAPH_JSON',
        graphName,
    };
}
