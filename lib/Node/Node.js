import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import classNames from 'classnames/bind';
import styles from './Node.css'

class Node extends Component {

    constructor(props) {
        super();

        this.id = props.id;
        this.height = 40;
        this.radius = this.height / 2;

        this.x = props.x || 100;
        this.y = props.y || 100;

        this.edges = {
            input: [],
            output: []
        };

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.graphOffsetX = 0;
        this.graphOffsetY = 0;

        this.snapToGrid = true;
        this.snapDelta = 10;
        this.gridSize = 44;

        // this.store = this.context.store;
        // this.state = this.store.getState();
        
        this.state = {
            isSelected: false
        }
      }

    /* Event Handlers */

    _onDragStart() {
        var transforms = d3.transform(this.d3El.attr("transform"));

        this.dragOffsetX = d3.event.sourceEvent.x - transforms.translate[0] - this.graphOffsetX;
        this.dragOffsetY = d3.event.sourceEvent.y - transforms.translate[1] - this.graphOffsetY;
    }

    _onDrag() {
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
                    coord = coord + (gridCross - delta)
                }

                return coord;
            });

            x = coords[0] - 1;
            y = coords[1] - 1;
        }

        this.d3El.attr('transform', 'translate(' + x + ',' + y + ')');
        this._moveEdges(x, y);
    }

    _onClick(event) {
        this.context.store.dispatch({
            type: 'NODE_IS_SELECTED',
            id: this.id
        })
    }

    /**
     * Returns a path of svg rounded rectangle
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Number} width
     * @param  {Number} height
     * @param  {Number} radius
     * @return {String}
     */
    _roundedRect(x, y, width, height, radius) {
        return "M"  + (x + radius) + "," + y
           + "h" + (width - 2*radius)
           + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
           + "v" + (height - 2*radius)
           + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
           + "h" + (2*radius - width)
           + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius
           + "v" + (2*radius - height)
           + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius
           + "z";
    }

    /**
     * Move an edges of the node to x and y
     * @param  {Number} x
     * @param  {Number} y
     */
    _moveEdges(x, y) {
        this.edges.input.forEach((edge) => {
            edge.target.x = x;
            edge.target.y = y;

            edge.redraw();
        });

        this.edges.output.forEach((edge) => {
            edge.source.x = x;
            edge.source.y = y;
            
            edge.redraw();
        });
    }

    componentDidMount() {
        let drag = d3.behavior
            .drag()
            .on('dragstart', () => { this._onDragStart() })
            .on('drag', () => { this._onDrag() });


        this.el = ReactDOM.findDOMNode(this);
        this.d3El = d3.select(ReactDOM.findDOMNode(this));
        this.labelEl = this.el.getElementsByClassName(styles.label)[0];
        this.graphEl = this.el.parentNode;

        // Calculate node width according to label width
        this.width = this.labelEl.getBBox().width + this.radius * 2;

        let graphPosition = this.graphEl.getBoundingClientRect();

        // Set graph offset
        this.graphOffsetX = graphPosition.left;
        this.graphOffsetY = graphPosition.top;

        this.d3El.call(drag);

        this.d3El
            .append('path')
            .attr('d', this._roundedRect(0, 0, this.width, this.height, this.radius));
    }

    componentWillUnmount() {
        d3Chart.destroy(this.d3El);
    }

    getPosition() {
        return [this.x, this.y];
    }

    addEdge(type, edge) {
        if (!Array.isArray(this.edges[type])) return;

        this.edges[type].push(edge);

        if (this.edges[type].length === 1) {
            let outerJointX;
            let innerJointX;
            let outerJointY = this.height / 2
            let innerJointY = this.height / 2;

            if (type === 'output') {
                outerJointX = innerJointX = this.width - 1;
            } else if (type === 'input') {
                outerJointX = innerJointX = 1;
            }

            // Outer edge Joint
            this.d3El
                .append('circle')
                .attr('class', styles.edgeJoint_outer)
                .attr("r", 4)
                .attr("cx", outerJointX)
                .attr("cy", outerJointY);

            // Inner edge Joint
            this.d3El
                .append('circle')
                .attr('class', styles.edgeJoint_inner)
                .attr("r", 1)
                .attr("cx", innerJointX)
                .attr("cy", innerJointY);
        }
    }

    deselect() {
        this.setState({isSelected: false});
    }

    render() {
        let cx = classNames.bind(styles);

        let className = cx({
            root: true,
            root_selected: this.state.isSelected,
        });

        return (
            <g transform={`translate(${ this.x }, ${ this.y })`} 
                className={ className }
                onClick={this._onClick.bind(this)}>

                <text x={ this.radius } y='25' className={ styles.label }>{this.props.label}</text>
            </g>
        );
    }
}

Node.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    enabled: PropTypes.bool
};

Node.contextTypes = {
    store: PropTypes.object
}

export default Node;
