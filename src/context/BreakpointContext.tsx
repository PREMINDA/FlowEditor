import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useBreakpoints } from '../hooks/useBreakpoints';

interface BreakpointContextType {
    breakpoints: Set<string>;
    toggleBreakpoint: (nodeId: string) => void;
    hasBreakpoint: (nodeId: string) => boolean;
}

const BreakpointContext = createContext<BreakpointContextType | null>(null);

export function BreakpointProvider({ children }: { children: ReactNode }) {
    const breakpointState = useBreakpoints();

    return (
        <BreakpointContext.Provider value={breakpointState}>
            {children}
        </BreakpointContext.Provider>
    );
}

export function useBreakpointContext() {
    const context = useContext(BreakpointContext);
    if (!context) {
        throw new Error('useBreakpointContext must be used within BreakpointProvider');
    }
    return context;
}
