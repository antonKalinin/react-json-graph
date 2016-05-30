import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import classNames from 'classnames/bind';
import styles from './Graph.css'

import NodeComponent from '../Node/Node';
import EdgeComponent from '../Edge/Edge';

let Node = React.createFactory(NodeComponent);
let Edge = React.createFactory(EdgeComponent);

class Graph extends Component {

    constructor(props) {
        super(props);

        if (props.json) {
            this._processJson(props.json);
        }

        this.parentWidth = document.body.clientWidth;
    }

    _processJson(json) {
        this.nodes = json.nodes || [];
        this.edges = json.edges || [];
    }

    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this);
        this.svgEl = this.refs['graph'];
        this.d3El = d3.select(this.svgEl);
        this.parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;

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

    handleClick(event) {
        // deselect all nodes
        this.nodes.forEach((nodeProps, index) => {
            let node = this.refs[`node_${nodeProps.id}`];

            if (node.el === event.target.parentNode) {
                return;
            }
            
            this.refs[`node_${nodeProps.id}`].deselect();
        });
    }

    render() {
        let graph = [];

        let cx = classNames.bind(styles);

        let className = cx({
            root: true,
            root_light: true
        });

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
            <div className={ className }>
                <svg ref="graph" 
                    className={ styles.svg }
                    onClick={ this.handleClick.bind(this) }>{ graph }</svg>
                { this.props.children }
            </div>
        );
    }
}

Graph.propTypes = {
    json: PropTypes.object.isRequired,
};

export default Graph;
