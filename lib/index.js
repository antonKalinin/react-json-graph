import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducers from './reducers';

import Graph from './Graph/Graph';

/**
 * Wrapped Graph component with Redux Provider component to 
 * pass store down to all graph components (nodes, edges, manager)
 */
export default (props) => {
    return (
        <Provider store={createStore(reducers, props.json)}>
            <Graph>
                { props.children }
            </Graph>
        </Provider>
    );
}
