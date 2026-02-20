import { memo } from 'react';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '@components/Player/AuthenticatedImage';
import { getTrackDisplayInfo } from '@utils/track';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '@styles/QueueTrackRow.module.css';

interface QueueTrackRowProps {
    track: Track;
    onClick: () => void;
    isPlaying?: boolean;
    isPlayingState?: boolean;
    id?: string; // ID for dnd-kit
    isOverlay?: boolean;
}

function QueueTrackRowComponent({ track, onClick, isPlaying = false, id, isOverlay = false }: QueueTrackRowProps) {
    const displayInfo = getTrackDisplayInfo(track, 's');

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
        opacity: 1, // Keep full opacity even when dragging
        touchAction: 'pan-y',
    };

    // Override style if it's an overlay (pure visual) - don't spread style to avoid inherited opacity
    const finalStyle = isOverlay ? {
        cursor: 'grabbing',
        opacity: 1,
        touchAction: 'none',
    } : style;

    return (
        <div
            ref={setNodeRef}
            style={finalStyle}
            className={`${styles.row} ${isPlaying ? styles.rowPlaying : ''} ${!isOverlay && isDragging ? styles.isDragging : ''} ${isOverlay ? styles.overlay : ''}`}
        >
            {/* Drag Handle - Only show if not playing current track (which isn't sortable usually, or is separate) */}
            {!isPlaying && (
                <div
                    className={styles.dragHandle}
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()} // Prevent click from triggering row click
                    data-no-swipe="true"
                >
                    <GripVertical size={16} />
                </div>
            )}

            {/* Play/Pause Control - Needs stopPropagation to not trigger row click if handled separately, 
                but here row click handles play, so maybe we want that. 
                Original didn't have specific click handler on icon, just row.
            */}


            <AuthenticatedImage
                type="album"
                id={track.id_album}
                size="s"
                alt={displayInfo.title}
                className={styles.cover}
            />

            <div className={styles.trackInfo} onClick={onClick}>
                <div className={styles.title}>{displayInfo.title}</div>
                <div className={styles.artist}>{displayInfo.artist}</div>
            </div>
        </div>
    );
}

export const QueueTrackRow = memo(QueueTrackRowComponent);
