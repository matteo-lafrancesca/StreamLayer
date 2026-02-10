import { type ReactNode } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type Modifier,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { usePlayer } from '@context/PlayerContext';

const restrictToVerticalAxis: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: 0,
    };
};

interface DragDropWrapperProps {
    children: ReactNode;
}

/**
 * Wraps children with DndContext for queue drag & drop.
 * Must be inside PlayerProvider but outside Player component (to avoid transform issues).
 */
export function DragDropWrapper({ children }: DragDropWrapperProps) {
    const { queue, reorderQueue } = usePlayer();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = queue.findIndex((item) => item.id.toString() === active.id);
            const newIndex = queue.findIndex((item) => item.id.toString() === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderQueue(oldIndex, newIndex);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            {children}
        </DndContext>
    );
}
