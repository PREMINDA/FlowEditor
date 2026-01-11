import { useState, useEffect, useMemo, useRef } from 'react';
import { useFlowStore } from '../../store/useFlowStore';
import { useReactFlow } from 'reactflow';
import clsx from 'clsx';

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const nodes = useFlowStore((state) => state.nodes);
    const selectNode = useFlowStore((state) => state.selectNode);
    const { setCenter } = useReactFlow();

    // Toggle with Cmd+Shift+O / Ctrl+Shift+O / Cmd+F / Ctrl+F
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCmdOrCtrl = e.metaKey || e.ctrlKey;

            // Cmd+Shift+O OR Cmd+F for search
            if (isCmdOrCtrl && (
                (e.shiftKey && e.key.toLowerCase() === 'o') ||
                e.key.toLowerCase() === 'f'
            )) {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((prev) => !prev);
                setSearch('');
                setSelectedIndex(0);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Filter nodes
    const filteredNodes = useMemo(() => {
        if (!search) return nodes.slice(0, 10); // Show first 10 by default
        const lowerSearch = search.toLowerCase();
        return nodes
            .filter((node) => {
                const label = node.data?.label || '';
                const id = node.id;
                return label.toLowerCase().includes(lowerSearch) || id.toLowerCase().includes(lowerSearch);
            })
            .slice(0, 50); // Limit results
    }, [nodes, search]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleNav = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredNodes.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredNodes.length) % filteredNodes.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredNodes[selectedIndex]) {
                    handleSelect(filteredNodes[selectedIndex]);
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredNodes, selectedIndex]);

    const handleSelect = (node: any) => {
        setIsOpen(false);
        selectNode(node.id);

        // Pan to node
        // We know the node position, but simpler is to use `fitView` if we want to see everything,
        // OR `setCenter` to zoom in.
        // Let's assume standard nodes are around 150-200px wide.
        const x = node.position.x + 100; // rough center
        const y = node.position.y + 50;  // rough center

        setCenter(x, y, { zoom: 1.5, duration: 800 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-xl bg-popover border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-border">
                    <svg className="w-5 h-5 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-lg"
                        placeholder="Search flow nodes..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
                    />
                    <div className="text-xs text-muted-foreground font-mono border border-border px-2 py-1 rounded">ESC</div>
                </div>

                <div className="overflow-y-auto p-2">
                    {filteredNodes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No nodes found</div>
                    ) : (
                        filteredNodes.map((node, index) => (
                            <div
                                key={node.id}
                                className={clsx(
                                    "flex items-center px-4 py-3 rounded cursor-pointer transition-colors",
                                    index === selectedIndex ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                                onClick={() => handleSelect(node)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className={clsx(
                                    "w-2 h-8 rounded mr-3",
                                    node.type === 'startNode' ? "bg-red-500" : "bg-primary"
                                )} />
                                <div className="flex-1">
                                    <div className="font-medium">{node.data?.label || node.id}</div>
                                    <div className={clsx("text-xs opacity-60", index === selectedIndex ? "text-accent-foreground/50" : "text-muted-foreground")}>
                                        {node.type} • ID: {node.id}
                                    </div>
                                </div>
                                {index === selectedIndex && (
                                    <span className="text-xs opacity-70">Running execution...</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
