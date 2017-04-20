import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import graphJson from './jsons/ui.json';
import Graph from '../index';
import Manager from './Manager';

class App extends Component {
    render() {
        const width = document.body.clientWidth;
        const height = document.body.clientHeight - 60;

        return (
            <div style={{height: '100%'}}>
                {/*<Manager />*/}
                <Graph
                    onChange={(json) => { console.log(JSON.stringify(json)); }}
                    json={graphJson}
                    scale={0.5}
                    minScale={0.5}
                    width={width}
                    height={height}
                />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('container'));
