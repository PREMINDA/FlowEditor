import { useState } from 'react';
import { clsx } from 'clsx';
import { PaletteView } from './sidebar/PaletteView';
import { VariablesView } from './sidebar/VariablesView';
import { ProcessView } from './sidebar/ProcessView';

export function Sidebar() {
    const [activeTab, setActiveTab] = useState<'palette' | 'variables' | 'process'>('palette');

    return (
        <aside className="w-[250px] bg-card border-r border-border flex flex-col overflow-hidden transition-all">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30 p-1.5 gap-1.5 shrink-0">
                <button
                    onClick={() => setActiveTab('palette')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'palette'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Palette
                </button>
                <button
                    onClick={() => setActiveTab('variables')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'variables'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    Variables
                </button>
                <button
                    onClick={() => setActiveTab('process')}
                    className={clsx(
                        "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5",
                        activeTab === 'process'
                            ? "bg-background shadow-sm text-primary ring-1 ring-border/50"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Process
                </button>
            </div>

            {/* Sliding Container */}
            <div className="flex-1 relative overflow-hidden bg-card/50">
                {/* Palette View */}
                <div className={clsx(
                    "absolute inset-0 p-4 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'palette' ? "translate-x-0" : "-translate-x-full"
                )}>
                    <PaletteView />
                </div>

                {/* Process View */}
                <div className={clsx(
                    "absolute inset-0 p-4 pt-1 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'process' ? "translate-x-0" : "translate-x-full"
                )}>
                    <ProcessView />
                </div>

                {/* Variables View */}
                <div className={clsx(
                    "absolute inset-0 p-4 pt-1 overflow-y-auto transition-transform duration-300 ease-in-out",
                    activeTab === 'variables' ? "translate-x-0" : "translate-x-full"
                )}>
                    <VariablesView />
                </div>
            </div>
        </aside >
    );
}
