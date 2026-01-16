
import { useFlowStore } from '../../../store/useFlowStore';
import type { ActionNode, CallProcessNode, AppNode } from '../../../types/process';

interface NodePropertiesProps {
    node: AppNode;
}

export function ActionNodeProperties({ node }: NodePropertiesProps) {
    const updateNodeRoot = useFlowStore((state) => state.updateNodeRoot);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Java Class Name</label>
            <div className="relative">
                <input
                    type="text"
                    value={(node as ActionNode).javaClassName || (node.data as any).javaClassName || ''}
                    onChange={(e) => updateNodeRoot(node.id, { javaClassName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:text-muted-foreground/50"
                    placeholder="com.example.MyAction"
                />
                <div className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                    .java
                </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
                Fully qualified class name for the backing implementation.
            </p>
        </div>
    );
}

export function CallProcessProperties({ node }: NodePropertiesProps) {
    const updateNodeRoot = useFlowStore((state) => state.updateNodeRoot);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Call To Process</label>
            <input
                type="text"
                value={(node as CallProcessNode).callToProcess || ''}
                onChange={(e) => updateNodeRoot(node.id, { callToProcess: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                placeholder="process_name"
            />
            <p className="text-[10px] text-muted-foreground">
                The ID or name of the process to call.
            </p>
        </div>
    );
}

export function CommonProperties({ node }: NodePropertiesProps) {
    const updateNode = useFlowStore((state) => state.updateNode);

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Label</label>
            <input
                type="text"
                value={node.data.label}
                onChange={(e) => updateNode(node.id, { label: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                placeholder="Node Label"
            />
        </div>
    );
}
