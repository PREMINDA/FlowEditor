import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border border-border shadow-xl">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-medium text-foreground">Loading Flowchart...</p>
            </div>
        </div>
    );
}
