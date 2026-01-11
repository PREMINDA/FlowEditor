import type {
    Connection,
    Edge,
    EdgeChange,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from 'reactflow';

import { create } from 'zustand';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import type { ProcessSchema, Variable, FlowNodeData, AppNode } from '../types/process';

interface FlowState {
    // Graph State
    nodes: AppNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (node: AppNode) => void;
    updateNode: (id: string, data: Partial<FlowNodeData>) => void;
    updateNodeRoot: (id: string, updates: Record<string, any>) => void;
    selectNode: (id: string) => void;

    // Blackboard State
    variables: Variable[];
    addVariable: (variable: Variable) => void;
    updateVariable: (id: string, updates: Partial<Variable>) => void;
    removeVariable: (id: string) => void;
    setVariables: (variables: Variable[]) => void;

    // Persistence
    loadProcess: (process: ProcessSchema) => void;
    serialize: () => ProcessSchema;

    // Process Metadata
    processId: string;
    processName: string;
    processFilename: string;
    processType: string;
    setProcessName: (name: string) => void;
    setProcessFilename: (filename: string) => void;
    setProcessType: (type: string) => void;

    // UI State
    editingNodeId: string | null;
    setEditingNode: (id: string | null) => void;

    // Global Alerts
    alertMessage: string | null;
    setAlertMessage: (message: string | null) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    variables: [],
    processId: 'process-' + Date.now(),
    processName: 'My Process',
    processFilename: 'process.flowchartprocess.json',
    processType: 'processNode',
    editingNodeId: null,

    setProcessName: (name) => set({ processName: name }),
    setProcessFilename: (filename) => set({ processFilename: filename }),
    setProcessType: (type) => set({ processType: type }),

    setEditingNode: (id) => set({ editingNodeId: id }),

    alertMessage: null,
    setAlertMessage: (message) => set({ alertMessage: message }),

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    addNode: (node) => {
        set((state) => ({ nodes: [...state.nodes, node] }));
    },
    updateNode: (id, data) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...data } } : node
            ),
        }));
    },
    updateNodeRoot: (id, updates) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id ? { ...node, ...updates } : node
            ),
        }));
    },
    selectNode: (id: string) => {
        set((state) => ({
            nodes: state.nodes.map((node) => ({
                ...node,
                selected: node.id === id,
            })),
        }));
    },

    addVariable: (variable) => {
        set((state) => ({ variables: [...state.variables, variable] }));
    },
    updateVariable: (id, updates) => {
        set((state) => ({
            variables: state.variables.map((v) =>
                v.id === id ? { ...v, ...updates } : v
            ),
        }));
    },
    removeVariable: (id) => {
        set((state) => ({
            variables: state.variables.filter((v) => v.id !== id),
        }));
    },
    setVariables: (variables) => {
        set({ variables });
    },

    loadProcess: (process) => {
        const edges = (process.edges || []).map(edge => {
            const { markerEnd, style, ...rest } = edge;
            return rest as Edge;
        });

        // Load nodes as-is. Root properties like 'callToProcess' are automatically preserved
        // their place on the node object by React Flow's default behavior.
        const nodes = (process.nodes || []);

        set({
            nodes: nodes,
            edges: edges,
            variables: process.blackboard?.variables || [],
            processId: process.id || 'process-' + Date.now(),
            processName: process.name || 'My Process',
            processFilename: process.filename || 'process.flowchartprocess.json',
            processType: process.type || 'processNode',
        });
    },
    serialize: () => {
        const state = get();

        // Serialize as-is. Root properties are already on the node objects.
        // However, for specific node types, we might need to ensure certain properties are present
        // or transformed for the ProcessSchema.
        const serializedNodes = state.nodes.map(node => {
            const baseNode: any = { ...node }; // Start with a shallow copy of the node

            // Conditionally add/ensure properties based on node type for serialization
            if (node.type === 'calltoProcessNode') {
                // Ensure callToProcess is included if it exists on the node
                if ((node as any).callToProcess !== undefined) {
                    baseNode.callToProcess = (node as any).callToProcess;
                }
            }
            if (node.type === 'actionNode') {
                // Ensure javaClassName is included if it exists on the node
                if ((node as any).javaClassName !== undefined) {
                    baseNode.javaClassName = (node as any).javaClassName;
                }
            }
            return baseNode;
        });

        return {
            id: state.processId,
            name: state.processName,
            type: state.processType,
            filename: state.processFilename,
            blackboard: {
                variables: state.variables,
            },
            nodes: serializedNodes, // Use the processed nodes
            edges: state.edges,
        };
    },
}));
