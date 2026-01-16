import { useEffect, useState } from 'react';
import { MessageType } from '../config/messages';
import { getVsCodeApi } from '../utils/vscode';

/**
 * Hook to manage breakpoint state and communication with VS Code extension
 */
export function useBreakpoints() {
    const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());
    const vscode = getVsCodeApi();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === MessageType.LOAD_BREAKPOINTS) {
                // Load breakpoints from extension
                setBreakpoints(new Set(message.breakpoints || []));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const toggleBreakpoint = (nodeId: string) => {
        setBreakpoints(prev => {
            const newBreakpoints = new Set(prev);
            const hasBreakpoint = newBreakpoints.has(nodeId);

            if (hasBreakpoint) {
                newBreakpoints.delete(nodeId);
                vscode?.postMessage({
                    type: MessageType.REMOVE_BREAKPOINT,
                    nodeId
                });
            } else {
                newBreakpoints.add(nodeId);
                vscode?.postMessage({
                    type: MessageType.SET_BREAKPOINT,
                    nodeId
                });
            }

            return newBreakpoints;
        });
    };

    const hasBreakpoint = (nodeId: string): boolean => {
        return breakpoints.has(nodeId);
    };

    return {
        breakpoints,
        toggleBreakpoint,
        hasBreakpoint
    };
}
