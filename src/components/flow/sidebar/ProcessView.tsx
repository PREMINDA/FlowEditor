import { useFlowStore } from '../../../store/useFlowStore';

export function ProcessView() {
    return (
        <>
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
        </>
    );
}
