import React from 'react';
import ReactDOM from 'react-dom';
import graphJson from './jsons';
import Graph from '../index';

ReactDOM.render(<Graph json={graphJson} />, document.getElementById('container'));
