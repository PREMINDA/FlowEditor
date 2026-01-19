
import * as vscode from 'vscode';
import { MessageType } from '../config/messages';

/**
 * Spies on the standard Java Debug Adapter checks for Flow Status updates.
 */
export class FlowDebugTracker implements vscode.DebugAdapterTracker {

    private session: vscode.DebugSession;
    private context: vscode.ExtensionContext;

    constructor(session: vscode.DebugSession, context: vscode.ExtensionContext) {
        this.session = session;
        this.context = context;
    }

    /**
     * Intercepts messages from the Debug Adapter (Java) -> VS Code
     */
    onDidSendMessage(message: any): void {
        if (message.type === 'event' && message.event === 'output') {
            const outputBody = message.body;
            const category = outputBody.category;
            const output = outputBody.output as string;

            // Check standard output for our protocol
            if (category === 'stdout' && output && output.includes("@@FLOW:PAUSED:")) {
                this.handleFlowPause(output);
            }
        }
    }

    private handleFlowPause(output: string) {
        const trimmed = output.trim();
        if (!trimmed.startsWith("@@FLOW:PAUSED:")) return;

        // Format: @@FLOW:PAUSED:node-1:{...}
        // Extract Node ID (simple split relative to our prefix)
        // @@FLOW:PAUSED: has length 14
        const parts = trimmed.substring(14).split(':');
        const nodeId = parts[0];

        if (nodeId) {
            // Broadcast to ALL known webviews (simple approach) or Active One
            // We can use a command to delegate this to the EditorProvider
            vscode.commands.executeCommand('flowEditor.onDebugPause', nodeId);
        }
    }
}
