import React, {Component, PropTypes} from 'react';

import Node from '../Node';
import Edge from '../Edge';

import styles from './graph.css';

const maxZoom = 2;
const minZoom = 1;
const zoomStep = 0.1;

export default class Graph extends Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        json: PropTypes.object,
        zoom: PropTypes.number,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        zoom: 1,
        width: 1000,
        height: 800,
    }

    constructor(props) {
        super(props);

        this.parentWidth = document.body.clientWidth;
        this.nodeComponents = [];
        this.edgeComponents = [];

        this.state = {
            json: props.json,
            zoom: Math.max(minZoom, Math.min(props.zoom, maxZoom)),
            viewOffsetX: 0,
            viewOffsetY: 0,

            isDragging: false,
        };
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

    componentWillUpdate(nextProps, nextState) {
        if (nextState.zoom) {
            nextState.zoom = Math.max(minZoom, Math.min(nextState.zoom, maxZoom));
        }
    }

    _onChange(nextNode, nextEdge) {
        const {json} = this.state;
        const {onChange} = this.props;

        if (nextNode) {
            json.nodes = json.nodes.map((node) => (node.id === nextNode.id ? nextNode : node));
        }

        if (nextEdge) {
            json.edges = json.edges.map((edge) => (edge.id === nextEdge.id ? nextEdge : edge));
        }

        if (typeof onChange === 'function') {
            onChange(json);
        }

        this.setState(json);
    }

    _onWhell(event) {
        const {zoom} = this.state;

        this.setState({
            zoom: zoom + (event.deltaY > 0 ? -1 : 1) * zoomStep,
        });
    }

    _onMouseDown(event) {
        this.setState({isDragging: true});
    }

    _onMouseMove(event) {
        const {isDragging, viewOffsetX, viewOffsetY, zoom} = this.state;

        if (!isDragging) {
            return;
        }

        const {width, height} = this.props;
        const {movementX, movementY} = event;
        const maxNegativeOffsetX = width - width * zoom;
        const maxNegativeOffsetY = height - height * zoom;

        let nextViewOffsetX = viewOffsetX + movementX;
        let nextViewOffsetY = viewOffsetY + movementY;

        nextViewOffsetX = nextViewOffsetX < maxNegativeOffsetX ? maxNegativeOffsetX : (nextViewOffsetX > 0 ? 0 : nextViewOffsetX);
        nextViewOffsetY = nextViewOffsetY < maxNegativeOffsetY ? maxNegativeOffsetY : (nextViewOffsetY > 0 ? 0 : nextViewOffsetY);

        this.setState({
            viewOffsetX: nextViewOffsetX,
            viewOffsetY: nextViewOffsetY,
        });
    }

    _onMouseUp(event) {
        this.setState({isDragging: false});
    }

    toJSON() {
        return {
            nodes: this.nodeComponents.map(nodeComponent => nodeComponent.toJSON()),
            edges: this.edgeComponents.map(edgeComponent => edgeComponent.toJSON()),
        };
    }

    render() {
        const {width, height} = this.props;
        const {zoom, viewOffsetX, viewOffsetY, isDragging} = this.state;
        const {nodes, edges} = this.state.json;

        const getNodePosition = (node) => ({
            x: node.position && node.position.x * zoom || 100,
            y: node.position && node.position.y * zoom || 100,
        });

        this.nodeComponents = [];
        this.edgeComponents = [];

        return (
            <div 
                className={`${styles.container}`}
                style={{width, height}}
            >
                <div
                    className={`${styles.root} ${styles.root_light}`}
                    style={{
                        width: width * maxZoom,
                        height: height * maxZoom,
                        marginLeft: viewOffsetX,
                        marginTop: viewOffsetY,
                        cursor: isDragging ? 'move' : 'default',
                    }}
                    ref={(element) => { this.graphContainer = element; }}
                    onWheel={(event) => { this._onWhell(event.nativeEvent); }}
                    onMouseDown={(event) => { this._onMouseDown(event.nativeEvent); }}
                    onMouseMove={(event) => { this._onMouseMove(event.nativeEvent); }}
                    onMouseUp={(event) => { this._onMouseUp(event.nativeEvent); }}
                >
                
                    <div
                        className={styles.nodes}
                        ref={(element) => { this.htmlContainer = element; }}
                    >
                        {
                            nodes.map((nodeProps, index) => {
                                const props = {
                                    zoom,
                                    key: `node_${nodeProps.id}`,
                                    ref: (component) => this.nodeComponents.push(component),
                                    getGraph: () => this.graphContainer,
                                    onChange: (nodeJSON) => { this._onChange(nodeJSON) },
                                    ...getNodePosition(nodeProps),
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
                                        zoom={zoom}
                                        ref={(component) => this.edgeComponents.push(component)}
                                        sourceId={edgeProps.source}
                                        targetId={edgeProps.target}
                                    />
                                );
                            })
                        }
                    </svg>
                </div>
            </div>
        );
    }
}
