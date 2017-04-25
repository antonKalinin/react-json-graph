import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducers from './reducers';

const app = (
    <Provider store={createStore(reducers)}>
        <App />
    </Provider>
);

ReactDOM.render(app, document.getElementById('container'));
