export interface NodeStyleConfig {
    label: string;
    colors: {
        base: string; // "blue-600"
        bgLight: string; // "bg-blue-600/10"
        bgSolid: string; // "bg-blue-600"
        border: string; // "border-blue-600"
        borderLeft: string; // "border-l-blue-600"
        borderLight: string; // "border-blue-600/40"
        text: string; // "text-blue-600"
    };
    icon: string;
}

// Full TailWind classes must be present in source for the JIT compiler to pick them up.
// improved structure to ensure safelist
const styles: Record<string, NodeStyleConfig> = {
    startNode: {
        label: 'Start Node',
        icon: 'startNode',
        colors: {
            base: 'red-600',
            bgLight: 'bg-red-600/10',
            bgSolid: 'bg-red-600',
            border: 'border-red-600',
            borderLeft: 'border-l-red-600',
            borderLight: 'border-red-600/40',
            text: 'text-red-600',
        }
    },
    actionNode: {
        label: 'Action Node',
        icon: 'actionNode',
        colors: {
            base: 'blue-600',
            bgLight: 'bg-blue-600/10',
            bgSolid: 'bg-blue-600',
            border: 'border-blue-600',
            borderLeft: 'border-l-blue-600',
            borderLight: 'border-blue-600/40',
            text: 'text-blue-600',
        }
    },
    assignNode: {
        label: 'Assign Node',
        icon: 'assignNode',
        colors: {
            base: 'emerald-600',
            bgLight: 'bg-emerald-600/10',
            bgSolid: 'bg-emerald-600',
            border: 'border-emerald-600',
            borderLeft: 'border-l-emerald-600',
            borderLight: 'border-emerald-600/40',
            text: 'text-emerald-600',
        }
    },
    calltoProcessNode: {
        label: 'Call Process',
        icon: 'calltoProcessNode',
        colors: {
            base: 'purple-600', // Retained from original, not explicitly removed by snippet
            bgLight: 'bg-purple-600/10',
            bgSolid: 'bg-purple-600',
            border: 'border-purple-200',
            borderLeft: 'border-l-purple-600',
            borderLight: 'border-purple-600/40',
            text: 'text-purple-600',
        }
    },
    callProcessNode: {
        label: 'Call Process (Legacy)',
        icon: 'calltoProcessNode', // Use new icon key logic if it maps to SVG, or 'callProcessNode' if SVG map has it
        colors: {
            base: 'purple-600',
            bgLight: 'bg-purple-600/10',
            bgSolid: 'bg-purple-600',
            border: 'border-purple-200',
            borderLeft: 'border-l-purple-600',
            borderLight: 'border-purple-600/40',
            text: 'text-purple-600',
        }
    },
    noteNode: {
        label: 'Note',
        icon: 'noteNode',
        colors: {
            base: 'yellow-500',
            bgLight: 'bg-yellow-500/10',
            bgSolid: 'bg-yellow-500',
            border: 'border-yellow-500',
            borderLeft: 'border-l-yellow-500',
            borderLight: 'border-yellow-500/40',
            text: 'text-yellow-600', // Darker text for readability
        }
    },
};

const defaultStyle: NodeStyleConfig = {
    label: 'Unknown Node',
    icon: 'default',
    colors: {
        base: 'slate-500',
        bgLight: 'bg-slate-500/10',
        bgSolid: 'bg-slate-500',
        border: 'border-slate-500',
        borderLeft: 'border-l-slate-500',
        borderLight: 'border-slate-500/40',
        text: 'text-slate-500',
    }
};

export const getNodeStyle = (type: string): NodeStyleConfig => {
    return styles[type] || defaultStyle;
};

export const NODE_TYPES = Object.keys(styles);
