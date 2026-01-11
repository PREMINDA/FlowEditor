import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFlowStore } from '../../../store/useFlowStore';
import type { FlowNodeData } from '../../../types/process';

interface NodeIOModalProps {
    nodeId: string;
    data: FlowNodeData;
    type: 'inputs' | 'outputs';
    onClose: () => void;
}

interface PortRow {
    id: string; // Internal ID for React keys
    name: string;
    variableId: string;
    type: string;
}

export function NodeIOModal({ nodeId, data, type, onClose }: NodeIOModalProps) {
    const variables = useFlowStore((state: any) => state.variables);
    const updateNode = useFlowStore((state: any) => state.updateNode);

    // Local state: Array of rows to allow name editing without re-keying immediately
    const [rows, setRows] = useState<PortRow[]>([]);

    useEffect(() => {
        // Initialize from data
        const initialPorts = data[type] || {};
        const newRows = Object.entries(initialPorts).map(([name, config]) => ({
            id: crypto.randomUUID(),
            name,
            variableId: config.variableId || '',
            type: config.type || 'string'
        }));
        setRows(newRows);
    }, [data, type]);

    const handleSave = () => {
        // Validation: Check empty names
        if (rows.some(r => !r.name.trim())) {
            alert("Port names cannot be empty.");
            return;
        }

        // Convert array back to Record
        // If duplicates exist, later ones overwrite earlier ones (or we could validate)
        const newPorts: Record<string, { variableId: string; type: string }> = {};

        for (const row of rows) {
            const cleanName = row.name.trim();
            // Simple duplicate check could go here
            newPorts[cleanName] = {
                variableId: row.variableId,
                type: row.type
            };
        }

        updateNode(nodeId, { [type]: newPorts });
        onClose();
    };

    const handleDelete = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleAdd = () => {
        const newRow: PortRow = {
            id: crypto.randomUUID(),
            name: `Port ${rows.length + 1}`,
            variableId: '',
            type: 'string'
        };
        setRows([...rows, newRow]);
    };

    const handleChange = (id: string, field: keyof PortRow, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-popover border border-border rounded-lg shadow-xl w-[90vw] max-w-6xl p-4 flex flex-col gap-4 relative">
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <h2 className="font-bold text-foreground capitalize">Edit {type}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[70vh]">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                                <th className="p-2 w-[30%]">Name</th>
                                <th className="p-2 w-[30%]">Variable</th>
                                <th className="p-2 w-[25%]">Type</th>
                                <th className="p-2 w-[15%] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs text-foreground focus:border-primary outline-none"
                                            value={row.name}
                                            onChange={(e) => handleChange(row.id, 'name', e.target.value)}
                                            placeholder="Port Name"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs focus:border-primary outline-none"
                                            value={row.variableId}
                                            onChange={(e) => handleChange(row.id, 'variableId', e.target.value)}
                                        >
                                            <option value="">-- None --</option>
                                            {variables.map((v: any) => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="bg-background border border-border rounded px-2 py-1 w-full text-xs focus:border-primary outline-none"
                                            value={row.type}
                                            onChange={(e) => handleChange(row.id, 'type', e.target.value)}
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="vector3">Vector3</option>
                                            <option value="object">Object</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors"
                                            title="Delete Port"
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No ports defined. Click "Add Port" to create one.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between pt-2 border-t border-border">
                    <button onClick={handleAdd} className="px-3 py-1 bg-secondary hover:bg-muted rounded text-sm text-primary">+ Add Port</button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1 text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded text-sm">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
