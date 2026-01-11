import type { Node, Edge } from 'reactflow';

export type VariableType = 'string' | 'number' | 'boolean' | 'vector3' | 'object';

export type VariableCategory = 'input' | 'output' | 'local';

export interface Variable {
    id: string;
    name: string;
    type: VariableType;
    defaultValue: any;
    category: VariableCategory;
}

export interface Blackboard {
    variables: Variable[];
}

// Data attached to React Flow Nodes
export interface FlowNodeData {
    label: string;
    // Specific to node type (Action/CallProcess)
    // Maps port ID -> Configuration
    inputs?: Record<string, { variableId?: string; type?: string }>;
    outputs?: Record<string, { variableId?: string; type?: string }>;

    // Action Node Properties - MOVED TO ROOT
    // javaClassName?: string;

    // Legacy/Other props
    // For CallProcessNode, which process to call
    processId?: string;

    // For NoteNode
    note?: string;
}

// Explicit Node Types
export interface CallProcessNode extends Node<FlowNodeData> {
    type: 'calltoProcessNode';
    callToProcess?: string;
}

export interface ActionNode extends Node<FlowNodeData> {
    type: 'actionNode';
    javaClassName?: string;
}

export type AppNode = Node<FlowNodeData> | CallProcessNode | ActionNode;

// The root objects
export interface ProcessSchema {
    id: string;
    name: string;
    type?: string;
    filename?: string;
    blackboard: Blackboard;
    nodes: AppNode[];
    edges: Edge[];
    viewport?: { x: number; y: number; zoom: number };
}
