import { useState } from 'react';
import { useFlowStore } from '../../store/useFlowStore';
import { BlackboardModal } from './BlackboardModal';
import type { VariableCategory } from '../../types/process';
import { clsx } from 'clsx';
import { getNodeStyle } from '../../config/nodeStyles';

export function Sidebar() {
    const [activeTab, setActiveTab] = useState<'palette' | 'variables' | 'process'>('palette');

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

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
        <aside className="w-[250px] bg-card border-r border-border flex flex-col overflow-hidden transition-all">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30 p-1.5 gap-1.5 shrink-0">
                <button
                    onClick={() => setActiveTab('palette')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'palette'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Palette
                </button>
                <button
                    onClick={() => setActiveTab('variables')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'variables'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    Variables
                </button>
                <button
                    onClick={() => setActiveTab('process')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'process'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Process
                </button>
            </div>

            {/* Sliding Container */}
            <div className="flex-1 relative overflow-hidden bg-card/50">
                {/* Palette View */}
                <div className={clsx(
                    "absolute inset-0 p-4 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'palette' ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* <h2 className="font-bold text-foreground mb-4">Component Palette</h2> */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Flow Control</h3>
                            {(() => {
                                const style = getNodeStyle('startNode');
                                return (
                                    <div
                                        className={clsx("p-3 rounded-r-md cursor-grab text-foreground text-sm hover:shadow-md active:cursor-grabbing transition-all hover:translate-x-1", style.colors.bgLight, "border-l-4", style.colors.borderLeft)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'startNode', style.label)}
                                    >
                                        <div className="font-bold flex items-center gap-2">
                                            <svg className={clsx("w-4 h-4", style.colors.text)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {style.label}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-mt-4">Actions</h3>
                            {(() => {
                                const style = getNodeStyle('actionNode');
                                return (
                                    <div
                                        className={clsx("p-3 rounded-r-md cursor-grab text-foreground text-sm hover:shadow-md active:cursor-grabbing transition-all hover:translate-x-1", style.colors.bgLight, "border-l-4", style.colors.borderLeft)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'actionNode', style.label)}
                                    >
                                        <div className="font-bold flex items-center gap-2">
                                            <svg className={clsx("w-4 h-4", style.colors.text)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            {style.label}
                                        </div>
                                    </div>
                                );
                            })()}
                            {(() => {
                                const style = getNodeStyle('assignNode');
                                return (
                                    <div
                                        className={clsx("p-3 rounded-r-md cursor-grab text-foreground text-sm hover:shadow-md active:cursor-grabbing transition-all hover:translate-x-1", style.colors.bgLight, "border-l-4", style.colors.borderLeft)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'assignNode', style.label)}
                                    >
                                        <div className="font-bold flex items-center gap-2">
                                            <svg className={clsx("w-4 h-4", style.colors.text)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            {style.label}
                                        </div>
                                    </div>
                                );
                            })()}
                            {(() => {
                                const style = getNodeStyle('calltoProcessNode');
                                return (
                                    <div
                                        className={clsx("p-3 rounded-r-md cursor-grab text-foreground text-sm hover:shadow-md active:cursor-grabbing transition-all hover:translate-x-1", style.colors.bgLight, "border-l-4", style.colors.borderLeft)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'calltoProcessNode', style.label)}
                                    >
                                        <div className="font-bold flex items-center gap-2">
                                            <svg className={clsx("w-4 h-4", style.colors.text)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                            {style.label}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-mt-4">Documentation</h3>
                            {(() => {
                                const style = getNodeStyle('noteNode');
                                return (
                                    <div
                                        className={clsx("p-3 rounded-r-md cursor-grab text-foreground text-sm hover:shadow-md active:cursor-grabbing transition-all hover:translate-x-1", style.colors.bgLight, "border-l-4", style.colors.borderLeft)}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, 'noteNode', style.label)}
                                    >
                                        <div className="font-bold flex items-center gap-2">
                                            <svg className={clsx("w-4 h-4", style.colors.text)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            {style.label}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Process View */}
                <div className={clsx(
                    "absolute inset-0 p-4 pt-1 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'process' ? "translate-x-0" : "translate-x-full"
                )}>
                    {/* Header for visual consistency */}
                    <div className="flex justify-between items-center my-4 border-b border-border pb-2 sticky top-0 bg-card z-10 backdrop-blur-sm">
                        <h2 className="font-bold text-foreground">Process Metadata</h2>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Process Name</label>
                        <input
                            type="text"
                            value={useFlowStore((state) => state.processName)}
                            readOnly
                            className="w-full px-3 py-2 bg-transparent border border-border/50 rounded text-sm text-muted-foreground cursor-not-allowed focus:outline-none italic"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Derived from file path. Rename file in VS Code to update.
                        </p>
                    </div>
                    {/* Process Type is inferred/fixed, no longer user-editable */}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Filename (JSON Property)</label>
                        <input
                            type="text"
                            value={useFlowStore((state) => state.processFilename)}
                            readOnly
                            className="w-full px-3 py-2 bg-transparent border border-border/50 rounded text-sm text-muted-foreground cursor-not-allowed focus:outline-none italic"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Automatically synchronized with relative file path.
                        </p>
                    </div>
                </div>
                {/* Variables View */}
                <div className={clsx(
                    "absolute inset-0 p-4 pt-1 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'variables' ? "translate-x-0" : "translate-x-full"
                )}>
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
                </div>
            </div>

            {
                modalConfig && (
                    <BlackboardModal
                        filterCategory={modalConfig.category}
                        isGlobalSearch={modalConfig.mode === 'global'}
                        onClose={() => setModalConfig(null)}
                    />
                )
            }
        </aside >
    );
}
