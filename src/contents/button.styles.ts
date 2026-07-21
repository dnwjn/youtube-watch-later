export const buttonStyles = `
#plasmo-shadow-container {
    z-index: 10 !important;
}

#plasmo-shadow-container,
#plasmo-shadow-container .plasmo-csui-container {
    position: unset !important;
}

#plasmo-shadow-container:has(.watch-later-btn.in-notification.spaced) {
    margin-top: 60px;
}

.watch-later-btn {
    position: absolute;
    background-color: transparent;
    color: #f1f1f1;
    padding: 5px;
    border: none;
    z-index: 10;
    cursor: pointer;
    font-size: 12px;
    border-radius: 18px;
    outline: none;
}

.watch-later-btn.in-thumbnail,
.watch-later-btn.in-playlist,
.watch-later-btn.in-thumbnail.top-left,
.watch-later-btn.in-playlist.top-left,
.watch-later-btn.in-mod-endscreen-suggested {
    left: 5px;
    top: 4px;
    right: unset;
    bottom: unset;
}

.watch-later-btn.in-thumbnail.top-right,
.watch-later-btn.in-playlist.top-right {
    left: unset;
    top: 4px;
    right: 5px;
    bottom: unset;
}

.watch-later-btn.in-thumbnail.bottom-left,
.watch-later-btn.in-playlist.bottom-left {
    left: 5px;
    top: unset;
    right: unset;
    bottom: 4px;
}

.watch-later-btn.in-thumbnail.bottom-right,
.watch-later-btn.in-playlist.bottom-right {
    left: unset;
    top: unset;
    right: 5px;
    bottom: 4px;
}

.watch-later-btn.in-endscreen-suggested {
    left: 5px;
    right: unset;
}

.watch-later-btn.in-endscreen-suggested.top-left,
.watch-later-btn.in-endscreen-suggested.top-right {
    top: 4px;
    bottom: unset;
}

.watch-later-btn.in-endscreen-suggested.bottom-left,
.watch-later-btn.in-endscreen-suggested.bottom-right {
    top: unset;
    bottom: 4px;
}

.watch-later-btn.in-mod-endscreen-suggested.top-right {
    left: unset;
    top: 4px;
    right: 5px;
    bottom: unset;
}

.watch-later-btn.in-mod-endscreen-suggested.bottom-left {
    left: 5px;
    top: unset;
    right: unset;
    bottom: 4px;
}

.watch-later-btn.in-mod-endscreen-suggested.bottom-right {
    left: unset;
    top: unset;
    right: 5px;
    bottom: 4px;
}

.watch-later-btn.in-thumbnail,
.watch-later-btn.in-playlist,
.watch-later-btn.in-playlist.opacity-full,
.watch-later-btn.in-endscreen-suggested,
.watch-later-btn.in-endscreen-suggested.opacity-full,
.watch-later-btn.in-mod-endscreen-suggested,
.watch-later-btn.in-mod-endscreen-suggested.opacity-full {
    opacity: 1;
}

.watch-later-btn.in-thumbnail.opacity-half,
.watch-later-btn.in-playlist.opacity-half,
.watch-later-btn.in-endscreen-suggested.opacity-half,
.watch-later-btn.in-mod-endscreen-suggested.opacity-half {
    opacity: .5;
}

.watch-later-btn.dark.in-thumbnail,
.watch-later-btn.dark.in-playlist,
.watch-later-btn.dark.in-endscreen-suggested,
.watch-later-btn.dark.in-mod-endscreen-suggested,
.watch-later-btn.dark.in-player-suggested {
    background-color: #282828;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.watch-later-btn.dark.on-video-detail {
    background-color: var(--yt-spec-menu-background, rgba(255,255,255,0.1));
}

.watch-later-btn.light.in-thumbnail,
.watch-later-btn.light.in-playlist,
.watch-later-btn.light.in-endscreen-suggested,
.watch-later-btn.light.in-mod-endscreen-suggested,
.watch-later-btn.light.in-player-suggested,
.watch-later-btn.light.on-video-detail {
    background-color: rgba(0,0,0,0.05);
}

.watch-later-btn.in-playlist {
    left: unset;
    top: unset;
    right: unset;
    bottom: unset;
    margin-left: 40px;
    margin-top: -53px;
}

.watch-later-btn.in-notification {
    left: unset;
    right: 10px;
}

.watch-later-btn.in-notification.top-left,
.watch-later-btn.in-notification.top-right {
    top: 8px;
    bottom: unset;
}

.watch-later-btn.in-notification.bottom-left,
.watch-later-btn.in-notification.bottom-right {
    top: unset;
    bottom: 8px;
}

.watch-later-btn.in-player-suggested {
    left: 5px;
    right: unset;
}

.watch-later-btn.in-player-suggested.top-left,
.watch-later-btn.in-player-suggested.top-right {
    top: 4px;
    bottom: unset;
}

.watch-later-btn.in-player-suggested.bottom-left,
.watch-later-btn.in-player-suggested.bottom-right {
    top: unset;
    bottom: 4px;
}

.watch-later-btn.on-video-detail {
    position: relative;
    margin-left: 8px;
    margin-right: 8px;
    color: #f1f1f1;
    width: 36px;
    height: 36px;
}

.watch-later-btn.light.on-video-detail {
    color: #0f0f0f;
}

.watch-later-btn.in-player-suggested-mobile {
    z-index: 0;
    position: relative;
    margin-left: 6px;
    margin-right: 6px;
    color: #f1f1f1;
    width: 36px;
    height: 36px;
}

.watch-later-btn.light.in-notification,
.watch-later-btn.light.in-player-suggested {
    color: #030303;
}

.watch-later-btn.dark.in-notification:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.dark.in-player-suggested:not(.loading):not(.success):not(.error):hover {
    background-color: rgba(255,255,255,0.2);
}

.watch-later-btn.light.in-notification:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.light.in-player-suggested:not(.loading):not(.success):not(.error):hover {
    background-color: rgba(0,0,0,0.1);
}

.watch-later-btn.dark.on-video-detail:not(.loading):not(.success):not(.error):hover {
    background-color: var(--yt-spec-outline, rgba(255,255,255,0.2));
}

.watch-later-btn.light.on-video-detail:not(.loading):not(.success):not(.error):hover {
    background-color: rgba(0,0,0,0.1);
}

.watch-later-btn.dark.in-thumbnail:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.dark.in-playlist:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.dark.in-endscreen-suggested:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.dark.in-mod-endscreen-suggested:not(.loading):not(.success):not(.error):hover {
    background-color: #4c4c4c;
}

.watch-later-btn.light.in-thumbnail:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.light.in-playlist:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.light.in-endscreen-suggested:not(.loading):not(.success):not(.error):hover,
.watch-later-btn.light.in-mod-endscreen-suggested:not(.loading):not(.success):not(.error):hover {
    background-color: rgba(0,0,0,0.8);
}

.watch-later-btn.loading,
.watch-later-btn.success,
.watch-later-btn.error {
    cursor: not-allowed;
}

.watch-later-btn.loading {
    animation: blink 1s ease-in-out infinite;
}

.watch-later-btn.success {
    background-color: #4ade80 !important;
    color: #0f0f0f;
}

.watch-later-btn.error {
    background-color: #f87171 !important;
    color: #0f0f0f;
}

.watch-later-btn svg {
    pointer-events: none;
    display: inherit;
    width: 100%;
    height: 100%;
}

.watch-later-btn svg.with-fill {
    fill: currentColor;
}

@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.25;
    }
}
`
