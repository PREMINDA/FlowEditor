import clsx from 'clsx';
import { Handle, Position } from 'reactflow';
import type { ReactNode, MouseEvent } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBreakpointContext } from '../../../context/BreakpointContext';
import { useFlowStore } from '../../../store/useFlowStore';

// Context menu component
interface ContextMenuProps {
    x: number;
    y: number;
    onToggleBreakpoint: () => void;
    hasBreakpoint: boolean;
    onClose: () => void;
}

function ContextMenu({ x, y, onToggleBreakpoint, hasBreakpoint, onClose }: ContextMenuProps) {
    return createPortal(
        <>
            {/* Backdrop to close menu on click outside */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />
            {/* Menu */}
            <div
                className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[180px]"
                style={{ left: x, top: y }}
            >
                <button
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                    onClick={() => {
                        onToggleBreakpoint();
                        onClose();
                    }}
                >
                    <span className="text-destructive">{hasBreakpoint ? '●' : '○'}</span>
                    {hasBreakpoint ? 'Remove Breakpoint' : 'Add Breakpoint'}
                </button>
            </div>
        </>,
        document.body
    );
}

// Common handle styles
interface BaseNodeProps {
    label: string;
    selected?: boolean;
    children?: ReactNode;
    headerColor?: string;
    borderColor?: string;
    actions?: ReactNode;
    nodeId: string;
    showEditButton?: boolean;
}

export function BaseNode({ label, selected, children, headerColor = 'bg-slate-700', borderColor = 'border-border', actions, nodeId, showEditButton = true }: BaseNodeProps) {
    const { hasBreakpoint, toggleBreakpoint } = useBreakpointContext();
    const setEditingNode = useFlowStore((state) => state.setEditingNode);
    const debugPausedNodeId = useFlowStore((state) => state.debugPausedNodeId);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const isBreakpointActive = hasBreakpoint(nodeId);
    const isPaused = debugPausedNodeId === nodeId;

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use viewport coordinates for fixed positioning
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
    };

    return (
        <>
            <div
                className={clsx(
                    "w-[200px] shadow-lg rounded-lg border-2 bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary relative",
                    borderColor,
                    selected && "border-primary ring-2 ring-primary/30 shadow-primary/10",
                    isBreakpointActive && "ring-2 ring-destructive/50",
                    isPaused && "ring-4 ring-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse"
                )}
                onContextMenu={handleContextMenu}
            >
                {/* Header */}
                <div className={clsx("px-3 py-1 font-bold text-foreground text-sm flex items-center justify-between relative", headerColor)}>
                    <span>{label}</span>
                    <div className="flex items-center gap-1">
                        {actions}
                        {isBreakpointActive && (
                            <div className="w-3 h-3 bg-destructive rounded-full border border-background shadow-sm" />
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-2 space-y-2 relative">
                    {/* Edit properties button */}
                    {showEditButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingNode(nodeId);
                            }}
                            className="w-full px-3 py-1.5 flex items-center justify-center gap-1.5 text-[var(--ring)] opacity-60 hover:opacity-100 text-xs font-medium transition-opacity"
                            title="Edit node properties"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Properties</span>
                        </button>
                    )}

                    {/* Main Ports */}
                    <div className="flex justify-between relative">
                        {/* General Flow In/Out handles (Exec) */}
                        <div className="absolute left-[-10px] top-0 flex flex-col gap-2">
                            <Handle type="target" position={Position.Left} id="exec-in" style={{ width: 16, height: 6, background: '#fff', borderRadius: 2 }} />
                        </div>
                        <div className="absolute right-[-10px] top-0 flex flex-col gap-2">
                            <Handle type="source" position={Position.Right} id="exec-out" style={{ width: 16, height: 6, background: '#fff', borderRadius: 2 }} />
                        </div>
                    </div>

                    {children}

                </div>
            </div>

            {/* Context menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onToggleBreakpoint={() => toggleBreakpoint(nodeId)}
                    hasBreakpoint={isBreakpointActive}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    );
}
