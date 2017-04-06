/* @flow */
import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducers from './reducers';

import Graph from './Graph';

export default (props) => (
    <Provider store={createStore(reducers, props.json)}>
        <Graph />
    </Provider>
);

