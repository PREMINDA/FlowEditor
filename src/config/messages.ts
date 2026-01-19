
export const MessageType = {
    UPDATE: 'update',
    CHANGE: 'change',
    READY: 'ready',
    OPEN_FILE: 'openFile',
    SET_BREAKPOINT: 'setBreakpoint',
    REMOVE_BREAKPOINT: 'removeBreakpoint',
    LOAD_BREAKPOINTS: 'loadBreakpoints',
    EXECUTION_PAUSED: 'executionPaused'
} as const;

export const FileType = {
    JAVA: 'java',
    PROCESS: 'process'
} as const;
