/* @flow */
/* global document MouseEvent SyntheticMouseEvent HTMLDivElement */

import React, {Component} from 'react';
import type {Node as ReactNode, ElementRef as ReactElementRef} from 'react';
import Edge from '../Edge';
import styles from './node.css';

import type {GraphType, NodeJsonType} from '../types';

type GraphRect = {
    width: number,
    height: number,
    offsetTop: number,
    offsetLeft: number,
};

type Props = {
    id: string,
    x: number,
    y: number,
    scale: number,
    label: string,
    width: ?number,
    height: ?number,

    getGraph: () => GraphType,
    onChange: ?(NodeJsonType) => void,
};

type State = {
    id: string,
    x: number,
    y: number,
    scale: number,
    label: string,
    width: number,
    height: number,

    edges: {
        input: Array<ReactElementRef<typeof Edge>>,
        output: Array<ReactElementRef<typeof Edge>>,
    },
    isDragging: boolean,
    isCompactView: boolean,
};

export default class Node extends Component<Props, State> {
    id: string;

    _onMouseUp: (MouseEvent) => void;
    _onMouseDown: (SyntheticMouseEvent<>) => void;
    _onMouseMove: (MouseEvent) => void;

    getGraph: () => ?GraphRect;
    moveEdges: () => void;
    renderJoint: (type: string, edge: ReactElementRef<typeof Edge>) => ReactNode;
    labelEl: ?HTMLDivElement;

    static defaultProps = {
        x: 200,
        y: 200,
        width: 160,
        height: 35,
    }

    constructor(props: Props) {
        super(props);

        this.id = props.id;

        this.state = {
            id: props.id,
            x: props.x,
            y: props.y,
            scale: props.scale,
            label: props.label,
            width: props.width || Node.defaultProps.width,
            height: props.height || Node.defaultProps.height,
            edges: {
                input: [],
                output: [],
            },
            isDragging: false,
            isCompactView: true,
        };

        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
    }

    componentDidMount() {
        const {width} = this.state;
        const labelWidth = this.labelEl ? this.labelEl.clientWidth : 0;

        if (width - 30 < labelWidth) {
            this.setState({width: labelWidth + 30});
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const {scale, label} = this.state;

        if (nextProps.scale && nextProps.scale !== scale) {
            this.setState({scale: nextProps.scale});
        }

        if (nextProps.label !== label) {
            this.setState({
                id: nextProps.id,
                x: nextProps.x,
                y: nextProps.y,
                scale: nextProps.scale,
                label: nextProps.label,
                width: nextProps.width || Node.defaultProps.width,
                height: nextProps.height || Node.defaultProps.height,
                edges: {
                    input: [],
                    output: [],
                },
            });
        }
    }

    componentDidUpdate(props: Props, state: State) {
        if (this.state.isDragging && !state.isDragging) {
            document.addEventListener('mousemove', this._onMouseMove);
            document.addEventListener('mouseup', this._onMouseUp);
        } else if (!this.state.isDragging && state.isDragging) {
            document.removeEventListener('mousemove', this._onMouseMove);
            document.removeEventListener('mouseup', this._onMouseUp);
        }
    }

    getGraph(): ?GraphRect {
        const graph = this.props.getGraph();

        if (!graph) {
            return null;
        }

        const {offsetTop, offsetLeft, clientWidth, clientHeight} = graph;

        return {
            offsetTop,
            offsetLeft,
            width: clientWidth,
            height: clientHeight,
        };
    }

    toJSON(): NodeJsonType {
        const {id, label, x, y} = this.state;

        return {
            id,
            label,
            position: {x, y},
        };
    }

    /* Event Handlers */

    _onMouseDown(event: SyntheticMouseEvent<>) {
        // only left mouse button
        if (event.button !== 0) return;

        this.setState({isDragging: true});

        event.stopPropagation();
        event.preventDefault();
    }

    _onMouseUp(event: MouseEvent) {
        const {onChange} = this.props;

        this.setState({isDragging: false});

        if (typeof onChange === 'function') {
            onChange(this.toJSON());
        }

        event.stopPropagation();
        event.preventDefault();
    }

    _onMouseMove(event: MouseEvent) {
        const graph = this.getGraph();
        const {x, y, width, height, scale, isDragging} = this.state;

        if (!isDragging || !graph) return;

        const nextX = x + (event.movementX / scale);
        const nextY = y + (event.movementY / scale);

        if (nextX < 0 || nextY < 0 ||
            nextX + width > graph.width ||
            nextY + height > graph.height) {
            return;
        }

        const nextState = {x: nextX, y: nextY};

        this.setState(nextState);
        this.props.onChange(this.toJSON());

        event.stopPropagation();
        event.preventDefault();
    }

    renderJoint(type: string, edge: ReactElementRef<typeof Edge>): ReactNode {
        const className = type === 'input' ? styles.edgeJoint_input : styles.edgeJoint_ouput;
        let label = null;

        if (type === 'input' && typeof edge.targetId !== 'string') {
            label = edge.targetId.label || type;
        }

        if (type === 'output' && typeof edge.sourceId !== 'string') {
            label = edge.sourceId.label || type;
        }

        const Joint = (<span className={styles.edgeJointPoint} />);

        return (
            <div
                key={`joint_${type}_${edge.sourceId}_${edge.targetId}`}
                className={className}
            >
                {type === 'input' && Joint}
                {label && <span>{label}</span>}
                {type === 'output' && Joint}
            </div>
        );
    }

    renderBody() {

    }

    renderLabel() {
        const {label} = this.props;
    }

    // if connected node x is greater than me, joint is on the right
    // elsa on the left
    renderJoint_(connectedTo: ReactElementRef<typeof Node>) {
        if (!connectedTo) {
            return null;
        }
    }

    render() {
        const {
            x,
            y,
            width,
            height,
            label,
            edges,
            isDragging,
            isCompactView,
        } = this.state;

        const className = `${styles.root} ${isDragging ? styles.root_dragging_yes : ''}`;

        let inputs = edges.input;
        let outputs = edges.output;

        if (isCompactView) {
            inputs = inputs.slice(0, 1);
            outputs = outputs.slice(0, 1);
        }

        return (
            <div
                className={className}
                style={{
                    left: x,
                    top: y,
                    width,
                    height,
                }}
                onMouseDown={(event: SyntheticMouseEvent<>) => this._onMouseDown(event)}
            >
                {!isCompactView && Boolean(label) &&
                    <div className={styles.label}>{label}</div>
                }
                <div className={styles.interfacesWrap}>
                    <div className={styles.interfaces}>
                        {inputs.map((edge: ReactElementRef<typeof Edge>) => this.renderJoint('input', edge))}
                    </div>
                    {isCompactView && Boolean(label) &&
                        <div
                            ref={(element) => { this.labelEl = element; }}
                            className={styles.label}
                        >
                            {label}
                        </div>
                    }
                    <div className={styles.interfaces}>
                        {outputs.map((edge: ReactElementRef<typeof Edge>) => this.renderJoint('output', edge))}
                    </div>
                </div>
            </div>
        );
    }
}
