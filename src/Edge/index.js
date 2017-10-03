/* @flow */
import React, {PureComponent} from 'react';

import styles from './edge.css';

import type {NodeJsonType} from '../types';

type Props = {
    isVertical: boolean,
    isDirected: boolean,
    source: NodeJsonType,
    target: NodeJsonType,
};

type State = {
    isVertical: boolean,
    isDirected: boolean,
    source: NodeJsonType,
    target: NodeJsonType,
};

type Point = {
    x: number,
    y: number,
};

class Edge extends PureComponent<Props, State> {
    static vertiacalLinkPath(source: Point, target: Point):string {
        return 'M' + source.x + ',' + source.y
            + 'C' + source.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + target.y;
    }

    static horizontalLinkPath(source: Point, target: Point):string {
        return 'M' + source.x + ',' + source.y
            + 'C' + (source.x + target.x) / 2 + ',' + source.y
            + ' ' + (source.x + target.x) / 2 + ',' + target.y
            + ' ' + target.x + ',' + target.y;
    }

    static isNodePositionChanged(currNode, nextNode) {
        return currNode.position.x !== nextNode.position.x ||
            currNode.position.y !== nextNode.position.y;
    }

    static isNodeSizeChanged({size: currSize = {}}, {size: nextSize = {}}) {
        return currSize.width !== nextSize.width ||
            currSize.height !== nextSize.height;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            isVertical: props.isVertical,
            isDirected: props.isDirected,
            source: props.source,
            target: props.target,
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        const {source, target} = this.state;
        const {source: nextSource, target: nextTarget} = nextProps;
        const nextState = {};

        if (
            Edge.isNodePositionChanged(source, nextSource) ||
            Edge.isNodeSizeChanged(source, nextSource)
        ) {
            nextState.source = nextSource;
        }

        if (
            Edge.isNodePositionChanged(target, nextTarget) ||
            Edge.isNodeSizeChanged(target, nextTarget)
        ) {
            nextState.target = nextTarget;
        }

        if (Object.keys(nextState).length > 0) {
            this.setState(nextState);
        }
    }

    getPath(sourcePoint: Point, targetPoint: Point) {
        if (this.state.isVertical) {
            return Edge.vertiacalLinkPath(sourcePoint, targetPoint);
        }

        return Edge.horizontalLinkPath(sourcePoint, targetPoint);
    }

    getJointPoint(node: NodeJsonType) {
        const {isDirected, isVertical} = this.state;
        const {source, target} = this.props;

        const point = {
            x: node.position.x,
            y: node.position.y,
        };

        const {width = 0, height = 0} = node.size || {};

        if (isVertical) {
            if (isDirected) {
                if (node.id === source.id) {
                    point.x = node.position.x + (width / 2);
                    point.y = node.position.y + height;
                } else {
                    point.x = node.position.x + (width / 2);
                }
            }
        } else {
            if (isDirected) {
                if (node.id === source.id) {
                    point.x = node.position.x + width;
                    point.y = node.position.y + (height / 2);
                } else {
                    point.y = node.position.y + (height / 2);
                }
            } else if (node.id === source.id) {
                if (node.position.x + (width / 2) < target.position.x) {
                    point.x = node.position.x + width;
                    point.y = node.position.y + (height / 2);
                } else {
                    point.y = node.position.y + (height / 2);
                }

                return point;
            } else {
                if (node.position.x + (width / 2) < source.position.x) {
                    point.x = node.position.x + width;
                    point.y = node.position.y + (height / 2);
                } else {
                    point.y = node.position.y + (height / 2);
                }
            }
        }

        return point;
    }

    toJSON(): {source: string, target: string} {
        const {source, target} = this.state;

        return {
            source: source.id,
            target: target.id,
        };
    }

    renderPath(path: string) {
        const {source, target} = this.state;
        let customStyles = {};

        if (typeof this.getStyles === 'function') {
            customStyles = this.getStyles(source, target) || {};
        }

        return (<path className={styles.root} style={customStyles} d={path} />);
    }

    render() {
        const {source, target} = this.state;
        const sourceJoint = this.getJointPoint(source);
        const targetJoint = this.getJointPoint(target);

        const path = this.getPath(sourceJoint, targetJoint);

        return this.renderPath(path);
    }
}

export default Edge;
