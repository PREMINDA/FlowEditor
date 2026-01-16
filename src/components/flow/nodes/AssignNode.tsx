import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import type { FlowNodeData } from '../../../types/process';
import { BaseNode } from './BaseNode';
import { getNodeStyle } from '../../../config/nodeStyles';

export const AssignNode = memo(({ id, data, selected }: NodeProps<FlowNodeData>) => {
    const style = getNodeStyle('assignNode');

    return (
        <BaseNode
            nodeId={id}
            label={data?.label || style.label}
            selected={selected}
            headerColor={style.colors.bgSolid}
            borderColor={style.colors.borderLight}
        >
            {/* Todo: Implement Assign Logic UI */}
        </BaseNode>
    );
});
