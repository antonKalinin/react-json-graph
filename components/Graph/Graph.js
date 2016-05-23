import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import styles from './Graph.css'

import NodeComponent from '../Node/Node';
import EdgeComponent from '../Edge/Edge';

let Node = React.createFactory(NodeComponent);
let Edge = React.createFactory(EdgeComponent);

class Graph extends Component {

    constructor(props) {
        super(props);

        this.nodes = props.nodes || [];
        this.edges = props.edges || [];
        this.parentWidth = document.getElementById('root').clientWidth;
    }

    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this);
        this.d3El = d3.select(ReactDOM.findDOMNode(this));

        // Draw edges between nodes
        this.edges.forEach((edgesProps) => {
            let sourceNode = this.refs[`node_${edgesProps.source}`];
            let targetNode = this.refs[`node_${edgesProps.target}`];
            let edge = this.refs[`edge_${edgesProps.source}_${edgesProps.target}`];

            if (sourceNode && targetNode && edge) {
                edge.build(sourceNode, targetNode);
                sourceNode.addEdge('output', edge);
                targetNode.addEdge('input', edge);
            }
        });
    }

    componentWillUnmount() {
        d3Chart.destroy(this.d3El);
    }

    render() {
        let graph = [];

        this.edges.forEach((edgeProps) => {
            graph.push(Edge({ref: `edge_${edgeProps.source}_${edgeProps.target}`}));
        });

        this.nodes.forEach((nodeProps, index) => {
            nodeProps.x = Math.min(
                index * (90 + Math.floor(Math.random() * 10)) + 50,
                this.parentWidth - 100);
            nodeProps.y = Math.floor(Math.random() * 500);
            nodeProps.ref = 'node_' + nodeProps.id;

            graph.push(Node(nodeProps));
        });

        return (
            <svg id="graph" className={ styles.root }>{ graph }</svg>
        );
    }
}


export default Graph;
