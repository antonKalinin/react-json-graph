import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import styles from './Manager.css'

let Icon = (props) => {
    let types = {
        graph: (
            <path fill="#000000" d="M2,2V8H4.28L5.57,16H4V22H10V20.06L15,20.05V22H21V16H19.17L20,9H22V3H16V6.53L14.8,8H9.59L8,5.82V2M4,4H6V6H4M18,5H20V7H18M6.31,8H7.11L9,10.59V14H15V10.91L16.57,9H18L17.16,16H15V18.06H10V16H7.6M11,10H13V12H11M6,18H8V20H6M17,18H19V20H17" />
        ),
        node: (
            <path fill="#000000" d="M22,9H19.97C18.7,5.41 15.31,3 11.5,3A9,9 0 0,0 2.5,12C2.5,17 6.53,21 11.5,21C15.31,21 18.7,18.6 20,15H22M20,11V13H18V11M17.82,15C16.66,17.44 14.2,19 11.5,19C7.64,19 4.5,15.87 4.5,12C4.5,8.14 7.64,5 11.5,5C14.2,5 16.66,6.57 17.81,9H16V15" />
        ),
        edge: (
            <path fill="#000000" d="M15,3V7.59L7.59,15H3V21H9V16.42L16.42,9H21V3M17,5H19V7H17M5,17H7V19H5" />
        )
    }

    return (
        <svg className={ styles.tabIcon } viewBox="0 0 24 24">
            { types[props.type] }
        </svg>
    );
}

class Tab extends Component {
    constructor(props) {
        super(props);
    }

    handleClick() {
        this.props.tabClick(this.props.index);
    }

    render() {
        let cx = classNames.bind(styles);

        let className = cx({
            tab: true,
            tab_active: this.props.active,
        });

        return (
            <div title={ this.props.title } className={ className } key={ this.props.key } onClick={ this.handleClick.bind(this) }>
                <Icon type={ this.props.icon } />
                { this.props.title }
            </div>
        );
    }
}

const ManagerContent = () => {
    return (
        <div className={ styles.content }>
            <h1>Content</h1>
        </div>
    );
};

class Manager extends Component {

    constructor(props) {
        super();

        this.state = {
            activeTabId: 0,
            isCollapsed: true
        };

        // this.store = this.context.store;
        // this.state = this.store.getState();

        this.toogleManager = this.toogleManager.bind(this);
    }

    handleTabClick(id) {
        var previousActiveTabId = this.state.activeTabId;

        this.props.items[previousActiveTabId].active = false;
        this.props.items[id].active = true;
        this.setState({ activeTabId: id });
    }

    toogleManager() {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    render() {
        let cx = classNames.bind(styles);

        let className = cx({
            root: true,
            root_collapsed: this.state.isCollapsed,
        });

        return (
            <div className={ className }>
                <div className={ styles.toggler } onClick={ this.toogleManager }></div>
                <div className={ styles.inner }>
                    <Tab title='Graph' icon='graph' />
                    <ManagerContent />
                    <Tab title='Node' icon='node' />
                    <Tab title='Edge' icon='edge'/>
                </div>
            </div>
        );
    }

}

export default Manager;