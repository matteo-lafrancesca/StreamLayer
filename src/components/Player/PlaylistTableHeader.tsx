import styles from '@styles/PlaylistTableHeader.module.css';

export function PlaylistTableHeader() {
    return (
        <div className={styles.header}>
            <div className={styles.indexColumn}>#</div>
            <div className={styles.titleColumn}>Titre</div>
            <div className={styles.albumColumn}>Album</div>
            <div className={styles.durationColumn}>
                {/* Clock Icon */}
                <svg
                    className={styles.clockIcon}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <circle cx="8" cy="8" r="6.5" />
                    <path d="M8 4v4l2.5 2.5" />
                </svg>
            </div>
        </div>
    );
}
