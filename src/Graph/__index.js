/* @flow */
/* 
    global document Math
    SyntheticWheelEvent SyntheticMouseEvent WheelEvent MouseEvent 
*/
import React, {Component} from 'react';
import type {ElementRef as ReactElementRef} from 'react';
import hash from 'hash.js';

import Node from '../Node';
import Edge from '../Edge';

import type {NodeJsonType} from '../types';

import styles from './graph.css';

const SCALE_MAX = 1;
const SCALE_MIN = 0.3;
const SCALE_STEP = 0.1;

type Props = {
    json: any,

    width: number,
    height: number,
    scale: number,
    minScale: number,
    maxScale: number,

    onChange: (any) => void,
    style: any,
};

type State = {
    json: any,

    minScale: number,
    maxScale: number,
    scale: number,

    viewOffsetX: number,
    viewOffsetY: number,
    viewOffsetOriginX: number,
    viewOffsetOriginY: number,

    isDragging: boolean,
};

export default class Graph extends Component<Props, State> {
    parentWidth: number;
    svgContainer: ReactElementRef<'svg'>;
    htmlContainer: ?ReactElementRef<'div'>;
    graphContainer: ?ReactElementRef<'div'>;
    nodeComponents: Array<ReactElementRef<typeof Node>>;
    edgeComponents: Array<ReactElementRef<typeof Edge>>;

    static defaultProps = {
        scale: 1,
        minScale: 1,
        maxScale: 1,
        width: 600,
        height: 400,
        style: {},
    }

    constructor(props: Props) {
        super(props);

        this.parentWidth = document.body ? document.body.clientWidth : 0;
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
        this.parentWidth = this.graphContainer && this.graphContainer.parentNode
            ? this.graphContainer.parentNode.clientWidth
            : 0;

        this._drawEdges();
    }

    componentWillReceiveProps(nextProps: Props) {
        const {json} = this.state;
        if (nextProps.json && nextProps.json.label !== json.label) {
            this.setState({json: nextProps.json}, () => {
                this._drawEdges();
            });
        }
    }

    componentWillUpdate(nextProps: Props, nextState: State) {
        const {minScale, maxScale} = this.state;

        if (nextState.scale) {
            nextState.scale = Math.max(minScale, Math.min(nextState.scale, maxScale));
        }
    }

    _drawEdges() {
        const findNode = (edgeId: string) => (node: ReactElementRef<typeof Node>) => node.id === edgeId;

        // Draw edges between nodes
        this.edgeComponents.forEach((edgeComponent: ReactElementRef<typeof Edge>) => {
            const sourceNode = this.nodeComponents.find(findNode(edgeComponent.sourceId));
            const targetNode = this.nodeComponents.find(findNode(edgeComponent.targetId));

            if (sourceNode && targetNode) {
                edgeComponent.build(sourceNode, targetNode);
                sourceNode.addEdge('output', edgeComponent);
                targetNode.addEdge('input', edgeComponent);
            }
        });
    }

    _onChange(nextNode: NodeJsonType) {
        const {json} = this.state;
        const {onChange} = this.props;

        if (nextNode) {
            json.nodes = json.nodes.map(
                (node: NodeJsonType) => (node.id === nextNode.id ? nextNode : node)
            );
        }

        if (typeof onChange === 'function') {
            onChange(json);
        }

        this.setState(json);
    }

    _onWhell(event: WheelEvent) {
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
        const nextScale = parseFloat((scale + (direction * SCALE_STEP)).toPrecision(2));
        const scaleDelta = (scale - minScale) / SCALE_STEP;

        if (nextScale > maxScale || nextScale < minScale) {
            return;
        }

        const nextState = {scale: nextScale};

        if (scaleDelta) {
            nextState.viewOffsetX = viewOffsetX - ((Math.abs(viewOffsetOriginX) - Math.abs(viewOffsetX)) / scaleDelta);
            nextState.viewOffsetY = viewOffsetY - ((Math.abs(viewOffsetOriginY) - Math.abs(viewOffsetY)) / scaleDelta);
        }

        this.setState(nextState);
    }

    _onMouseDown(event: MouseEvent) {
        // only left mouse button
        if (event.button !== 0) return;

        this.setState({isDragging: true});
    }

    _onMouseMove(event: MouseEvent) {
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

    _onMouseUp() {
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

        const getNodePosition = (node: NodeJsonType) => ({
            x: node.position ? node.position.x : 100,
            y: node.position ? node.position.y : 100,
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
                    ref={(element: ReactElementRef<'div'>) => { this.graphContainer = element; }}
                    onWheel={(event: SyntheticWheelEvent<>) => { this._onWhell(event.nativeEvent); }}
                    onMouseDown={(event: SyntheticMouseEvent<>) => { this._onMouseDown(event.nativeEvent); }}
                    onMouseMove={(event: SyntheticMouseEvent<>) => { this._onMouseMove(event.nativeEvent); }}
                    onMouseUp={() => { this._onMouseUp(); }}
                >
                    <div
                        className={styles.nodes}
                        ref={(element: ReactElementRef<'div'>) => { this.htmlContainer = element; }}
                    >
                        {
                            nodes.map((nodeProps) => {
                                const nodeHash = hash.sha256().update(JSON.stringify(nodeProps)).digest('hex');

                                const props = {
                                    scale,
                                    hash: nodeHash,
                                    key: `node_${nodeProps.id}`,
                                    ref: (component: ReactElementRef<typeof Node>) =>
                                        component && this.nodeComponents.push(component),
                                    getGraph: () => this.graphContainer,
                                    onChange: (nodeJSON) => { this._onChange(nodeJSON); },
                                    ...getNodePosition(nodeProps),
                                    ...nodeProps,
                                };

                                return <Node {...props} />;
                            })
                        }
                    </div>
                    <svg
                        ref={(element: ReactElementRef<'svg'>) => { this.svgContainer = element; }}
                        className={styles.svg}
                    >
                        {
                            edges.map((edgeProps) => {
                                const id = `edge_${edgeProps.source}_${edgeProps.target}`;

                                return (
                                    <Edge
                                        key={id}
                                        scale={scale}
                                        ref={(component: ReactElementRef<typeof Edge>) =>
                                            component && this.edgeComponents.push(component)}
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
