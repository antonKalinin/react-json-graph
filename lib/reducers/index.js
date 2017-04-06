export default function reducers(state = {}, action) {
    switch (action.type) {
    case 'NODE_IS_SELECTED':
        return state;
    case 'NODE_IS_DESELECTED':
        return state;
    default:
        return state;
    }
}
