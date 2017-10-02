import React, {Component} from 'react';
import Graph, {Node} from '../index';
import Links from './Links';
import Header from './Header';
import Manager from './Manager';
import CityNode from './nodes/CityNode';

import {connect} from 'react-redux';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            graphJSON: props.graphJSON,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {graphJSON} = this.state;

        if (nextProps.graphJSON && nextProps.graphJSON.label !== graphJSON.label) {
            this.setState({graphJSON: nextProps.graphJSON});
        }
    }

    getNode() {
        const {graphJSON: {label: graphName}} = this.state;

        if (graphName === 'cities') {
            return CityNode;
        }

        return Node;
    }

    render() {
        const {graphJSON} = this.state;
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        const graphName = graphJSON.label;

        return (
            <div className='dotted'>
                <div className='island'>
                    <Header />
                    <Manager />
                    <Links />
                </div>
                <Graph
                    onChange={(json) => { /* console.log(JSON.stringify(json)); */ }}
                    json={graphJSON}
                    scale={0.5}
                    minScale={0.5}
                    width={width}
                    height={height}
                    Node={this.getNode()}
                    shouldContainerFitContent={graphName !== 'cities'}
                />
            </div>
        );
    }
}

export default connect(state => ({
    graphJSON: state.graphJSON,
}))(App);

