/* @flow */

export type GraphType = {
    offsetTop: number,
    offsetLeft: number,
    clientWidth: number,
    clientHeight: number,
};

export type NodeJsonType = {
    id: string,
    label: string,
    position: {
        x: number,
        y: number,
    },
    size: ?{
        width: number,
        height: number
    }
};

export type EdgeJsonType = {
    source: string,
    target: string,
};
