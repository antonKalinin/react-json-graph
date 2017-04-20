import React, {Component, PropTypes} from 'react';

import Node from '../Node';
import Edge from '../Edge';

import styles from './graph.css';

const SCALE_MAX = 1;
const SCALE_MIN = 0.3;
const SCALE_STEP = 0.1;

export default class Graph extends Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        json: PropTypes.object,
        scale: PropTypes.number,
        onChange: PropTypes.func,
        style: PropTypes.object,
    }

    static defaultProps = {
        scale: 1,
        minScale: 1,
        maxScale: 1,
        width: 600,
        height: 400,
        style: {},
    }

    constructor(props) {
        super(props);

        this.parentWidth = document.body.clientWidth;
        this.nodeComponents = [];
        this.edgeComponents = [];

        const minScale = props.minScale ? Math.max(props.minScale, SCALE_MIN) : SCALE_MIN;
        const maxScale = props.maxScale ? Math.min(props.maxScale, SCALE_MAX) : SCALE_MAX;

        const viewOffsetX = props.width * (minScale - maxScale);
        const viewOffsetY = props.height * (minScale - maxScale);

        this.state = {
            json: props.json,

            minScale,
            maxScale,
            scale: Math.max(minScale, Math.min(props.scale, maxScale)),

            viewOffsetX,
            viewOffsetY,
            viewOffsetOriginX: viewOffsetX,
            viewOffsetOriginY: viewOffsetY,

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
        const {minScale, maxScale} = this.state;

        if (nextState.scale) {
            nextState.scale = Math.max(minScale, Math.min(nextState.scale, maxScale));
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
        const {
            scale,
            minScale,
            maxScale,
            viewOffsetX,
            viewOffsetY,
            viewOffsetOriginX,
            viewOffsetOriginY,
        } = this.state;

        const direction = event.deltaY > 0 ? -1 : 1;
        const nextScale = parseFloat((scale + direction * SCALE_STEP).toPrecision(2));
        const scaleDelta = (scale - minScale) / SCALE_STEP;

        if (nextScale > maxScale || nextScale < minScale) {
            return;
        }

        this.setState(Object.assign({scale: nextScale}, scaleDelta ? {
            viewOffsetX: viewOffsetX - (Math.abs(viewOffsetOriginX) - Math.abs(viewOffsetX)) / scaleDelta,
            viewOffsetY: viewOffsetY - (Math.abs(viewOffsetOriginY) - Math.abs(viewOffsetY)) / scaleDelta,
        } : null));
    }

    _onMouseDown(event) {
        // only left mouse button
        if (event.button !== 0) return;

        this.setState({isDragging: true});
    }

    _onMouseMove(event) {
        const {
            scale,
            maxScale,
            minScale,
            viewOffsetX,
            viewOffsetY,
            isDragging,
            viewOffsetOriginX,
            viewOffsetOriginY,
        } = this.state;

        if (!isDragging) {
            return;
        }

        
        let scaleK = 0; // If scale => scaleMin then scaleK => 1;

        if (maxScale - minScale !== 0) {
            scaleK = (maxScale - scale) / (maxScale - minScale);
        }

        const {movementX, movementY} = event;

        let nextViewOffsetX = viewOffsetX + movementX;
        let nextViewOffsetY = viewOffsetY + movementY;

        const minX = scaleK * viewOffsetOriginX;
        const minY = scaleK * viewOffsetOriginY;
        const maxX = viewOffsetOriginX / (minScale / scale);
        const maxY = viewOffsetOriginY / (minScale / scale);

        nextViewOffsetX = nextViewOffsetX > minX ? minX : nextViewOffsetX;
        nextViewOffsetY = nextViewOffsetY > minY ? minY : nextViewOffsetY;

        nextViewOffsetX = nextViewOffsetX < maxX ? maxX : nextViewOffsetX;
        nextViewOffsetY = nextViewOffsetY < maxY ? maxY : nextViewOffsetY;

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
        const {width, height, style} = this.props;
        const {scale, minScale, viewOffsetX, viewOffsetY, isDragging} = this.state;
        const {nodes, edges} = this.state.json;

        const getNodePosition = (node) => ({
            x: node.position && node.position.x || 100,
            y: node.position && node.position.y || 100,
        });

        this.nodeComponents = [];
        this.edgeComponents = [];

        return (
            <div 
                className={`${styles.container}`}
                style={{width, height}}
            >
                <div
                    className={`${styles.root}`}
                    style={Object.assign(style, {
                        width: width / minScale,
                        height: height / minScale,
                        marginLeft: viewOffsetX,
                        marginTop: viewOffsetY,
                        cursor: isDragging ? 'move' : 'default',
                        transform: `scale(${scale})`,
                        transition: `transform .1s linear${isDragging ? '' : ', margin .1s linear'}`,
                        transformOrigin: `${width}px ${height}px`,
                    })}
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
                            nodes.map((nodeProps) => {
                                const props = {
                                    scale,
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
                                        scale={scale}
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
