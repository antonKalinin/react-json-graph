/*
    @flow
    global document MouseEvent SyntheticMouseEvent HTMLDivElement
*/

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
    shouldContainerFitContent: boolean,
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

        this.state = {
            id: props.id,
            x: props.x,
            y: props.y,
            scale: props.scale,
            label: props.label,
            width: props.width,
            height: props.height,
            isDragging: false,
            isCompactView: true,
        };

        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
    }

    componentDidMount() {
        console.log(this.props.shouldContainerFitContent)
        if (this.props.shouldContainerFitContent === false) {
            return;
        }

        const nextState = {};
        const {width, height} = this.state;
        const {clientWidth: labelWidth = 0, clientHeight: labelHeight = 0} = this.labelEl || {};

        if (width - 30 < labelWidth) {
            nextState.width = labelWidth + 30;
        }

        if (height - 20 < labelWidth) {
            nextState.height = labelHeight + 20;
        }

        if (Object.keys(nextState).length > 0) {
            this.setState(nextState);
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const {scale, label} = this.state;
        const {width, height} = nextProps.size || {};
        const nextState = {};

        if (nextProps.scale && nextProps.scale !== scale) {
            nextState.scale = nextProps.scale;
        }

        if (nextProps.label !== label) {
            Object.assign(nextState, {
                id: nextProps.id,
                x: nextProps.x,
                y: nextProps.y,
                scale: nextProps.scale,
                label: nextProps.label,
                width: width || Node.defaultProps.width,
                height: height || Node.defaultProps.height,
            });
        }

        if (Object.keys(nextState).length > 0) {
            this.setState(nextState);
        }
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        const {x, y, width, height, isDragging} = this.state;

        return isDragging !== nextState.isDragging ||
            x !== nextState.x || y !== nextState.y ||
            width !== nextState.width || height !== nextState.height;
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
        const {id, label, x, y, width, height} = this.state;

        return {
            id,
            label,
            position: {x, y},
            size: {width, height},
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
        const {onChange} = this.props;
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

        this.setState(nextState, () => {
            if (typeof onChange === 'function') {
                onChange(this.toJSON());
            }
        });

        event.stopPropagation();
        event.preventDefault();
    }

    /* Render Methods */

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

    renderContainer({isDragging, content}) {
        const {width, height} = this.state;
        const className = `${styles.container} ${isDragging ? styles.container_dragging_yes : ''}`;

        return (
            <div style={{width, height}} className={className}>
                { Boolean(content) && this.renderContent(content) }
            </div>
        );
    }

    renderContent(label: string) {
        return (
            <div
                className={styles.label}
                ref={(element) => { this.labelEl = element }}
            >
                {label}
            </div>
        );
    }

    render() {
        const {
            x,
            y,
            label,
            isDragging,
        } = this.state;

        return (
            <div
                style={{left: x, top: y}}
                className={styles.root}
                ref={(element) => { this.element = element }}
                onMouseDown={(event: SyntheticMouseEvent<>) => this._onMouseDown(event)}
            >
                { this.renderContainer({isDragging, content: label}) }
            </div>
        );
    }
}
