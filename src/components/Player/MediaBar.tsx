import { usePlayer } from '../../context/PlayerContext';
import { getTrackDisplayInfo } from '../../utils/track';
import { AuthenticatedImage } from '../AuthenticatedImage/AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { IconButton } from '../UI';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../../styles/Player.module.css';
import type { MediaBarProps } from '../../types/player';

export function MediaBar({ isExpanded, onExpandToggle }: MediaBarProps) {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        progress,
        setProgress,
        currentTime,
        duration,
        playbackControls
    } = usePlayer();

    const displayInfo = playingTrack
        ? getTrackDisplayInfo(playingTrack, 's')
        : { title: '', artist: '' };

    return (
        <div className={styles.mediaBarNew}>
            {/* Left Section: Cover + Track Info */}
            <div className={styles.mediaBarLeft}>
                {playingTrack ? (
                    <AuthenticatedImage
                        type="album"
                        id={playingTrack.id_album}
                        size="s"
                        alt={displayInfo.title}
                        className={styles.coverSmall}
                    />
                ) : (
                    <img
                        src="/img/placeholder.png"
                        alt="No track"
                        className={styles.coverSmall}
                    />
                )}
                <div className={styles.trackInfoLarge}>
                    <ScrollingText
                        text={displayInfo.title}
                        className={styles.trackTitleLarge}
                        speed={20}
                    />
                    <ScrollingText
                        text={displayInfo.artist}
                        className={styles.trackArtist}
                        speed={16}
                    />
                </div>
            </div>

            {/* Center Section: Progress Bar + Controls */}
            <div className={styles.mediaBarCenter}>
                <ProgressBar
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    onProgressChange={setProgress}
                />

                <PlaybackControls
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onShuffle={playbackControls.onShuffle}
                    onPrevious={playbackControls.onPrevious}
                    onNext={playbackControls.onNext}
                    onRepeat={playbackControls.onRepeat}
                />
            </div>

            {/* Right Section: Volume + Expand Button */}
            <div className={styles.mediaBarRight}>
                <VolumeControl
                    volume={volume}
                    onVolumeChange={setVolume}
                />
                <IconButton
                    icon={isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    onClick={onExpandToggle}
                    className={styles.expandButton}
                    title={isExpanded ? 'Réduire' : 'Agrandir'}
                    enlargeHitbox
                />
            </div>
        </div>
    );
}
