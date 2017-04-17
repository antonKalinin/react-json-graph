import React, {Component, PropTypes} from 'react';
import styles from './edge.css';

const strokeWidth = 1;

class Edge extends Component {

    static propTypes = {
        sourceId: PropTypes.string.isRequired,
        targetId: PropTypes.string.isRequired,

        zoom: PropTypes.number,
    }

    constructor(props) {
        super(props);

        this.sourceId = props.sourceId;
        this.targetId = props.targetId;

        this.state = {
            path: null,
            zoom: props.zoom,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {zoom} = this.state;

        if (nextProps.zoom && nextProps.zoom !== zoom) {
            this.setState({zoom: nextProps.zoom}, () => { this.redraw(); });

        }
    }

    toJSON() {
        return {
            source: this.sourceId,
            target: this.targetId,
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
        const {zoom} = this.state;
        const sourceX = source.x + source.width * zoom;
        const sourceY = source.y + (source.height * zoom / 2);
        const targetY = target.y + (target.height * zoom / 2);

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
        const {zoom} = this.state;

        return (
            <path
                style={{
                    strokeWidth: strokeWidth * zoom,
                }}
                className={styles.root}
                d={this.state.path}
            />
        );
    }
}

export default Edge;
