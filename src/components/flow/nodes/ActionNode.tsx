import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import type { FlowNodeData } from '../../../types/process';
import { BaseNode } from './BaseNode';
import { NodeIO } from './NodeIO';
import { getNodeStyle } from '../../../config/nodeStyles';

export const ActionNode = memo(({ id, data, selected }: NodeProps<FlowNodeData>) => {
    const style = getNodeStyle('actionNode');

    return (
        <BaseNode
            nodeId={id}
            label={data.label || style.label}
            selected={selected}
            headerColor={style.colors.bgSolid}
            borderColor={style.colors.borderLight}
        >
            <NodeIO nodeId={id} data={data} type="inputs" />
            <div className="my-2 border-t border-border" />
            <NodeIO nodeId={id} data={data} type="outputs" />
        </BaseNode>
    );
});
