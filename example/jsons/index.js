export default {
    "nodes": [{
        "id": "0",
        "label": "User",
        "position": {
            "x": 32.999999999999915,
            "y": 27.999999999999943
        }
    }, {
        "id": "1",
        "label": "Robot",
        "position": {
            "x": 117.99999999999955,
            "y": 190.99999999999955
        }
    }, {
        "id": "2",
        "label": "Frontend",
        "position": {
            "x": 177.9999999999995,
            "y": 86.99999999999986
        }
    }, {
        "id": "3",
        "label": "Backend",
        "position": {
            "x": 321.9999999999991,
            "y": 141.9999999999998
        }
    }, {
        "id": "4",
        "label": "DB",
        "position": {
            "x": 545.9999999999993,
            "y": 191.99999999999972
        }
    }],
    "edges": [{
        "source": "0",
        "target": "2"
    }, {
        "source": "1",
        "target": "3"
    }, {
        "source": "2",
        "target": "3"
    }, {
        "source": "3",
        "target": "4"
    }]
};