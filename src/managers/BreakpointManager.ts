import * as vscode from 'vscode';

/**
 * Manages breakpoint state for flowchart nodes across multiple documents.
 * Breakpoints are stored per-document and persist across file switches
 * but are NOT saved to the JSON files themselves.
 */
export class BreakpointManager {
    private breakpoints: Map<string, Set<string>>;
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.breakpoints = new Map();
        this.loadFromWorkspaceState();
    }

    /**
     * Add a breakpoint to a node in the specified document
     */
    setBreakpoint(documentUri: string, nodeId: string): void {
        if (!this.breakpoints.has(documentUri)) {
            this.breakpoints.set(documentUri, new Set());
        }
        this.breakpoints.get(documentUri)!.add(nodeId);
        this.saveToWorkspaceState();
    }

    /**
     * Remove a breakpoint from a node in the specified document
     */
    removeBreakpoint(documentUri: string, nodeId: string): void {
        const nodeBreakpoints = this.breakpoints.get(documentUri);
        if (nodeBreakpoints) {
            nodeBreakpoints.delete(nodeId);
            if (nodeBreakpoints.size === 0) {
                this.breakpoints.delete(documentUri);
            }
            this.saveToWorkspaceState();
        }
    }

    /**
     * Toggle a breakpoint for a node (add if absent, remove if present)
     */
    toggleBreakpoint(documentUri: string, nodeId: string): boolean {
        const hasBreakpoint = this.hasBreakpoint(documentUri, nodeId);
        if (hasBreakpoint) {
            this.removeBreakpoint(documentUri, nodeId);
        } else {
            this.setBreakpoint(documentUri, nodeId);
        }
        return !hasBreakpoint;
    }

    /**
     * Check if a node has a breakpoint
     */
    hasBreakpoint(documentUri: string, nodeId: string): boolean {
        return this.breakpoints.get(documentUri)?.has(nodeId) ?? false;
    }

    /**
     * Get all breakpoints for a specific document
     */
    getBreakpoints(documentUri: string): string[] {
        return Array.from(this.breakpoints.get(documentUri) ?? []);
    }

    /**
     * Get ALL unique node IDs across ALL documents (for Java sync)
     */
    getAllNodeIds(): string[] {
        const allIds = new Set<string>();
        for (const ids of this.breakpoints.values()) {
            ids.forEach(id => allIds.add(id));
        }
        return Array.from(allIds);
    }

    /**
     * Clear all breakpoints for a specific document
     */
    clearBreakpoints(documentUri: string): void {
        this.breakpoints.delete(documentUri);
        this.saveToWorkspaceState();
    }

    /**
     * Clear all breakpoints across all documents
     */
    clearAllBreakpoints(): void {
        this.breakpoints.clear();
        this.saveToWorkspaceState();
    }

    /**
     * Load breakpoints from workspace state (persists across sessions)
     */
    private loadFromWorkspaceState(): void {
        const savedBreakpoints = this.context.workspaceState.get<[string, string[]][]>('flowEditor.breakpoints', []);
        this.breakpoints = new Map(
            savedBreakpoints.map(([uri, nodeIds]) => [uri, new Set(nodeIds)])
        );
    }

    /**
     * Save breakpoints to workspace state
     */
    private saveToWorkspaceState(): void {
        const serializedBreakpoints: [string, string[]][] = Array.from(this.breakpoints.entries()).map(
            ([uri, nodeIds]) => [uri, Array.from(nodeIds)]
        );
        this.context.workspaceState.update('flowEditor.breakpoints', serializedBreakpoints);
    }
}
