import { memo } from 'react';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '../AuthenticatedImage';
import { getTrackDisplayInfo } from '@utils/player';
import styles from './TrackItemInfo.module.css';

interface TrackItemInfoProps {
    track: Track;
    className?: string;
    onClick?: () => void;
}

/**
 * Composant mutualisé pour afficher les informations de base d'une piste (Image + Titre + Artiste).
 * Utilisé dans les listes (Playlist, File d'attente).
 */
function TrackItemInfoComponent({ track, className, onClick }: TrackItemInfoProps) {
    const displayInfo = getTrackDisplayInfo(track, 's');

    return (
        <div className={`${styles.trackContent} ${className || ''}`} onClick={onClick}>
            <AuthenticatedImage
                type="album"
                id={track.id_album}
                size="s"
                alt={displayInfo.title}
                className={styles.cover}
            />
            <div className={styles.trackInfo}>
                <div className={styles.title}>{displayInfo.title}</div>
                <div className={styles.artist}>{displayInfo.artist}</div>
            </div>
        </div>
    );
}

export const TrackItemInfo = memo(TrackItemInfoComponent);
