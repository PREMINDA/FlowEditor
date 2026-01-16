
import type { Edge } from 'reactflow';
import type { AppNode, ProcessSchema, Variable } from '../types/process';
import { DEFAULT_PROCESS_NAME, DEFAULT_PROCESS_FILENAME, DEFAULT_PROCESS_TYPE } from '../config/defaults';

export const loadProcessData = (process: ProcessSchema) => {
    const edges = (process.edges || []).map(edge => {
        const { markerEnd, style, ...rest } = edge;
        return rest as Edge;
    });

    const nodes = (process.nodes || []);

    return {
        nodes,
        edges,
        variables: process.blackboard?.variables || [],
        processId: process.id || 'process-' + Date.now(),
        processName: process.name || DEFAULT_PROCESS_NAME,
        processFilename: process.filename || DEFAULT_PROCESS_FILENAME,
        processType: process.type || DEFAULT_PROCESS_TYPE,
    };
};

export const serializeProcessData = (
    state: {
        nodes: AppNode[],
        edges: Edge[],
        variables: Variable[],
        processId: string,
        processName: string,
        processFilename: string,
        processType: string
    }
): ProcessSchema => {
    const serializedNodes = state.nodes.map(node => {
        const baseNode: any = { ...node };

        if (node.type === 'calltoProcessNode') {
            if ((node as any).callToProcess !== undefined) {
                baseNode.callToProcess = (node as any).callToProcess;
            }
        }
        if (node.type === 'actionNode') {
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
        nodes: serializedNodes,
        edges: state.edges,
    };
};
