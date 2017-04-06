import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import d3 from 'd3';
import classNames from 'classnames/bind';
import styles from './styles.css';

import Node from '../Node';
import Edge from '../Edge';

class Graph extends Component {

    static propTypes = {
        nodes: PropTypes.array,
        edges: PropTypes.array,
    }

    constructor(props) {
        super(props);

        this.parentWidth = document.body.clientWidth;
    }

    componentDidMount() {
        const {nodes, edges} = this.props;
        const {offsetTop, offsetLeft} = this.graphContainer;

        this.d3Container = d3.select(this.svgContainer);
        this.parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;

        // Draw edges between nodes
        edges.forEach((edge) => {
            const sourceNode = this.refs[`node_${edge.source}`];
            const targetNode = this.refs[`node_${edge.target}`];
            const edgeComponent = this.refs[`edge_${edge.source}_${edge.target}`];

            if (sourceNode && targetNode && edgeComponent) {
                edgeComponent.build(sourceNode, targetNode);
                sourceNode.addEdge('output', edgeComponent);
                targetNode.addEdge('input', edgeComponent);
            }
        });

        nodes.forEach((node) => {
            const nodeComponent = this.refs[`node_${node.id}`];

            nodeComponent.setGraphOffset(offsetLeft, offsetTop);
        });
    }

    handleClick(event) {
        // deselect all nodes
        this.props.nodes.forEach((nodeProps) => {
            const node = this.refs[`node_${nodeProps.id}`];

            if (node.el === event.target.parentNode) {
                return;
            }

            this.refs[`node_${nodeProps.id}`].deselect();
        });
    }

    render() {
        const {nodes, edges} = this.props;
        const cx = classNames.bind(styles);
        const className = cx({
            root: true,
            root_light: true,
            root_dark: false,
        });

        const getNodePosition = (node, index) => ({
            x: (node.position && node.position.x) || Math.min(index * (90 + Math.floor(Math.random() * 10)) + 50, this.parentWidth - 100),
            y: (node.position && node.position.y) || Math.floor(Math.random() * 500),
        });

        return (
            <div
                className={className}
                ref={(element) => this.graphContainer = element}
            >
                <div
                    className={styles.nodes}
                    ref={(element) => this.htmlContainer = element}
                >
                    {
                        nodes.map((nodeProps, index) => {
                            const id = 'node_' + nodeProps.id;

                            return <Node ref={id} key={id} {...getNodePosition(nodeProps, index)} {...nodeProps} />;
                        })
                    }
                </div>
                <svg
                    ref={(element) => this.svgContainer = element}
                    className={styles.svg}
                    onClick={this.handleClick.bind(this)}
                >
                    {
                        edges.map((edgeProps) => {
                            const id = `edge_${edgeProps.source}_${edgeProps.target}`;

                            return <Edge ref={id} key={id} sourceId={edgeProps.source} targetId={edgeProps.target} />;
                        })
                    }
                </svg>
            </div>
        );
    }
}

export default connect(state => ({
    nodes: state.nodes,
    edges: state.edges,
}))(Graph);
