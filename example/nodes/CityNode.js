import React from 'react';
import {Node} from '../../index';
import styles from './CityNode.css';

export default class CityNode extends Node {
    renderContainer({content, isDragging}) {
        const className = `${styles.container} ${isDragging ? styles.container_dragging_yes : ''}`;

        return (
            <div className={className}>
                <div className={styles.label}>{content}</div>
            </div>
        );
    }
}
