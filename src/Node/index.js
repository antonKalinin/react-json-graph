/* @flow */
import React, {Component, PropTypes} from 'react';
import styles from './node.css';

class Node extends Component {
    static defaultProps = {
        x: 200,
        y: 200,
        width: 160,
        height: 35,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,

        scale: PropTypes.number,
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
            ...this.propsToState(props),
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
        const labelWidth = this.labelEl.clientWidth;

        if (width - 30 < labelWidth) {
            this.setState({width: labelWidth + 30});
        }
    }

    componentWillReceiveProps(nextProps) {
        const {scale, label} = this.state;

        if (nextProps.scale && nextProps.scale !== scale) {
            this.setState({scale: nextProps.scale});
        }

        if (nextProps.label !== label) {
            this.setState({
                ...this.propsToState(nextProps),
                edges: {
                    input: [],
                    output: [],
                },
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

    propsToState(props) {
        return Object.keys(props).reduce((result, propName) => {
            if (typeof props[propName] !== 'function') {
                result[propName] = props[propName];
            }

            return result;
        }, {});
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
        // only left mouse button
        if (event.button !== 0) return;

        this.setState({isDragging: true});

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
        const {x, y, width, height, scale, isDragging} = this.state;

        if (!isDragging) return;

        const nextX = x + event.movementX / scale;
        const nextY = y + event.movementY / scale;

        if (nextX < 0 || nextY < 0 ||
            nextX + width > graph.width ||
            nextY + height > graph.height) {
            return;
        }

        this.setState({x: nextX, y: nextY});
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
                        <div
                            ref={(element) => { this.labelEl = element; }}
                            className={styles.label}
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
