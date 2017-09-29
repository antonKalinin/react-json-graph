import React, {Component} from 'react';
import {RadioGroup, RadioButton} from 'react-toolbox/lib/radio';
import {Button} from 'react-toolbox/lib/button';
import {connect} from 'react-redux';
import {setGraph} from '../actions';

import styles from './manager.css';

class Manager extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handleChangeGraph(value) {
        this.props.dispatch(setGraph(value));
    }

    render() {
        const {grapsNames, graphJSON} = this.props;

        return (
            <div className={styles.root}>
                <h4 className={styles.examplesTitle}>Choose example:</h4>
                <RadioGroup name='graphs' value={graphJSON.label} onChange={(value) => this.handleChangeGraph(value)}>
                    {grapsNames.map((graphName) => (
                        <RadioButton
                            className={styles.radio}
                            key={graphName}
                            label={graphName}
                            value={graphName}
                        />
                    ))}
                </RadioGroup>
                {/* Zoom round buttons
                    <div className={styles.zoom}>
                        <Button onClick={() => { this.changeZoom(1) }} className={styles.zoom_in} icon='add' floating mini />
                        <Button onClick={() => { this.changeZoom(-1) }} className={styles.zoom_out} icon='remove' floating mini />
                    </div>
                */}
            </div>
        );
    }
}

export default connect(state => ({
    grapsNames: state.grapsNames,
    graphJSON: state.graphJSON,
}))(Manager);

