import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import clsx from 'clsx';
import type { FlowNodeData } from '../../../types/process';
import { getNodeStyle } from '../../../config/nodeStyles';

export const StartNode = memo(({ selected }: NodeProps<FlowNodeData>) => {
    const style = getNodeStyle('startNode');

    return (
        <div className={clsx(
            "w-[100px] h-[40px] rounded-full border-2 flex items-center justify-center shadow-lg transition-all",
            style.colors.bgSolid,
            style.colors.borderLight, // Using borderLight (600/40) or we could strictly use style.colors.border (600)
            selected && "ring-2 ring-white"
        )}>
            <span className="font-bold text-white text-sm">START</span>
            <Handle
                type="source"
                position={Position.Right}
                id="exec-out"
                style={{ width: 12, height: 12, background: 'white', borderRadius: 2 }}
            />
        </div>
    );
});
