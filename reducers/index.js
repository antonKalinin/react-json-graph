export default function counter(state = 0, action) {
    switch (action.type) {
        case 'ENABLE':
            return state + 1;
        case 'DISAVLE':
            return state - 1;
        default:
            return state;
    }
}
