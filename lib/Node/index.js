/* @flow */
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames/bind';
import styles from './styles.css';

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

        width: PropTypes.number,
        height: PropTypes.number,
        snapToGrid: PropTypes.bool,
        label: PropTypes.string.isRequired,
        inputs: PropTypes.array,
        outputs: PropTypes.array,
        graph: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.id = props.id;

        this.snapToGrid = props.snapToGrid;
        this.snapDelta = 10;

        this.state = {
            label: props.label,
            isDragging: false,
            height: props.height,
            width: props.width,
            position: {x: props.x, y: props.y},
            mouseDownOffset: {x: 0, y: 0},
            edges: {
                input: [],
                output: [],
            },
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

    getPosition() {
        return this.state.position;
    }

    getSize() {
        const {width, height} = this.state;

        return {width, height};
    }

    setGraph(graph) {
        this.graph = graph;
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
        const {position} = this.state;
        // only left mouse button
        if (event.button !== 0) return;

        const mouseDownOffset = {
            x: event.pageX - this.graph.offsetLeft - position.x,
            y: event.pageY - this.graph.offsetTop - position.y,
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
        const {width, height, mouseDownOffset, isDragging} = this.state;

        // TODO Add snap to grid

        if (!isDragging) return;

        const position = {
            x: event.pageX - this.graph.offsetLeft - mouseDownOffset.x,
            y: event.pageY - this.graph.offsetTop - mouseDownOffset.y,
        };

        if (position.x < 0 || position.y < 0 ||
            position.x + width > this.graph.width ||
            position.y + height > this.graph.height) {
            return;
        }

        this.setState({position});
        this._moveEdges();

        event.stopPropagation();
        event.preventDefault();
    }

    _moveEdges() {
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
            label,
            edges,
            position,
            width,
            height,
            isDragging,
            isCompactView,
        } = this.state;

        const cx = classNames.bind(styles);
        const className = cx({
            root: true,
            root_dragging_yes: isDragging,
        });

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
                    left: position.x,
                    top: position.y,
                    width,
                    height,
                }}
                onMouseDown={(event) => this._onMouseDown(event)}
                ref={(element) => this.domEl = element}
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
