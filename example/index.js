import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import graphJson from './jsons';
import Graph from '../index';
import Manager from './Manager';

class App extends Component {
    render() {
        return (
            <div style={{height: '100%'}}>
                <Manager />
                <Graph
                    onChange={(json) => { console.log(JSON.stringify(json)); }}
                    json={graphJson}
                    zoom={1}
                />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('container'));
