/*
    @flow

    global document Math
    SyntheticWheelEvent SyntheticMouseEvent WheelEvent MouseEvent 
*/
import React, {Component} from 'react';
import type {ElementRef as ReactElementRef} from 'react';

import Node from '../Node';
import Edge from '../Edge';

import type {NodeJsonType, EdgeJsonType} from '../types';

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

    shouldContainerFitContent: boolean,
    Node: ReactElementRef<typeof Node>,
    Edge: ReactElementRef<typeof Edge>,

    onChange: (any) => void,
    renderNode: ?() => void,
    style: any,
};

type State = {
    label: string,
    nodes: Array<NodeJsonType>,
    edges: Array<EdgeJsonType>,

    minScale: number,
    maxScale: number,
    scale: number,

    isStatic: boolean,
    isVertical: boolean,
    isDirected: boolean,
    viewOffsetX: number,
    viewOffsetY: number,
    viewOffsetOriginX: number,
    viewOffsetOriginY: number,

    isDragging: boolean,
};

export {Node, Edge};
export default class Graph extends Component<Props, State> {
    parentWidth: number;
    svgContainer: ReactElementRef<'svg'>;
    htmlContainer: ?ReactElementRef<'div'>;
    graphContainer: ?ReactElementRef<'div'>;
    nodeComponents: Array<ReactElementRef<typeof Node>>;

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

        const minScale = props.minScale ? Math.max(props.minScale, SCALE_MIN) : SCALE_MIN;
        const maxScale = props.maxScale ? Math.min(props.maxScale, SCALE_MAX) : SCALE_MAX;

        const viewOffsetX = props.width * (minScale - maxScale);
        const viewOffsetY = props.height * (minScale - maxScale);

        this.state = {
            label: props.json.label,
            nodes: props.json.nodes,
            edges: props.json.edges,
            isStatic: props.json.isStatic || false,
            isVertical: props.json.isVertical || false,
            isDirected: props.json.isDirected || false,

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

        this.setState({nodes: this._getNodesProps()});
    }

    componentWillReceiveProps(nextProps: Props) {
        const {label} = this.state;

        if (nextProps.json && nextProps.json.label !== label) {
            this.setState({
                label: nextProps.json.label,
                nodes: nextProps.json.nodes,
                edges: nextProps.json.edges,
            }, () => {
                this.setState({nodes: this._getNodesProps()});
            });
        }
    }

    componentWillUpdate(nextProps: Props, nextState: State) {
        const {minScale, maxScale} = this.state;

        if (nextState.scale) {
            nextState.scale = Math.max(minScale, Math.min(nextState.scale, maxScale));
        }
    }

    _onChange(nextNode: NodeJsonType) {
        let {nodes} = this.state;
        const {json, onChange} = this.props;

        if (nextNode) {
            nodes = nodes.map((node: NodeJsonType) => (
                node.id === nextNode.id
                    ? {...node, ...nextNode}
                    : node
            ));
        }

        if (typeof onChange === 'function') {
            json.nodes = nodes;
            onChange(json);
        }

        this.setState({nodes});
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

        let scaleK = 0; // if scale => scaleMin then scaleK => 1;

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

    // TODO: Call Node method
    _getNodesProps() {
        return this.nodeComponents.map(({props}) => ({
            id: props.id,
            label: props.label,
            position: {
                x: props.x,
                y: props.y,
            },
            size: {
                width: props.width,
                height: props.height,
            },
        }));
    }

    toJSON() {
        return {
            nodes: this.nodeComponents.map(nodeComponent => nodeComponent.toJSON()),
            edges: this.state.edges,
        };
    }

    renderNode(node: NodeJsonType) {
        const {Node: CustomNode, shouldContainerFitContent} = this.props;
        const {width, height} = node.size || {};
        const {scale, isStatic} = this.state;
        const NodeComponent = CustomNode || Node;

        return (<NodeComponent
            scale={scale}
            key={`node_${node.id}`}
            ref={
                (component: ReactElementRef<typeof Node>) =>
                    component && this.nodeComponents.push(component)
            }
            getGraph={() => this.graphContainer}
            onChange={(nodeJSON: NodeJsonType) => { this._onChange(nodeJSON); }}
            x={node.position ? node.position.x : 0}
            y={node.position ? node.position.y : 0}
            width={width}
            height={height}
            isStatic={isStatic}
            shouldContainerFitContent={shouldContainerFitContent}
            {...node}
        />);
    }

    render() {
        const {Edge: CustomEdge, width, height, style} = this.props;
        const {
            nodes,
            edges,

            isDirected,
            isVertical,
            isDragging,

            scale,
            minScale,
            viewOffsetX,
            viewOffsetY,
        } = this.state;

        const _edges = edges.map((edge: {source: string, target: string}) => ({
            source: nodes.find(node => node.id === edge.source) || null,
            target: nodes.find(node => node.id === edge.target) || null,
        })).filter(Boolean);

        this.nodeComponents = [];

        return (
            <div
                className={`${styles.container}`}
                style={{width, height}}
            >
                <div
                    className={`${styles.root}`}
                    style={Object.assign({}, style, {
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
                            nodes.map((node: NodeJsonType) => this.renderNode(node))
                        }
                    </div>
                    <svg
                        ref={(element: ReactElementRef<'svg'>) => { this.svgContainer = element; }}
                        className={styles.svg}
                    >
                        {
                            _edges.map((edge) => (<CustomEdge
                                key={`edge_${edge.source.id}_${edge.target.id}`}
                                source={edge.source}
                                target={edge.target}
                                isDirected={isDirected || false}
                                isVertical={isVertical || false}
                            />))
                        }
                    </svg>
                </div>
            </div>
        );
    }
}
