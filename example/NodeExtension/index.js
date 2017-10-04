import React from 'react';
import {Node} from '../../index';
import cityNodeStyles from './CityNode.css';
import gitNodeStyles from './GitNode.css';

export class CityNode extends Node {
    renderContainer({content, isDragging}) {
        const className = `${cityNodeStyles.container} ${isDragging ? cityNodeStyles.container_dragging_yes : ''}`;

        return (
            <div className={className}>
                <div className={cityNodeStyles.label}>{content}</div>
            </div>
        );
    }
}

export class GitNode extends Node {
    renderContainer({content, isDragging}) {
        const className = `${gitNodeStyles.container} ${isDragging ? gitNodeStyles.container_dragging_yes : ''}`;

        return (
            <div className={className}>
                <div className={gitNodeStyles.label}>{content}</div>
            </div>
        );
    }
}

