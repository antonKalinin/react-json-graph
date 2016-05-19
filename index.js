import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import counter from './reducers';

// Sample project config
import config from './configs/app'

// Components
import ProjectManager from './components/Manager/ProjectManager';
import AppManager from './components/Manager/AppManager';
import Graph from './components/Graph/Graph';

const store = createStore(counter);

const Main = () => {
    return (
        <main className='main'>
            <header className='header'>
                <AppManager store={ store } />
                <ProjectManager store={ store } />
            </header>
            <Graph store={ store } nodes={config.nodes} links={config.links} />
        </main>
    );
};

function render() {
    ReactDOM.render(<Main />, document.getElementById('root'));
}

render();

// Render in case store is changed
store.subscribe(render);
