import { useFlowStore } from '../../store/useFlowStore';
import { clsx } from 'clsx';
import { getNodeStyle } from '../../config/nodeStyles';
import type { CallProcessNode, ActionNode } from '../../types/process';

export function PropertyPanel() {
    const editingNodeId = useFlowStore((state) => state.editingNodeId);
    const setEditingNode = useFlowStore((state) => state.setEditingNode);
    const nodes = useFlowStore((state) => state.nodes);
    const updateNode = useFlowStore((state) => state.updateNode);

    const activeNode = nodes.find(n => n.id === editingNodeId);

    const isOpen = !!editingNodeId;

    // Close handler
    const handleClose = () => setEditingNode(null);

    // Only Action Nodes are supported for now, but we check type just in case
    const isActionNode = activeNode?.type === 'actionNode';

    const headerStyle = getNodeStyle(activeNode?.type || 'default');

    // Use the config values directly
    const wrapperClass = clsx(
        headerStyle.colors.bgLight,
        "border-l-4",
        headerStyle.colors.borderLeft
    );
    const iconClass = headerStyle.colors.text;

    return (
        <div
            className={clsx(
                "absolute bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out z-40 flex flex-col",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}
            style={{ height: '300px' }}
        >
            {/* Header */}
            <div className={clsx("flex items-center justify-between px-4 py-3 border-b border-border", wrapperClass)}>
                <div className="flex items-center gap-3">
                    {/* Icon based on type */}
                    {activeNode?.type === 'actionNode' && <svg className={clsx("w-5 h-5", iconClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    {activeNode?.type === 'startNode' && <svg className={clsx("w-5 h-5", iconClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {activeNode?.type === 'assignNode' && <svg className={clsx("w-5 h-5", iconClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    {(activeNode?.type === 'calltoProcessNode' || activeNode?.type === 'callProcessNode') && <svg className={clsx("w-5 h-5", iconClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>}
                    {activeNode?.type === 'noteNode' && <svg className={clsx("w-5 h-5", iconClass)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}

                    <span className="font-bold text-sm text-foreground">
                        Properties: {activeNode?.data.label || 'Node'}
                    </span>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* Node View */}
                {activeNode && (
                    <div className="space-y-4 max-w-lg">

                        {/* Common Properties: Label */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Label</label>
                            <input
                                type="text"
                                value={activeNode.data.label}
                                onChange={(e) => updateNode(activeNode.id, { label: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                                placeholder="Node Label"
                            />
                        </div>

                        {/* Action Node Specific: Java Class Name */}
                        {isActionNode && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Java Class Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={(activeNode as ActionNode).javaClassName || (activeNode.data as any).javaClassName || ''}
                                        onChange={(e) => useFlowStore.getState().updateNodeRoot(activeNode.id, { javaClassName: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:text-muted-foreground/50"
                                        placeholder="com.example.MyAction"
                                    />
                                    <div className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                                        .java
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Fully qualified class name for the backing implementation.
                                </p>
                            </div>
                        )}

                        {/* Call Process Node Specific: Call To Process */}
                        {(activeNode.type === 'calltoProcessNode' || activeNode.type === 'callProcessNode') && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Call To Process</label>
                                <input
                                    type="text"
                                    value={(activeNode as CallProcessNode).callToProcess || ''}
                                    onChange={(e) => useFlowStore.getState().updateNodeRoot(activeNode.id, { callToProcess: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                                    placeholder="process_name"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    The ID or name of the process to call.
                                </p>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
