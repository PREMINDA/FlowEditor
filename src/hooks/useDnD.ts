
import { useCallback } from 'react';
import type { RefObject } from 'react';
import { useReactFlow } from 'reactflow';
import { useFlowStore } from '../store/useFlowStore';
import type { AppNode } from '../types/process';

export function useDnD(reactFlowWrapper: RefObject<HTMLDivElement>) {
    const { project } = useReactFlow();
    const addNode = useFlowStore((state) => state.addNode);
    const setAlertMessage = useFlowStore((state) => state.setAlertMessage);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current) return;

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow/label');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Restriction: Only one Start Node allowed
            if (type === 'startNode') {
                const nodes = useFlowStore.getState().nodes;
                const hasStartNode = nodes.some(n => n.type === 'startNode');
                if (hasStartNode) {
                    setAlertMessage("Process can have only one start node.");
                    return;
                }
            }

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: AppNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: label || `${type} node` },
            };

            addNode(newNode);
        },
        [project, addNode, reactFlowWrapper, setAlertMessage]
    );

    return { onDragOver, onDrop };
}
