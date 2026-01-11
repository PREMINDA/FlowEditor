import { useState } from 'react';
import { useFlowStore } from '../../../store/useFlowStore';
import type { FlowNodeData } from '../../../types/process';
import { Handle, Position } from 'reactflow';
import { NodeIOModal } from './NodeIOModal';

interface NodeIOProps {
    nodeId: string;
    data: FlowNodeData;
    type: 'inputs' | 'outputs';
}

export function NodeIO({ nodeId, data, type }: NodeIOProps) {
    const updateNode = useFlowStore((state: any) => state.updateNode);
    const ports = data[type] || {};
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const onDrop = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const variableId = event.dataTransfer.getData('application/reactflow-var-id');
        const variableName = event.dataTransfer.getData('application/reactflow-var-name');

        if (variableId && variableName) {
            // Ensure unique name
            let newPortName = variableName;
            let counter = 1;
            while (ports[newPortName]) {
                newPortName = `${variableName}_${counter}`;
                counter++;
            }

            updateNode(nodeId, {
                [type]: {
                    ...ports,
                    [newPortName]: { variableId, type: 'string' }
                }
            });
        }
    };

    return (
        <div
            className="flex flex-col gap-1 mt-2 min-h-[20px] bg-muted/10 p-1 rounded-md border border-transparent hover:border-primary/30 transition-colors group/io"
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{type}</span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 hover:bg-muted/50 rounded text-muted-foreground hover:text-primary transition-colors"
                    title="Edit Ports"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {Object.entries(ports).map(([name, config]) => (
                <div key={name} className="relative group flex items-center justify-between bg-background border border-border shadow-sm p-1.5 rounded-md transition-all hover:border-primary">
                    {/* Handle */}
                    <Handle
                        id={name}
                        type={type === 'inputs' ? 'target' : 'source'}
                        position={type === 'inputs' ? Position.Left : Position.Right}
                        style={{
                            [type === 'inputs' ? 'left' : 'right']: -10,
                            width: 6,
                            height: 6,
                            background: '#22c55e', // emerald-500
                            border: '1px solid var(--background)',
                            top: '50%'
                        }}
                    />

                    <div className="flex w-full px-2 justify-between items-center">
                        <span className="text-xs font-medium text-foreground/90">{name}</span>
                        {config.variableId && (
                            <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 truncate max-w-[80px]">
                                {config.variableId}
                            </span>
                        )}
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {Object.keys(ports).length === 0 && (
                <div className="text-[10px] text-muted-foreground/70 italic px-2 py-2 text-center borderBorder-dashed border-border/50 rounded bg-background/50">
                    Drop variable here
                </div>
            )}

            {isModalOpen && (
                <NodeIOModal
                    nodeId={nodeId}
                    data={data}
                    type={type}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
