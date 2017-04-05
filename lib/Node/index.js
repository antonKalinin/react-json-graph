/* @flow */
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames/bind';
import styles from './styles.css';

class Node extends Component {
    static defaultProps = {
        x: 100,
        y: 100,
        width: 160,
        height: 40,
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
    }

    constructor(props) {
        super(props);

        this.id = props.id;
        this.offsetGraphLeft = 0;
        this.offsetGraphTop = 0;

        this.edges = {
            input: [],
            output: [],
        };

        this.snapToGrid = props.snapToGrid;
        this.snapDelta = 10;

        this.state = {
            label: props.label,
            isDragging: false,
            height: props.height,
            width: props.width,
            position: {x: props.x, y: props.y},
            mouseDownOffset: {x: 0, y: 0},
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

    setGraphOffset(offsetLeft, offsetTop) {
        this.offsetGraphLeft = offsetLeft;
        this.offsetGraphTop = offsetTop;
    }

    get x() {
        return this.state.position.x;
    }

    addEdge(type, edge) {
        if (!Array.isArray(this.edges[type])) return;

        const {width, height} = this.state;

        this.edges[type].push(edge);

        if (this.edges[type].length === 1) {
            let outerJointX;
            let innerJointX;
            let outerJointY = height / 2;
            let innerJointY = height / 2;

            if (type === 'output') {
                outerJointX = innerJointX = width - 1;
            } else if (type === 'input') {
                outerJointX = innerJointX = 1;
            }
        }
    }

    addInput() {

    }

    addOutput() {

    }

    /* Event Handlers */

    _onClick() {
        this.context.store.dispatch({
            type: 'NODE_IS_SELECTED',
            id: this.id,
        });
    }

    _onMouseDown(event) {
        const {position} = this.state;
        // only left mouse button
        if (event.button !== 0) return;

        const mouseDownOffset = {
            x: event.pageX - this.offsetGraphLeft - position.x,
            y: event.pageY - this.offsetGraphTop - position.y,
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
        const {mouseDownOffset, isDragging} = this.state;

        // console.log(event.pageX, event.pageY);

        /*
            let x = Math.max(0, Math.min(this.graphEl.clientWidth - this.width, d3.event.x - this.dragOffsetX));
            let y = Math.max(0, Math.min(this.graphEl.clientHeight - this.height - 4, d3.event.y - this.dragOffsetY)); 

            if (this.snapToGrid) {
                let gridCross = this.gridSize;
                let coords = [x, y].map((coord) => {
                    let delta = coord % gridCross;

                    if (delta < this.snapDelta) {
                        // snap to closest lower
                        coord = coord - delta;
                    }

                    if (delta > gridCross - this.snapDelta) {
                        // snap to closest higher
                        coord = coord + (gridCross - delta);
                    }

                    return coord;
                });

                x = coords[0] - 1;
                y = coords[1] - 1;
            }
        */

        if (!isDragging) return;

        const position = {
            x: event.pageX - this.offsetGraphLeft - mouseDownOffset.x,
            y: event.pageY - this.offsetGraphTop - mouseDownOffset.y,
        };


        this.setState({position});
        this._moveEdges();

        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Move edges of the node to x and y
     * @param  {Number} x
     * @param  {Number} y
     */
    _moveEdges() {
        this.edges.input.forEach((edge) => {
            edge.redraw();
        });

        this.edges.output.forEach((edge) => {
            edge.redraw();
        });
    }

    render() {
        const {label, position, width, height, isDragging} = this.state;
        const cx = classNames.bind(styles);
        const className = cx({
            root: true,
            root_dragging_yes: isDragging,
        });

        return (
            <div
                className={className}
                style={{
                    left: position.x,
                    top: position.y,
                    width,
                    height,
                }}
                onClick={(event) => this._onClick(event)}
                onMouseDown={(event) => this._onMouseDown(event)}
                ref={(element) => this.domEl = element}
            >
                {Boolean(label) &&
                    <span className={styles.label}>{label}</span>
                }
            </div>
        );
    }
}

Node.contextTypes = {
    store: PropTypes.object,
};

export default Node;
