/* @flow */
import React, {Component} from 'react';
import type {ElementRef as ReactElementRef} from 'react';

import Node from '../Node';
import styles from './edge.css';

type Props = {
    sourceId: string,
    targetId: string,
};

type State = {
    path: ?string,
};

type Rect = {
    x: number,
    y: number,
    width: number,
    height: number,
};

class Edge extends Component<Props, State> {
    sourceId: string;
    targetId: string;

    source: ReactElementRef<typeof Node>;
    target: ReactElementRef<typeof Node>;

    static vertiacalLinkPath(source: Rect, target: Rect):string {
        return 'M' + source.x + ',' + source.y
            + 'C' + source.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + target.y;
    }

    static horizontalLinkPath(source: Rect, target: Rect):string {
        const sourceX = source.x + source.width;
        const sourceY = source.y + (source.height / 2);
        const targetY = target.y + (target.height / 2);

        return 'M' + sourceX + ',' + sourceY
            + 'C' + (sourceX + target.x) / 2 + ',' + sourceY
            + ' ' + (sourceX + target.x) / 2 + ',' + targetY
            + ' ' + target.x + ',' + targetY;
    }

    constructor(props: Props) {
        super(props);

        this.sourceId = props.sourceId;
        this.targetId = props.targetId;

        this.state = {
            path: null,
        };
    }

    toJSON(): {source: string, target: string} {
        return {
            source: this.sourceId,
            target: this.targetId,
        };
    }

    build(source: ReactElementRef<typeof Node>, target: ReactElementRef<typeof Node>) {
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

        this.setState({path: Edge.horizontalLinkPath(source, target)});
    }

    render() {
        return (
            <path className={styles.root} d={this.state.path} />
        );
    }
}

export default Edge;
