import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import styles from './Graph.css'

import NodeComponent from '../Node/Node';
import LinkComponent from '../Link/Link';

let Node = React.createFactory(NodeComponent);
let Link = React.createFactory(LinkComponent);

class Graph extends Component {

    constructor(props) {
        super(props);

        this.nodes = props.nodes || [];
        this.links = props.links || [];
        this.parentWidth = document.getElementById('root').clientWidth;
    }

    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this);
        this.d3El = d3.select(ReactDOM.findDOMNode(this));

        // Draw links between nodes
        this.links.forEach((linksProps) => {
            let sourceNode = this.refs[`node_${linksProps.source}`];
            let targetNode = this.refs[`node_${linksProps.target}`];
            let link = this.refs[`link_${linksProps.source}_${linksProps.target}`];

            if (sourceNode && targetNode && link) {
                link.build(sourceNode, targetNode);
                sourceNode.addLink('output', link);
                targetNode.addLink('input', link);
            }
        });
    }

    componentWillUnmount() {
        d3Chart.destroy(this.d3El);
    }

    render() {
        let graph = [];

        this.links.forEach((linkProps) => {
            graph.push(Link({ref: `link_${linkProps.source}_${linkProps.target}`}));
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
