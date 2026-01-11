
// Define VS Code API type
declare global {
    interface Window {
        acquireVsCodeApi?: () => {
            postMessage: (message: any) => void;
            getState: () => any;
            setState: (state: any) => void;
        };
    }
}

// Safe singleton for VS Code API
let vscodeApi: any = null;

export function getVsCodeApi() {
    if (vscodeApi) return vscodeApi;
    if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
        try {
            vscodeApi = window.acquireVsCodeApi();
        } catch (e) {
            console.error("Failed to acquire VS Code API:", e);
        }
    }
    return vscodeApi;
}
