import React from 'react';
import ReactDOM from 'react-dom';

// Sample project config
import graphJson from './jsons';

import Graph from './lib';


function render() {
    const graph = (
        <div>
            <Graph json={graphJson} />
        </div>
    );

    ReactDOM.render(graph, document.getElementById('container'));
}

render();
