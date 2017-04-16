import React from 'react';
import ReactDOM from 'react-dom';
import graphJson from './jsons';
import Graph from '../index';

let graph = null;

ReactDOM.render(
    <Graph
        onChange={(json) => { console.log(json); }}
        ref={(component) => { graph = component; }}
        json={graphJson}
    />,
    document.getElementById('container')
);
