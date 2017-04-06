import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import styles from './styles.css';

class Edge extends Component {

    static propTypes = {
        sourceId: PropTypes.string.isRequired,
        targetId: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.sourceId = props.sourceId;
        this.targetId = props.targetId;
    }

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        this.d3Node = d3.select(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        this.d3Chart.destroy(this.d3Node);
    }

    build(source, target) {
        this.source = source;
        this.target = target;

        this.redraw();
    }

    redraw() {
        const source = {
            ...this.source.getPosition(),
            ...this.source.getSize(),
        };

        const target = {
            ...this.target.getPosition(),
            ...this.target.getSize(),
        };

        this.d3Node
            .attr('d', d3.svg.diagonal()
                .source({x: source.y + source.height / 2, y: source.x + source.width + 4})
                .target({x: target.y + target.height / 2, y: target.x})
                .projection((d) => [d.y, d.x])
            );
    }

    render() {
        return <path className={styles.root}></path>;
    }
}

export default Edge;
