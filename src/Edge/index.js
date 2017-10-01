/* @flow */
import React, {PureComponent} from 'react';

import styles from './edge.css';

import type {NodeJsonType} from '../types';

type Props = {
    vertical: boolean,
    directed: boolean,
    source: NodeJsonType,
    target: NodeJsonType,
};

type State = {
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

    static isNodeSizeChanged(currNode, nextNode) {
        if (!currNode.size && !nextNode.size) {
            return false;
        }

        if ((!currNode.size && nextNode.size) || (currNode.size && !nextNode.size)) {
            return true;
        }

        return currNode.size.width !== nextNode.size.width ||
            currNode.size.height !== nextNode.size.height;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
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
        if (this.props.vertical) {
            return Edge.vertiacalLinkPath(sourcePoint, targetPoint);
        }

        return Edge.horizontalLinkPath(sourcePoint, targetPoint);
    }

    getJointPoint(node: NodeJsonType) {
        const {directed, vertical} = this.props;
        const {source, target} = this.props;

        const point = {
            x: node.position.x,
            y: node.position.y,
        };

        const {width = 0, height = 0} = node.size || {};

        if (directed) {
            if (node.id === source.id) {
                point.x = node.position.x + width;
                point.y = node.position.y + (height / 2);
            } else {
                point.y = node.position.y + (height / 2);
            }

            return point;
        }

        if (node.id === source.id) {
            if (node.position.x + (width / 2) < target.position.x) {
                point.x = node.position.x + width;
                point.y = node.position.y + (height / 2);
            } else {
                point.y = node.position.y + (height / 2);
            }

            return point;
        }

        if (node.position.x + (width / 2) < source.position.x) {
            point.x = node.position.x + width;
            point.y = node.position.y + (height / 2);
        } else {
            point.y = node.position.y + (height / 2);
        }

        // TODO: write logic for vertical cases

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
        return (<path className={styles.root} d={path} />);
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
