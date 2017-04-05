import React from 'react';
import ReactDOM from 'react-dom';

// Sample project config
import config1 from './jsons/web-service';
import config2 from './jsons/single-graph';

import Graph from './lib';


let config = Math.random() > 0.5 ? config1 : config2;

function render() {
    var graph = (
        <div>
            <Graph json={ config } />
        </div>
    );

    ReactDOM.render(graph, document.getElementById('container'));
}

render();
