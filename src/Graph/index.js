import React, {Component, PropTypes} from 'react';

import Node from '../Node';
import Edge from '../Edge';

import styles from './graph.css';

export default class Graph extends Component {

    static propTypes = {
        json: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.parentWidth = document.body.clientWidth;
        this.nodeComponents = [];
        this.edgeComponents = [];
    }

    componentDidMount() {
        this.parentWidth = this.graphContainer.parentNode.clientWidth;

        const findNode = (edgeId) => (node) => node.id === edgeId;

        // Draw edges between nodes
        this.edgeComponents.forEach((edgeComponent) => {
            const sourceNode = this.nodeComponents.find(findNode(edgeComponent.sourceId));
            const targetNode = this.nodeComponents.find(findNode(edgeComponent.targetId));

            if (sourceNode && targetNode) {
                edgeComponent.build(sourceNode, targetNode);
                sourceNode.addEdge('output', edgeComponent);
                targetNode.addEdge('input', edgeComponent);
            }
        });
    }

    render() {
        const {nodes, edges} = this.props.json;

        const getNodePosition = (node, index) => ({
            x: (node.position && node.position.x) || Math.min(index * (90 + Math.floor(Math.random() * 10)) + 50, this.parentWidth - 100),
            y: (node.position && node.position.y) || Math.floor(Math.random() * 500),
        });

        this.nodeComponents = [];
        this.edgeComponents = [];

        return (
            <div
                className={`${styles.root} ${styles.root_light}`}
                ref={(element) => { this.graphContainer = element; }}
            >
                <div
                    className={styles.nodes}
                    ref={(element) => { this.htmlContainer = element; }}
                >
                    {
                        nodes.map((nodeProps, index) => {
                            const props = {
                                key: `node_${nodeProps.id}`,
                                ref: (component) => this.nodeComponents.push(component),
                                getGraph: () => this.graphContainer,
                                ...getNodePosition(nodeProps, index),
                                ...nodeProps,
                            };

                            return <Node {...props} />;
                        })
                    }
                </div>
                <svg
                    ref={(element) => { this.svgContainer = element; }}
                    className={styles.svg}
                >
                    {
                        edges.map((edgeProps) => {
                            const id = `edge_${edgeProps.source}_${edgeProps.target}`;

                            return (
                                <Edge
                                    key={id}
                                    ref={(component) => this.edgeComponents.push(component)}
                                    sourceId={edgeProps.source}
                                    targetId={edgeProps.target}
                                />
                            );
                        })
                    }
                </svg>
            </div>
        );
    }
}
