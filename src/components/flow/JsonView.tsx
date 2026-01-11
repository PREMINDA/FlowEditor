import { useFlowStore } from '../../store/useFlowStore';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface JsonViewProps {
    onClose: () => void;
    // Optional flag to disable portal usage (for 3D flip card)
    embed?: boolean;
}

export function JsonViewModal({ onClose, embed = false }: JsonViewProps) {
    const nodes = useFlowStore(state => state.nodes);
    const edges = useFlowStore(state => state.edges);
    const variables = useFlowStore(state => state.variables);
    const serialize = useFlowStore(state => state.serialize);

    const [jsonString, setJsonString] = useState<string>('Loading...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const data = serialize();
            const str = JSON.stringify(data, null, 2);
            setJsonString(str);
            setError(null);
        } catch (err: any) {
            console.error("JSON Serialization Failed:", err);
            setError(`Failed to generate JSON: ${err.message}`);
        }
    }, [nodes, edges, variables, serialize]);

    const content = (
        <div className="bg-card w-full h-full rounded-lg shadow-2xl flex flex-col border border-border overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/30">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    Process Data (JSON)
                </h2>
                <button
                    onClick={onClose}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-auto p-0 bg-[#0f0f0f]">
                {error ? (
                    <div className="p-6 text-destructive-foreground">
                        <h3 className="font-bold mb-2 text-lg">Error Displaying JSON</h3>
                        <p>{error}</p>
                    </div>
                ) : (
                    <pre className="text-xs font-mono text-gray-300 p-4 leading-relaxed whitespace-pre-wrap break-all">
                        {jsonString}
                    </pre>
                )}
            </div>

            <div className="p-3 border-t border-border bg-muted/30 flex justify-end gap-2">
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(jsonString);
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded hover:opacity-90 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Copy to Clipboard
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90"
                >
                    Close
                </button>
            </div>
        </div>
    );

    if (embed) {
        return content;
    }

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[90vw] h-[90vh]">
                {content}
            </div>
        </div>,
        document.body
    );
}
