import { clsx } from 'clsx';
import { getNodeStyle } from '../../../config/nodeStyles';

export function PaletteView() {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
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
    );
}
