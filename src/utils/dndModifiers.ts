import type { Modifier } from '@dnd-kit/core';

export const restrictToVerticalAxis: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: 0,
    };
};

export const compensateForTransforms: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: 0,
        y: transform.y,
    };
};

export const restrictToScrollContainer: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
    if (!draggingNodeRect || !containerNodeRect) {
        return transform;
    }

    const top = containerNodeRect.top - draggingNodeRect.top;
    const bottom = containerNodeRect.bottom - draggingNodeRect.bottom;

    const constrainedY = Math.min(Math.max(transform.y, top), bottom);

    return {
        ...transform,
        y: constrainedY,
    };
};
