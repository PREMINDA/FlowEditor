
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

import { getVsCodeApi } from '../../utils/vscode';
import type { Node } from 'reactflow';

// ... (existing imports)

// Export directly, as App.tsx already provides the ReactFlowProvider context
export function FlowCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlowStore(useShallow(selector));

    const onNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
        const vscode = getVsCodeApi();
        if (!vscode) {
            console.warn("VS Code API not available");
            return;
        }

        if (node.type === 'actionNode') {
            const javaClassName = (node as any).javaClassName || node.data.javaClassName;
            if (javaClassName) {
                vscode.postMessage({
                    command: 'openFile',
                    payload: {
                        type: 'java',
                        target: javaClassName
                    }
                });
            }
        } else if (node.type === 'calltoProcessNode' || node.type === 'callProcessNode') {
            const callToProcess = (node as any).callToProcess || node.data.processId; // processId was legacy? Checking types/process.ts
            // Actually types/process.ts says `callToProcess` on root, and `processId` on legacy data?
            // Let's check logic: Store serialization puts it on root.
            // But we should check both to be safe.
            if (callToProcess) {
                vscode.postMessage({
                    command: 'openFile',
                    payload: {
                        type: 'process',
                        target: callToProcess
                    }
                });
            }
        }
    };

    return (
        <div className="w-full h-full bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}
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
