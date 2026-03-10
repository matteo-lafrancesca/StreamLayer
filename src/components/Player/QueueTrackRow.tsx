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
    id?: string;
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
        opacity: 1,
        touchAction: 'pan-y',
    };

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
