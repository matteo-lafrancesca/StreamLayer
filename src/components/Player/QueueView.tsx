import { useMemo } from 'react';
import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
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
import { compensateForTransforms, restrictToVerticalAxis, restrictToScrollContainer } from '@utils/dndModifiers';

export function QueueView() {
    const { queue, playingTrack, isPlaying, playingFromPlaylist } = usePlayerState();
    const { playTrackFromPlaylist, setIsPlaying, reorderQueue } = usePlayerActions();
    const { selectedPlaylist, setIsDragging } = usePlayerUI();

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

    const { currentTrack, upcomingTracks } = useMemo(() => {
        if (!queue || queue.length === 0 || !playingTrack) {
            return { currentTrack: null, upcomingTracks: [], startIndex: 0 };
        }

        const currentIndex = queue.findIndex(track => track.id === playingTrack.id);
        if (currentIndex === -1) {
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
            {currentTrack && (
                <div className={styles.queueSection}>
                    <h3 className={styles.sectionTitle}>Titre en cours de lecture</h3>
                    <QueueTrackRow
                        track={currentTrack}
                        onClick={() => {
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
                    modifiers={[restrictToVerticalAxis, compensateForTransforms, restrictToScrollContainer]}
                    autoScroll={{
                        threshold: {
                            x: 0,
                            y: 0.15
                        },
                        acceleration: 10,
                        interval: 5
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
