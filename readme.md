## React JSON Graph

React Component for rendering graphs in JSON Graph Format

![](https://raw.githubusercontent.com/antonKalinin/react-json-graph/master/static/usage.gif)

Demo: http://antonkalinin.github.io/react-json-graph/

Inspired by:
- https://github.com/jsongraph/json-graph-specification
- https://twitter.com/tjholowaychuk/status/754836588379590656

## Installation

```bash
npm install --save react-json-graph
```

## Usage
```jsx
<Graph
    json={{nodes: [...], edges: [...]}}
    onChange={(newGraphJSON) => {}}
/>
```

#### Props

- `width: Number` (**required**) width of the graph

- `height: Number` (**required**) height of the graph, required

- `json: Object` graph representation in JSON with two keys: `nodes` and `edges`. See example below.

- `scale: Number` (default: **1**) current scale of graph

- `minScale: Number` (default: **1**) minimum value of scale, for now can not be less then **0.3**

- `maxScale: Number` (default: **1**)  maximum value of scale, for now can not be greater then **1**

- `style: Object` styles of graph (styles for nodes and edges will be added in future)

- `onChange: Function` calls when graph structure or node position has been changed, accepts new graph JSON as only parameter


### Example of JSON

```js
{
    nodes: [{
        id: '0',
        label: 'User',
        position: {x: 150, y: 250},
    },
    {
        id: '1',
        label: 'Robot',
        position: {x: 350, y: 350},
    },
    {
        id: '2',
        label: 'Frontend',
        position: {x: 400, y: 150},
    },
    {
        id: '3',
        label: 'Backend',
        position: {x: 700, y: 250},
    },
    {
        id: '4',
        label: 'DB',
        position: {x: 1000, y: 300},
    }],
    edges: [
        {source: '0', target: '2'},
        {source: '1', target: '3'},
        {source: '2', target: '3'},
        {source: '3', target: '4'},
    ],
}
```

## License

  [MIT](LICENSE)

