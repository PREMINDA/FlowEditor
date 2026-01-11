import { useState } from 'react';
import type { NodeProps } from 'reactflow';
import { clsx } from 'clsx';
import { useFlowStore } from '../../../store/useFlowStore';
import type { FlowNodeData } from '../../../types/process';
import { NoteModal } from './NoteModal';

export function NoteNode({ id, data, selected }: NodeProps<FlowNodeData>) {
    const updateNode = useFlowStore((state) => state.updateNode);
    const setEditingNode = useFlowStore((state) => state.setEditingNode);

    const [modalConfig, setModalConfig] = useState<{ mode: 'view' | 'edit' } | null>(null);

    const onSave = (newContent: string) => {
        updateNode(id, { note: newContent });
    };

    const noteContent = data.note || '';

    return (
        <>
            <div className={clsx(
                "w-[180px] shadow-sm rounded-md border bg-yellow-50/90 border-yellow-200 transition-all hover:shadow-md hover:border-yellow-400 group relative",
                selected && "ring-2 ring-primary/30"
            )}>
                {/* Header / Title */}
                <div className="px-3 py-2 border-b border-yellow-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-800 font-bold text-xs uppercase tracking-wider">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Note
                    </div>
                </div>

                {/* Content Preview / Body */}
                <div className="p-3">
                    <div
                        className="text-xs text-yellow-900/80 italic min-h-[40px] line-clamp-3 overflow-hidden whitespace-pre-wrap break-words"
                        title={noteContent} // Native tooltip as fallback or simple solution
                    >
                        {noteContent || "Add a note..."}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex border-t border-yellow-200/50 divide-x divide-yellow-200/50">
                    <button
                        className="flex-1 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-100/50 transition-colors flex items-center justify-center gap-1"
                        onClick={() => setModalConfig({ mode: 'view' })}
                        title="View Note"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                    </button>
                    <button
                        className="flex-1 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-100/50 transition-colors flex items-center justify-center gap-1"
                        onClick={() => setEditingNode(id)}
                        title="Edit Properties"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Edit
                    </button>
                    {/*
                    <button
                        className="flex-1 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-100/50 transition-colors flex items-center justify-center gap-1"
                        onClick={() => setModalConfig({ mode: 'edit' })}
                        title="Edit Note"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                    </button>
                    */}
                </div>


            </div>

            {/* NoteModal */}
            <NoteModal
                isOpen={!!modalConfig}
                mode={modalConfig?.mode || 'view'}
                content={noteContent}
                onSave={onSave}
                onClose={() => setModalConfig(null)}
            />
        </>
    );
}
