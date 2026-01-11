import json
import random
import time

def generate_large_flowchart(num_action_nodes=1000, num_vars=50):
    timestamp = str(int(time.time() * 1000))
    process_id = f"process-{timestamp}"
    
    # Generate Variables
    variables = []
    for i in range(1, num_vars + 1):
        variables.append({
            "id": f"var{i}",
            "name": f"Variable_{i}",
            "type": "string",
            "defaultValue": f"default_val_{i}",
            "category": random.choice(["input", "output", "local"])
        })
    
    # Generate Start Node
    nodes = []
    start_node_id = f"startNode-{timestamp}"
    nodes.append({
        "id": start_node_id,
        "type": "startNode",
        "position": {"x": 0, "y": 0},
        "data": {"label": "Start"},
        "width": 100,
        "height": 40,
        "selected": False,
        "positionAbsolute": {"x": 0, "y": 0},
        "dragging": False
    })

    # Generate Action Nodes
    edges = []
    previous_node_id = start_node_id
    
    # Layout configuration
    cols = 10
    x_spacing = 300
    y_spacing = 250
    
    for i in range(num_action_nodes):
        node_id = f"actionNode-{timestamp}-{i}"
        
        # Grid Layout
        row = i // cols
        col = i % cols
        x = col * x_spacing
        y = (row + 1) * y_spacing # Start below the start node
        
        # Random inputs/outputs
        input_var = f"var{random.randint(1, num_vars)}"
        output_var = f"var{random.randint(1, num_vars)}"
        
        nodes.append({
            "id": node_id,
            "type": "calltoProcessNode",
            "position": {"x": x, "y": y},
            "data": {
                "label": f"Action {i + 1}",
                "inputs": {
                    input_var.capitalize(): {
                        "variableId": input_var,
                        "type": "string"
                    }
                },
                "outputs": {
                    output_var.capitalize(): {
                        "variableId": output_var,
                        "type": "string"
                    }
                }
            },
            "width": 200,
            "height": 200,
            "selected": False,
            "positionAbsolute": {"x": x, "y": y},
            "dragging": False
        })
        
        # Create Edge from previous node
        edge_id = f"edge-{i}"
        edges.append({
            "source": previous_node_id,
            "sourceHandle": "exec-out",
            "target": node_id,
            "targetHandle": "exec-in",
            "id": edge_id
        })
        
        previous_node_id = node_id

    chart_data = {
        "id": process_id,
        "name": f"Large Process ({num_action_nodes} nodes)",
        "blackboard": {
            "variables": variables
        },
        "nodes": nodes,
        "edges": edges
    }
    
    return chart_data

if __name__ == "__main__":
    # You can change these values
    NUM_NODES = 200
    NUM_VARS = 60
    OUTPUT_FILE = "large.flowchartprocess.json"
    
    print(f"Generating Flowchart with {NUM_NODES} nodes...")
    data = generate_large_flowchart(NUM_NODES, NUM_VARS)
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully generated {OUTPUT_FILE}")
