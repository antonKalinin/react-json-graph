import React from 'react';
import styles from './header.css';

export default () => (
    <div>
        <div className={styles.title}>React Json Graph</div>
        <div className={styles.description}>
            React component for visualizing graphs and networks
        </div>
        <ul className={styles.instructions}>
            <li>Mouse down on node and drag to move it</li>
            <li>Use mouse wheel to zoom in and out</li>
            <li>Mouse down and move on empty space to navigate over the graph</li>
        </ul>
    </div>
);
