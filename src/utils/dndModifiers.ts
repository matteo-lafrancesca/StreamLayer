import type { Modifier } from '@dnd-kit/core';

export const restrictToVerticalAxis: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: 0,
    };
};

// Custom modifier to compensate for parent container transforms
// The playerContainer has transform: translateX(-50%) which creates a new containing block
// for position: fixed, causing DragOverlay coordinates to be offset
export const compensateForTransforms: Modifier = ({ transform }) => {
    // The offset appears to be related to the parent transforms
    // Since playerContainer uses translateX(-50%), we need to compensate
    return {
        ...transform,
        // Keep x at 0 (vertical lock)
        x: 0,
        // No Y adjustment needed - let dnd-kit handle it naturally
        y: transform.y,
    };
};

// Custom modifier to restrict dragging within the scroll container bounds
export const restrictToScrollContainer: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
    if (!draggingNodeRect || !containerNodeRect) {
        return transform;
    }

    // Calculate the boundaries
    const top = containerNodeRect.top - draggingNodeRect.top;
    const bottom = containerNodeRect.bottom - draggingNodeRect.bottom;

    // Constrain the Y transform to stay within bounds
    const constrainedY = Math.min(Math.max(transform.y, top), bottom);

    return {
        ...transform,
        y: constrainedY,
    };
};
