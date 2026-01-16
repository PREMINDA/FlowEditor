import clsx from 'clsx';
import { Handle, Position } from 'reactflow';
import type { ReactNode, MouseEvent } from 'react';
import { useState } from 'react';
import { useBreakpointContext } from '../../../context/BreakpointContext';

// Context menu component
interface ContextMenuProps {
    x: number;
    y: number;
    onToggleBreakpoint: () => void;
    hasBreakpoint: boolean;
    onClose: () => void;
}

function ContextMenu({ x, y, onToggleBreakpoint, hasBreakpoint, onClose }: ContextMenuProps) {
    return (
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
        </>
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
}

export function BaseNode({ label, selected, children, headerColor = 'bg-slate-700', borderColor = 'border-border', actions, nodeId }: BaseNodeProps) {
    const { hasBreakpoint, toggleBreakpoint } = useBreakpointContext();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const isBreakpointActive = hasBreakpoint(nodeId);

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            <div
                className={clsx(
                    "w-[200px] shadow-lg rounded-lg border-2 bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary relative",
                    borderColor,
                    selected && "border-primary ring-2 ring-primary/30 shadow-primary/10",
                    isBreakpointActive && "ring-2 ring-destructive/50"
                )}
                onContextMenu={handleContextMenu}
            >
                {/* Breakpoint indicator */}
                {isBreakpointActive && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 bg-destructive rounded-full border-2 border-background shadow-lg" />
                )}

                {/* Header */}
                <div className={clsx("px-3 py-1 font-bold text-foreground text-sm flex items-center justify-between", headerColor)}>
                    <span>{label}</span>
                    {actions && <div className="flex gap-1">{actions}</div>}
                </div>

                {/* Body */}
                <div className="p-2 space-y-2 relative">
                    {/* Main Ports */}
                    <div className="flex justify-between relative min-h-[20px]">
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
