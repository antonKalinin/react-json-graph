import React from 'react';
import {Edge} from '../../index';

export class GitEdge extends Edge {
    getStyles(source, target) {
        if (parseInt(target.id) === 3) {
            return {stroke: '#FF5733'};
        }

        if (parseInt(target.id)  > 5) {
            if (parseInt(source.id) ===5 && parseInt(target.id) === 9) {
                return null;
            }

            return {stroke: '#fff'};
        }
    }
}
