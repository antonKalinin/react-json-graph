export default function reducers(state = {}, action) {
    console.log(action, state);

    switch (action.type) {
        case 'NODE_IS_SELECTED':
            return state;
        case 'NODE_IS_DESELECTED':
            return state - 1;
        default:
            return state;
    }
}
