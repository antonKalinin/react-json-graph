/* @flow */
import React, {Component} from 'react';
import type {ElementRef as ReactElementRef} from 'react';

import Node from '../Node';
import styles from './edge.css';

import NodeJsonType from '../types';

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

class Edge extends Component<Props, State> {
    static vertiacalLinkPath(source: Point, target: Point):string {
        return 'M' + source.x + ',' + source.y
            + 'C' + source.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + (source.y + target.y) / 2
            + ' ' + target.x + ',' + target.y;
    }

    static horizontalLinkPath(source: Point, target: Point):string {
        const sourceX = source.x + source.width;
        const sourceY = source.y + (source.height / 2);
        const targetY = target.y + (target.height / 2);

        return 'M' + source.x + ',' + source.y
            + 'C' + (source.x + target.x) / 2 + ',' + source.y
            + ' ' + (source.x + target.x) / 2 + ',' + target.y
            + ' ' + target.x + ',' + target.y;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            source: props.source,
            target: props.target,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {source, target} = this.state;

        if (nextProps.source.id !== source.id) {
            this.setState({source: nextProps.source});
        }

        if (nextProps.target.id !== target.id) {
            this.setState({target: nextProps.target});
        }
    }

    toJSON(): {source: string, target: string} {
        const {source, target} = this.state;

        return {
            source: source.id,
            target: target.id,
        };
    }

    getPath(sourcePoint: Point, targetPoint: Point) {
        if (this.props.vertical) {
            return Edge.vertiacalLinkPath(sourcePoint, targetPoint);
        }

        return Edge.horizontalLinkPath(sourcePoint, targetPoint);
    }


    getJointPoint(node) {
        const {directed, vertical} = this.props;
        const {source, target} = this.props;

        const point = {
            x: node.position.x,
            y: node.position.y,
        };

        if (directed) {
            if (node.id === source.id) {
                point.x = node.position.x + node.size.width;
                point.y = node.position.y + (node.size.height / 2);
            } else {
                point.y = node.position.y + (node.size.height / 2);
            }

            return point;
        }


        return point;
    }

    render() {
        const {source, target} = this.state;
        const sourceJoint = this.getJointPoint(source);
        const targetJoint = this.getJointPoint(target);

        const path = this.getPath(sourceJoint, targetJoint);

        return (
            <path className={styles.root} d={path} />
        );
    }
}

export default Edge;
