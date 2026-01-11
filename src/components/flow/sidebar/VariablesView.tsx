import { useState } from 'react';
import { useFlowStore } from '../../../store/useFlowStore';
import { BlackboardModal } from '../BlackboardModal';
import type { VariableCategory } from '../../../types/process';

export function VariablesView() {
    const variables = useFlowStore((state) => state.variables);
    const [modalConfig, setModalConfig] = useState<{ mode: 'global' | 'category', category?: VariableCategory } | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const inputs = variables.filter(v => v.category === 'input');
    const outputs = variables.filter(v => v.category === 'output');
    const locals = variables.filter(v => (v.category || 'local') === 'local');

    const toggleSection = (category: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const onVariableDragStart = (event: React.DragEvent, variableId: string, variableName: string) => {
        event.dataTransfer.setData('application/reactflow-var-id', variableId);
        event.dataTransfer.setData('application/reactflow-var-name', variableName);
        event.dataTransfer.effectAllowed = 'copy';
    };

    const renderVariableSection = (title: string, items: typeof variables, category: VariableCategory) => {
        const isCollapsed = collapsedSections[category];

        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleSection(category)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isCollapsed ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            )}
                        </button>
                        <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">{title}</h3>
                    </div>
                    <button
                        onClick={() => setModalConfig({ mode: 'category', category })}
                        className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
                        title={`Manage ${title}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                {!isCollapsed && (
                    <div className="space-y-2">
                        {items.map(v => (
                            <div
                                key={v.id}
                                className="group flex items-center justify-between p-2 bg-background rounded-md shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all"
                                draggable
                                onDragStart={(e) => onVariableDragStart(e, v.id, v.name)}
                            >
                                <div className="font-medium text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[120px]" title={v.name}>{v.name}</div>
                                <span className="text-[9px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground uppercase opacity-70 group-hover:opacity-100">{v.type}</span>
                            </div>
                        ))}
                        {items.length === 0 && <div className="text-muted-foreground/60 text-xs italic px-2 py-4 text-center border border-dashed border-border/30 rounded-md">Empty</div>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="flex justify-between items-center my-4 border-b border-border pb-2 sticky top-0 bg-card z-10 backdrop-blur-sm">
                <h2 className="font-bold text-foreground">Blackboard</h2>
                <button
                    onClick={() => setModalConfig({ mode: 'global' })}
                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Search Variables"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {renderVariableSection("Input Parameters", inputs, 'input')}
            {renderVariableSection("Output Parameters", outputs, 'output')}
            {renderVariableSection("Process Data", locals, 'local')}

            {modalConfig && (
                <BlackboardModal
                    filterCategory={modalConfig.category}
                    isGlobalSearch={modalConfig.mode === 'global'}
                    onClose={() => setModalConfig(null)}
                />
            )}
        </>
    );
}
