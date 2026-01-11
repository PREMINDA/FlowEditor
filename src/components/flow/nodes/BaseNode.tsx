import clsx from 'clsx';
import { Handle, Position } from 'reactflow';
import type { ReactNode } from 'react';

// Common handle styles
interface BaseNodeProps {
    label: string;
    selected?: boolean;
    children?: ReactNode;
    headerColor?: string;
    borderColor?: string;
    actions?: ReactNode;
}

export function BaseNode({ label, selected, children, headerColor = 'bg-slate-700', borderColor = 'border-border', actions }: BaseNodeProps) {
    return (
        <div className={clsx(
            "w-[200px] shadow-lg rounded-lg border-2 bg-card overflow-hidden transition-all hover:shadow-xl hover:border-primary",
            borderColor,
            selected && "border-primary ring-2 ring-primary/30 shadow-primary/10"
        )}>
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
    );
}
