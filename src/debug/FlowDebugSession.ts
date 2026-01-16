import {
    LoggingDebugSession,
    InitializedEvent,
    StoppedEvent,
    Thread,
    StackFrame
} from '@vscode/debugadapter';

export class FlowDebugSession extends LoggingDebugSession {
    private static THREAD_ID = 1;
    private sendToJava: (msg: any) => void;

    constructor(sendToJava: (msg: any) => void) {
        super("flow-debug.txt");
        this.sendToJava = sendToJava;
        // these are arbitrary but common
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }

    /**
     * The 'initialize' request is the first request called by the frontend
     * to interrogate the features the debug adapter provides.
     * to interrogate the features the debug adapter provides.
     */
    protected initializeRequest(response: any, _args: any): void {
        response.body = response.body || {};

        // This debug adapter supports configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true;

        // We don't really support hitting breakpoints in files yet, but we say we do 
        // effectively by supporting the 'stopped' event.

        this.sendResponse(response);

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initialized' event to the frontend.
        this.sendEvent(new InitializedEvent());
    }

    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been configured.
     * Indicates that all breakpoints etc. have been configured.
     */
    protected configurationDoneRequest(response: any, _args: any): void {
        this.sendResponse(response);
    }

    protected launchRequest(response: any, _args: any): void {
        // App is already running (Java connects to us).
        // If we needed to launch it, we would do it here.
        // For now, we just proceed.
        this.sendResponse(response);
    }

    protected threadsRequest(response: any): void {
        // return the default thread
        response.body = {
            threads: [
                new Thread(FlowDebugSession.THREAD_ID, "Flow Thread")
            ]
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(response: any, _args: any): void {
        const stk = new StackFrame(
            0,
            "Active Flow Node",
            undefined
        );
        response.body = {
            stackFrames: [stk],
            totalFrames: 1
        };
        this.sendResponse(response);
    }

    // --- Control Flow ---

    protected continueRequest(response: any, _args: any): void {
        this.sendToJava({ action: 'resume' });
        this.sendResponse(response);
    }

    protected nextRequest(response: any, _args: any): void {
        this.sendToJava({ action: 'step' });
        this.sendResponse(response);
    }

    // --- Events ---

    public handleJavaMessage(message: any) {
        if (message.action === 'highLightBreakpoint') {
            // Java hit a breakpoint/step
            this.sendEvent(new StoppedEvent('breakpoint', FlowDebugSession.THREAD_ID));
        }
    }
}
