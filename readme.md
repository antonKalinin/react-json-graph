![](https://raw.githubusercontent.com/antonKalinin/react-json-graph/master/static/usage_demo.gif)

[![npm version](https://badge.fury.io/js/react-json-graph.svg)](https://badge.fury.io/js/react-json-graph)

React Component for rendering graphs in JSON Graph Format

#### [Demo](http://antonkalinin.github.io/react-json-graph/)

Inspired by:
- https://github.com/jsongraph/json-graph-specification
- https://twitter.com/tjholowaychuk/status/754836588379590656

## Installation

```bash
npm install --save react-json-graph
```

## Getting Started
```jsx
import Graph from 'react-json-graph';

<Graph
    width={600}
    height={400}
    json={{
        nodes: [{
            id: '0',
            label: 'Alice',
            position: {x: 150, y: 250},
        },
        {
            id: '1',
            label: 'Bob',
            position: {x: 350, y: 350},
        }],
        edges: [{
            source: '0',
            target: '1'
        }]
    }}
    onChange={(newGraphJSON) => {}}
/>
```

#### Graph Component Properties

```js
{
    /* Required Props */
    width: Number, // required, width of the graph
    height: Number, // required, height of the graph
    json: {
        nodes: [
            {
                id: String,
                label: String, // string content of the node
                position: {
                    x: Number,
                    y: Number,
                },
                // Optional
                size: {
                    width: Number, // width of the node
                    height: Number, // height of the node
                },
            },
        ],
        edges: [
            {
                source: String, // id of the source node
                target: String, // id of the target node
            },
        ],

        // Optional
        isStatic: Boolean, // if true, can't change nodes position by dragging
        isVertical: Boolean, // if true, all edges draw for vertical graph
        isDirected: Boolean, // if false, edges will change connection position depending on source and target nodes position relative to each other
    },

    /* Optional Props */
    scale: Number, // default is 1, current scale of graph
    minScale: Number, // default is 1, minimum value of scale, for now can not be less then 0.3
    maxScale: Number, // default is 1, maximum value of scale, for now can not be greater then 1

    onChange: (updatedJSON) => {}, // calls when graph structure or node position has been changed, accepts new graph JSON as only parameter

    Node: React.Component, // React.Component inherited from Node that customize node appearence
    Edge: React.Component, // React.Component inherited from Edge that customize edge appearence

    shouldNodeFitContent: Boolean, // if true, node will try to resize to fit content
}
```

### Custom Nodes and Edges

![](https://raw.githubusercontent.com/antonKalinin/react-json-graph/master/static/git_demo.gif)


```jsx
import {Node, Edge} from 'react-json-graph';

class GitNode extends Node {
    renderContainer({content, isDragging}) {
        const className = `Node ${isDragging ? 'Node_dragging_yes' : ''}`;

        return (
            <div className={className}>
                <div className='Node__label'>{content}</div>
            </div>
        );
    }
}

class GitEdge extends Edge {
    getStyles(source, target) {
        if (parseInt(target.id) === 3) {
            return {stroke: '#FF5733'};
        }

        if (parseInt(target.id)  > 5) {
            if (parseInt(source.id) ===5 && parseInt(target.id) === 9) {
                return null;
            }

            return {stroke: '#000'};
        }
    }
}
```

## License

  [MIT](LICENSE)

