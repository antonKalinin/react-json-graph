import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import styles from './Node.css'

class Node extends Component {

    constructor(props) {
        super();

        this.height = 40;
        this.radius = this.height / 2;

        this.x = props.x || 100;
        this.y = props.y || 100;

        this.links = {
            input: [],
            output: []
        };

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.graphOffsetY = 0;

        this.snapToGrid = true;
        this.snapDelta = 10;
        this.gridSize = 44;

      }

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

    _onDragStart() {
        var transforms = d3.transform(this.d3El.attr("transform"));

        this.dragOffsetX = d3.event.sourceEvent.x - transforms.translate[0];
        this.dragOffsetY = d3.event.sourceEvent.y - transforms.translate[1] - this.graphOffsetY;
    }

    _onDrag() {
        let graphEl = document.getElementById('graph');
        let x = Math.max(0, Math.min(graphEl.clientWidth - this.width, d3.event.x - this.dragOffsetX));
        let y = Math.max(0, Math.min(graphEl.clientHeight - this.height - 4, d3.event.y - this.dragOffsetY));

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
        this._moveLinks(x, y);
    }

    _moveLinks(x, y) {
        this.links.input.forEach((link) => {
            link.target.x = x;
            link.target.y = y;

            link.redraw();
        });

        this.links.output.forEach((link) => {
            link.source.x = x;
            link.source.y = y;
            
            link.redraw();
        });
    }

    componentDidMount() {
        var drag = d3.behavior
            .drag()
            .on('dragstart', () => { this._onDragStart() })
            .on('drag', () => { this._onDrag() });

        this.el = ReactDOM.findDOMNode(this);
        this.d3El = d3.select(ReactDOM.findDOMNode(this));
        this.titleEl = this.el.getElementsByClassName(styles.title)[0];

        // Calculate node width according to title width
        this.width = this.titleEl.getBBox().width + this.radius * 2;

        // Set graph offset according to header height
        this.graphOffsetY = document.getElementsByClassName('header')[0].clientHeight;

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

    addLink(type, link) {
        if (!Array.isArray(this.links[type])) return;

        this.links[type].push(link);

        if (this.links[type].length === 1) {
            let outerJointX;
            let innerJointX;
            let outerJointY = this.height / 2
            let innerJointY = this.height / 2;

            if (type === 'output') {
                outerJointX = innerJointX = this.width - 1;
            } else if (type === 'input') {
                outerJointX = innerJointX = 1;
            }

            // Outer Link Joint
            this.d3El
                .append('circle')
                .attr('class', styles.linkJoint_outer)
                .attr("r", 4)
                .attr("cx", outerJointX)
                .attr("cy", outerJointY);

            // Inner Link Joint
            this.d3El
                .append('circle')
                .attr('class', styles.linkJoint_inner)
                .attr("r", 1)
                .attr("cx", innerJointX)
                .attr("cy", innerJointY);
        }
    }

    removeLink() {

    }

    render() {
        return (
            <g transform={`translate(${ this.x }, ${ this.y })`} className={ styles.root }>
                <text x={ this.radius } y='25' className={ styles.title }>{this.props.title}</text>
            </g>
        );
    }
}

Node.propTypes = {
    title: PropTypes.string.isRequired,
    enabled: PropTypes.bool
};

export default Node;
