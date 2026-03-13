import { memo } from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Track } from '@definitions/track';
import { TrackItemInfo } from '../../Common/TrackItemInfo';
import styles from './QueueTrackRow.module.css';

interface QueueTrackRowProps {
    track: Track;
    onClick: () => void;
    isPlaying?: boolean;
    isPlayingState?: boolean;
    id?: string;
    isOverlay?: boolean;
}

function QueueTrackRowComponent({ track, onClick, isPlaying = false, id, isOverlay = false }: QueueTrackRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id || track.id.toString(),
        disabled: isOverlay
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: 1,
        touchAction: 'pan-y' as const,
    };

    const finalStyle = isOverlay ? {
        cursor: 'grabbing',
        opacity: 1,
        touchAction: 'none' as const,
    } : style;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
        }
    };

    return (
        <li
            ref={setNodeRef}
            style={finalStyle}
            className={`${styles.row} ${isPlaying ? styles.rowPlaying : ''} ${!isOverlay && isDragging ? styles.isDragging : ''} ${isOverlay ? styles.overlay : ''}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Lire ${track.title}`}
        >
            {!isPlaying && (
                <div
                    className={styles.dragHandle}
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    data-no-swipe="true"
                >
                    <GripVertical size={16} />
                </div>
            )}

            <TrackItemInfo 
                track={track} 
                className={styles.trackInfo} 
                onClick={onClick}
            />
        </li>
    );
}

export const QueueTrackRow = memo(QueueTrackRowComponent);
