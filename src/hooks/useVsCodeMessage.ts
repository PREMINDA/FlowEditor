
import { useEffect, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { MessageType } from '../config/messages';
import { getVsCodeApi } from '../utils/vscode';
import { DEFAULT_PROCESS_NAME, DEFAULT_FLOW_DATA } from '../config/defaults';

export function useVsCodeMessage() {
    const [isLoading, setIsLoading] = useState(false);
    const loadProcess = useFlowStore((state) => state.loadProcess);
    const [vscode] = useState(getVsCodeApi);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === MessageType.UPDATE) {
                setIsLoading(true);

                const fileName = message.fileName;
                if (fileName) {
                    useFlowStore.getState().setProcessName(fileName);
                }

                setTimeout(() => {
                    try {
                        console.log("App: Processing update message", {
                            fileName,
                            fullFileName: message.fullFileName,
                            relativePath: message.relativePath
                        });

                        let json: any = DEFAULT_FLOW_DATA;
                        if (message.payload && message.payload.trim() !== "") {
                            try {
                                json = JSON.parse(message.payload);
                            } catch (e) {
                                console.error("Failed to parse non-empty payload", e);
                                json = DEFAULT_FLOW_DATA;
                            }
                        }

                        // Metadata Override Logic
                        if (fileName) {
                            json.name = fileName;
                        } else if (message.relativePath) {
                            const parts = message.relativePath.split('/');
                            const base = parts[parts.length - 1];
                            json.name = base.replace('.flowchartprocess.json', '');
                        }

                        if (message.relativePath) {
                            let cleanPath = message.relativePath;
                            if (cleanPath.startsWith('src/main/resources/')) {
                                cleanPath = cleanPath.substring('src/main/resources/'.length);
                            } else if (cleanPath.startsWith('src/test/resources/')) {
                                cleanPath = cleanPath.substring('src/test/resources/'.length);
                            }
                            json.filename = cleanPath;
                        } else if (message.fullFileName) {
                            json.filename = message.fullFileName;
                        }

                        if (!json.name || json.name === DEFAULT_PROCESS_NAME) {
                            if (message.fullFileName) {
                                json.name = message.fullFileName;
                            }
                        }

                        loadProcess(json);
                    } catch (err) {
                        console.error("Failed to parse document from VS Code", err);
                    } finally {
                        setIsLoading(false);
                    }
                }, 100);
            } else if (message.type === MessageType.EXECUTION_PAUSED) {
                // Handle Debugger Pause
                const nodeId = message.nodeId;
                console.log("App: Execution paused at", nodeId);
                useFlowStore.getState().setDebugPausedNode(nodeId);
            } else if (message.type === MessageType.LOAD_BREAKPOINTS) {
                // Pass to breakpoint system
                // (Handled by useBreakpoints hook, but we can log here)
            }
        };

        window.addEventListener('message', handleMessage);

        const unsubscribe = useFlowStore.subscribe(() => {
            if (vscode) {
                const json = useFlowStore.getState().serialize();
                vscode.postMessage({
                    type: MessageType.CHANGE,
                    payload: JSON.stringify(json, null, 2)
                });
            }
        });

        if (vscode) {
            setIsLoading(true);
            vscode.postMessage({ type: MessageType.READY });
        }

        return () => {
            window.removeEventListener('message', handleMessage);
            unsubscribe();
        };
    }, [loadProcess, vscode]);

    return { isLoading, vscode };
}
