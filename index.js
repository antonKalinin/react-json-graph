import React from 'react';
import ReactDOM from 'react-dom';

// Sample project config
import config1 from './jsons/web-service'
import config2 from './jsons/single-graph'

import Graph from './lib';
// You can use your own manager
import Manager from './lib/Manager/Manager';


let config = Math.random() > 0.5 ? config1.graph : config2.graph;

function render() {
    var graph = (
        <Graph json={ config }>
            <Manager />
        </Graph>
    );

    ReactDOM.render(graph, document.getElementById('container'));
}

render();
