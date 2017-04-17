/* @flow */
import React, {PureComponent, PropTypes} from 'react';
import styles from './node.css';

const fontSize = 7;
const innerOffset = 5;

class Node extends PureComponent {
    static defaultProps = {
        x: 200,
        y: 200,
        width: 80,
        height: 17,
        gridSize: 20,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,

        zoom: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        getGraph: PropTypes.func,
        snapToGrid: PropTypes.bool,

        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.id = props.id;

        this.snapToGrid = props.snapToGrid;
        this.snapDelta = 10;

        this.state = {
            id: props.id,
            label: props.label,
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
            edges: {
                input: [],
                output: [],
            },
            zoom: props.zoom,
            minZoom: 1,
            maxZoom: 2,
            mouseDownOffset: {x: 0, y: 0},
            isDragging: false,
            isCompactView: true,
        };

        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {zoom, minZoom, maxZoom, x, y} = this.state;

        if (nextProps.zoom && nextProps.zoom !== zoom) {
            const zoomStep = nextProps.zoom - zoom;
            const zoomDelta = nextProps.zoom - 1 - zoomStep;
            const zoomSteps = Math.abs((maxZoom - minZoom) / zoomStep);

            const originX = x * zoomSteps / (zoomSteps + zoomDelta * zoomSteps);
            const originY = y * zoomSteps / (zoomSteps + zoomDelta * zoomSteps);

            this.setState({
                zoom: nextProps.zoom,
                x: x + originX * zoomStep,
                y: y + originY * zoomStep,
            });
        }
    }

    componentDidUpdate(props, state) {
        if (this.state.isDragging && !state.isDragging) {
            document.addEventListener('mousemove', this._onMouseMove);
            document.addEventListener('mouseup', this._onMouseUp);
        } else if (!this.state.isDragging && state.isDragging) {
            document.removeEventListener('mousemove', this._onMouseMove);
            document.removeEventListener('mouseup', this._onMouseUp);
        }
    }

    getGraph() {
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

    getPosition() {
        const {x, y} = this.state;

        return {x, y};
    }

    getSize() {
        const {width, height} = this.state;

        return {width, height};
    }

    addEdge(type, edge) {
        const {edges} = this.state;
        let isCompactView = this.state.isCompactView;

        if (type === 'input' && typeof edge.targetId !== 'string') {
            isCompactView = false;
        }

        if (type === 'output' && typeof edge.sourceId !== 'string') {
            isCompactView = false;
        }

        if (isCompactView !== this.state.isCompactView) {
            this.setState({isCompactView});
        }

        edges[type] = edges[type].concat(edge);

        this.setState({edges});
    }

    toJSON() {
        const {id, label, x, y} = this.state;

        return {
            id,
            label,
            position: {x, y},
        };
    }

    /* Event Handlers */

    _onMouseDown(event) {
        const graph = this.getGraph();
        const {x, y} = this.state;
        // only left mouse button
        if (event.button !== 0) return;

        const mouseDownOffset = {
            x: event.pageX - graph.offsetLeft - x,
            y: event.pageY - graph.offsetTop - y,
        };

        this.setState({
            isDragging: true,
            mouseDownOffset,
        });

        event.stopPropagation();
        event.preventDefault();
    }

    _onMouseUp(event) {
        const {onChange} = this.props;

        this.setState({isDragging: false});

        if (typeof onChange === 'function') {
            onChange(this.toJSON());
        }

        event.stopPropagation();
        event.preventDefault();
    }

    _onMouseMove(event) {
        const graph = this.getGraph();
        const {width, height, mouseDownOffset, isDragging} = this.state;

        // TODO Add snap to grid

        if (!isDragging) return;

        const x = event.pageX - graph.offsetLeft - mouseDownOffset.x;
        const y = event.pageY - graph.offsetTop - mouseDownOffset.y;

        if (x < 0 || y < 0 || x + width > graph.width || y + height > graph.height) {
            return;
        }

        this.setState({x, y});
        this.moveEdges();

        event.stopPropagation();
        event.preventDefault();
    }

    moveEdges() {
        const {edges} = this.state;

        edges.input.forEach((edge) => {
            edge.redraw();
        });

        edges.output.forEach((edge) => {
            edge.redraw();
        });
    }

    renderJoint(type, edge) {
        const jointWidth = 3;
        const jointHeight = 3;
        const {zoom, height} = this.state;
        const className = type === 'input' ? styles.edgeJoint_input : styles.edgeJoint_ouput;
        let label = null;

        if (type === 'input' && typeof edge.targetId !== 'string') {
            label = edge.targetId.label || type;
        }

        if (type === 'output' && typeof edge.sourceId !== 'string') {
            label = edge.sourceId.label || type;
        }

        const Joint = (
            <span
                style={{
                    marginTop: height * zoom / 2 - (jointHeight * zoom) / 3,
                    width: Math.round(jointWidth * zoom),
                    height: Math.round(jointHeight * zoom),
                }}
                className={styles.edgeJointPoint}
            />
        );

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

    render() {
        const {
            x,
            y,
            width,
            height,
            zoom,
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
                    width: width * zoom,
                    height: height * zoom,
                    fontSize: Math.round(fontSize * zoom),
                }}
                onMouseDown={(event) => this._onMouseDown(event)}
            >
                {!isCompactView && Boolean(label) &&
                    <div className={styles.label}>{label}</div>
                }
                <div className={styles.interfacesWrap}>
                    <div className={styles.interfaces}>
                        {inputs.map((edge) => this.renderJoint('input', edge))}
                    </div>
                    {isCompactView && Boolean(label) &&
                        <div
                            className={styles.label}
                            style={{
                                paddingTop: innerOffset * zoom,
                                paddingBottom: innerOffset * zoom,
                            }}
                        >
                            {label}
                        </div>
                    }
                    <div className={styles.interfaces}>
                        {outputs.map((edge) => this.renderJoint('output', edge))}
                    </div>
                </div>
            </div>
        );
    }
}

export default Node;
