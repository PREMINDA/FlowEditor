import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFlowStore } from '../../store/useFlowStore';
import type { Variable, VariableCategory } from '../../types/process';

interface BlackboardModalProps {
    onClose: () => void;
    filterCategory?: VariableCategory;
    isGlobalSearch?: boolean;
}

interface VariableRow {
    id: string;
    variableId: string;
    name: string;
    type: string;
    defaultValue: string;
    category: VariableCategory;
}

export function BlackboardModal({ onClose, filterCategory, isGlobalSearch }: BlackboardModalProps) {
    const variables = useFlowStore((state: any) => state.variables);

    const [rows, setRows] = useState<VariableRow[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // If filtering, we still load all to preserve existing ones on save
        // But for display we might want to filter? 
        // Actually, on save we reconstruct the list. 
        // If we only show filtered rows, we might lose others on save if we replace whole list.
        // Solution: We must only edit the filtered ones, and keeping the others intact.

        const initialRows = variables.map((v: Variable) => ({
            id: v.id,
            variableId: v.id,
            name: v.name,
            type: v.type,
            defaultValue: v.defaultValue,
            category: v.category || 'local'
        }));
        setRows(initialRows);
    }, [variables]);

    const handleSave = () => {
        if (rows.some(r => !r.name.trim())) {
            alert("Variable names cannot be empty.");
            return;
        }

        const newVariables: Variable[] = rows.map(r => ({
            id: r.variableId || r.name.toLowerCase().replace(/\s/g, '_'),
            name: r.name,
            type: r.type as any,
            defaultValue: r.defaultValue,
            category: r.category
        }));

        useFlowStore.getState().setVariables(newVariables);
        onClose();
    };

    const handleDelete = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleAdd = (category: VariableCategory) => {
        const newRow: VariableRow = {
            id: crypto.randomUUID(),
            variableId: '',
            name: `NewVar${rows.length + 1}`,
            type: 'string',
            defaultValue: '',
            category
        };
        setRows([...rows, newRow]);
    };

    const handleChange = (id: string, field: keyof VariableRow, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const renderTable = (title: string, category: VariableCategory) => {
        if (filterCategory && filterCategory !== category) return null;

        const filteredRows = rows.filter(r =>
            r.category === category &&
            (searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // If global search and no results for this category, maybe skip? 
        // Or show empty table? User said "filder out variable". 
        // Let's keep table structure but empty if no matches.

        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
                    {!isGlobalSearch && (
                        <button
                            onClick={() => handleAdd(category)}
                            className="text-xs bg-secondary hover:bg-muted text-primary px-2 py-1 rounded"
                        >
                            + Add {title}
                        </button>
                    )}
                </div>
                <div className="border border-border rounded overflow-hidden">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-secondary/50">
                            <tr className="text-xs text-muted-foreground uppercase">
                                <th className="p-2 w-[30%]">Name</th>
                                <th className="p-2 w-[25%]">Type</th>
                                <th className="p-2 w-[30%]">Default Value</th>
                                <th className="p-2 w-[15%] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row) => (
                                <tr key={row.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs text-foreground focus:border-primary outline-none"
                                            value={row.name}
                                            onChange={(e) => handleChange(row.id, 'name', e.target.value)}
                                            placeholder="Name"
                                        // The prompt said: "should have ability to edit or delete no nned to add function"
                                        // So editing IS allowed.
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs focus:border-primary outline-none"
                                            value={row.type}
                                            onChange={(e) => handleChange(row.id, 'type', e.target.value)}
                                        // Let's allow editing as requested
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="vector3">Vector3</option>
                                            <option value="object">Object</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs text-foreground focus:border-primary outline-none"
                                            value={row.defaultValue}
                                            onChange={(e) => handleChange(row.id, 'defaultValue', e.target.value)}
                                            placeholder="Value"
                                        // Allowing edit
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="text-muted-foreground hover:text-destructive p-1"
                                            title="Delete"
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRows.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-muted-foreground italic text-xs">No matching {title.toLowerCase()} variables</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const getTitle = () => {
        if (isGlobalSearch) return "Search Variables";
        if (!filterCategory) return "Blackboard Variables";
        switch (filterCategory) {
            case 'input': return "Input Parameters";
            case 'output': return "Output Parameters";
            case 'local': return "Process Data";
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-popover border border-border rounded-lg shadow-xl w-[90vw] max-w-6xl p-6 flex flex-col gap-4 relative h-[85vh]">
                <div className="flex justify-between items-center border-b border-border pb-4">
                    <div className="flex items-center gap-4 flex-1">
                        <h2 className="font-bold text-xl text-foreground whitespace-nowrap">{getTitle()}</h2>
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search variables..."
                                className="w-full bg-background text-foreground text-sm px-3 py-1.5 rounded-full border border-border focus:border-primary outline-none pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <svg className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl ml-4">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {renderTable("Input Parameters", 'input')}
                    {renderTable("Output Parameters", 'output')}
                    {renderTable("Process Data", 'local')}
                </div>

                <div className="flex justify-end pt-4 border-t border-border gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded text-sm font-medium shadow-lg">Save Changes</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
