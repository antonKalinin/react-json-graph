/* @flow */
import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

import reducers from './lib/reducers';
import Graph from './lib/Graph';

export default (props) => (
    <Provider store={createStore(reducers, props.json)}>
        <Graph />
    </Provider>
);
