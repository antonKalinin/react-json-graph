import React, {Component, PropTypes} from 'react';
import styles from './edge.css';

class Edge extends Component {

    static propTypes = {
        sourceId: PropTypes.string.isRequired,
        targetId: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.sourceId = props.sourceId;
        this.targetId = props.targetId;

        this.state = {
            path: null,
        };
    }

    build(source, target) {
        this.source = source;
        this.target = target;

        this.redraw();
    }

    vertiacalLinkPath(source, target) {
        return 'M' + source.x + ',' + source.y
            + 'C' + source.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + target.y;
    }

    horizontalLinkPath(source, target) {
        const sourceX = source.x + source.width;
        const sourceY = source.y + source.height / 2;
        const targetY = target.y + target.height / 2;

        return 'M' + sourceX + ',' + sourceY
            + 'C' + (sourceX + target.x) / 2 + ',' + sourceY
            + ' ' + (sourceX + target.x) / 2 + ',' + targetY
            + ' ' + target.x + ',' + targetY;
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

        this.setState({path: this.horizontalLinkPath(source, target)});
    }

    render() {
        return <path className={styles.root} d={this.state.path}></path>;
    }
}

export default Edge;
