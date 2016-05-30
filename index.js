import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import counter from './reducers';

// Sample project config
import config1 from './examples/web-service'
import config2 from './examples/single-graph'

import Graph from './components/Graph/Graph';
import Manager from './components/Manager/Manager';

const store = createStore(counter);

let config = Math.random() > 0.5 ? config1.graph : config2.graph;

function render() {
    var graph = (
        <Graph store={ store } json={ config }>
            <Manager />
        </Graph>
    );

    ReactDOM.render(graph, document.getElementById('container'));
}

render();

// Render in case store is changed
store.subscribe(render);
