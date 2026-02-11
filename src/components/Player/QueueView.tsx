import { useMemo } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { QueueTrackRow } from './QueueTrackRow';
import styles from '@styles/PlayerViews.module.css';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { compensateForTransforms, restrictToVerticalAxis } from '@utils/dndModifiers';

export function QueueView() {
    const { queue, playTrackFromPlaylist, playingTrack, isPlaying, setIsPlaying, playingFromPlaylist, reorderQueue } = usePlayer();
    const { selectedPlaylist, setIsDragging } = usePlayerUI();
    // Sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Start dragging after moving 8px to prevent accidental drags on clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Separate current track from upcoming tracks
    const { currentTrack, upcomingTracks } = useMemo(() => {
        if (!queue || queue.length === 0 || !playingTrack) {
            return { currentTrack: null, upcomingTracks: [], startIndex: 0 };
        }

        const currentIndex = queue.findIndex(track => track.id === playingTrack.id);
        if (currentIndex === -1) {
            // Should not happen theoretically if playingTrack is in queue
            return { currentTrack: null, upcomingTracks: queue, startIndex: 0 };
        }

        return {
            currentTrack: queue[currentIndex],
            upcomingTracks: queue.slice(currentIndex + 1),
            startIndex: currentIndex + 1
        };
    }, [queue, playingTrack]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Find indexes in likely the whole queue or just the upcoming part?
            // We need to map back to the MAIN queue indexes.

            // "active.id" is the track ID as string (see QueueTrackRow)
            // But we need the index in the FULL queue.

            const oldIndex = queue.findIndex((item) => item.id.toString() === active.id);
            const newIndex = queue.findIndex((item) => item.id.toString() === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderQueue(oldIndex, newIndex);
            }
        }
    };

    if (!queue || queue.length === 0) {
        return (
            <div className={styles.statusMessage}>
                La liste d'attente est vide
            </div>
        );
    }

    return (
        <div className={styles.scrollContainer}>

            {/* Now Playing */}
            {currentTrack && (
                <div className={styles.queueSection}>
                    <h3 className={styles.sectionTitle}>Titre en cours de lecture</h3>
                    <QueueTrackRow
                        track={currentTrack}
                        onClick={() => {
                            // Toggle play/pause
                            setIsPlaying(!isPlaying);
                        }}
                        isPlaying={true}
                        isPlayingState={isPlaying}
                    />
                </div>
            )}

            {upcomingTracks.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(e) => {
                        setIsDragging(false);
                        handleDragEnd(e);
                    }}
                    onDragCancel={() => setIsDragging(false)}
                    modifiers={[restrictToVerticalAxis, compensateForTransforms]}
                    autoScroll={{
                        threshold: {
                            x: 0,
                            y: 0.2
                        },
                        acceleration: 25
                    }}
                >
                    <div className={styles.queueSection}>
                        <h3 className={styles.sectionTitle}>
                            À suivre dans : {(playingFromPlaylist || selectedPlaylist)?.metadata?.title || 'Playlist'}
                        </h3>
                        <SortableContext
                            items={upcomingTracks.map(t => t.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {upcomingTracks.map((track) => {
                                const realIndex = queue.findIndex(t => t === track);
                                return (
                                    <QueueTrackRow
                                        key={track.id}
                                        id={track.id.toString()}
                                        track={track}
                                        onClick={() => playTrackFromPlaylist(realIndex, queue)}
                                        isPlaying={false}
                                        isPlayingState={false}
                                    />
                                );
                            })}
                        </SortableContext>
                    </div>


                </DndContext>
            )}
        </div>
    );
}
