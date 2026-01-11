
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../../store/useFlowStore';
import { ActionNode } from './nodes/ActionNode';
import { AssignNode } from './nodes/AssignNode';
import { StartNode } from './nodes/StartNode';
import { CallProcessNode } from './nodes/CallProcessNode';
import { NoteNode } from './nodes/NoteNode';
import { useShallow } from 'zustand/react/shallow';

const nodeTypes = {
    actionNode: ActionNode,
    assignNode: AssignNode,
    startNode: StartNode,
    calltoProcessNode: CallProcessNode,
    callProcessNode: CallProcessNode, // Legacy support
    noteNode: NoteNode,
};

import { CommandPalette } from './CommandPalette';

const selector = (state: any) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
});

// Export directly, as App.tsx already provides the ReactFlowProvider context
export function FlowCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlowStore(useShallow(selector));

    return (
        <div className="w-full h-full bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
                defaultEdgeOptions={{
                    markerEnd: { type: MarkerType.ArrowClosed, width: 8, height: 8, color: 'var(--primary)' },
                    style: { strokeWidth: 2.5, stroke: 'var(--primary)' },
                }}
                panOnScroll
                zoomOnScroll={false}
                zoomActivationKeyCode="Meta"
            >
                <Background color="var(--muted)" gap={20} size={1} />
                <Controls />
                <MiniMap style={{ height: 120 }} zoomable pannable />
                <CommandPalette />
            </ReactFlow>
        </div>
    );
}
