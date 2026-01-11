import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';


interface NoteModalProps {
    isOpen: boolean;
    mode: 'view' | 'edit';
    content: string;
    onSave: (newContent: string) => void;
    onClose: () => void;
}

export function NoteModal({ isOpen, mode, content, onSave, onClose }: NoteModalProps) {
    const [value, setValue] = useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setValue(content);
    }, [content, isOpen]);

    useEffect(() => {
        if (isOpen && mode === 'edit' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(value);
        onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[1px]"
            onClick={(e) => { e.stopPropagation(); onClose(); }} // Close on backdrop click
        >
            <div
                className="bg-popover border border-border shadow-2xl rounded-lg w-[400px] max-w-[90vw] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="font-bold text-foreground text-sm">
                        {mode === 'edit' ? 'Edit Note' : 'View Note'}
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-4 flex-1">
                    {mode === 'edit' ? (
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full h-[200px] p-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            placeholder="Type your note here..."
                        />
                    ) : (
                        <div className="w-full h-[200px] p-2 bg-background/50 border border-border/50 rounded-md text-sm text-foreground overflow-y-auto whitespace-pre-wrap">
                            {content || <span className="text-muted-foreground italic">No content...</span>}
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 border-t border-border bg-muted/20 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    >
                        Close
                    </button>
                    {mode === 'edit' && (
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm transition-all"
                        >
                            Save Note
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
