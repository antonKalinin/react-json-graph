import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import styles from './Edge.css'

class Edge extends Component {

    constructor(props) {
        super(props);

        this.source = props.source || {};
        this.target = props.target || {};

        // this.store = this.context.store;
        // this.state = this.store.getState();
    }

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.d3Node = d3.select(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        d3Chart.destroy(this.d3Node);
    }

    build(source, target) {
        this.source = source;
        this.target = target;

        this.redraw();
    }

    redraw() {
        this.d3Node
            .attr('d', d3.svg.diagonal()
                .source({'x': this.source.y + this.source.height / 2, 'y': this.source.x + this.source.width + 4})
                .target({'x': this.target.y + this.target.height / 2, 'y': this.target.x})
                .projection(function(d) { return [d.y, d.x]; })
            );
    }

    render() {
        return <path className={styles.root}></path>;
    }
}

export default Edge;
