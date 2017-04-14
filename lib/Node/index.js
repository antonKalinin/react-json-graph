/* @flow */
import React, {Component, PropTypes} from 'react';
import styles from './styles';

console.log(styles);

class Node extends Component {
    static defaultProps = {
        x: 200,
        y: 200,
        width: 160,
        height: 35,
        gridSize: 20,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        inputs: PropTypes.array,
        outputs: PropTypes.array,
        getGraph: PropTypes.func,
        snapToGrid: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.id = props.id;

        this.snapToGrid = props.snapToGrid;
        this.snapDelta = 10;

        this.state = {
            label: props.label,
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
            inputs: props.inputs,
            outputs: props.outputs,
            edges: {
                input: [],
                output: [],
            },
            mouseDownOffset: {x: 0, y: 0},
            isDragging: false,
            isCompactView: true,
        };

        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
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

    addInput() {}

    addOutput() {}

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
        this.setState({isDragging: false});

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
        const className = type === 'input' ? styles.edgeJoint_input : styles.edgeJoint_ouput;
        let label = null;

        if (type === 'input' && typeof edge.targetId !== 'string') {
            label = edge.targetId.label || type;
        }

        if (type === 'output' && typeof edge.sourceId !== 'string') {
            label = edge.sourceId.label || type;
        }

        return (
            <div
                key={`joint_${type}_${edge.sourceId}_${edge.targetId}`}
                className={className}
            >
                {type === 'input' && <span className={styles.edgeJointPoint} />}
                {label &&
                    <span>{label}</span>
                }
                {type === 'output' && <span className={styles.edgeJointPoint} />}
            </div>
        );
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
                        <div className={styles.label}>{label}</div>
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
