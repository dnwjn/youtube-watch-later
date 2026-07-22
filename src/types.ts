export class ButtonOpacity {
  static Full = 'opacity-full'
  static Half = 'opacity-half'
}

export class ButtonPosition {
  static TopLeft = 'top-left'
  static TopRight = 'top-right'
  static BottomLeft = 'bottom-left'
  static BottomRight = 'bottom-right'
}

export class ButtonVisibility {
  static Always = 'visibility-always'
  static Hover = 'visibility-hover'
}

export class ButtonPositionContext {
  static Thumbnail = 'buttonPositionThumbnail'
  static Playlist = 'buttonPositionPlaylist'
  static EndscreenModern = 'buttonPositionEndscreenModern'
  static Sidebar = 'buttonPositionSidebar'
  static Notification = 'buttonPositionNotification'
  static Endscreen = 'buttonPositionEndscreen'
}

export const buttonPositionAllowed: Record<string, string[]> = {
  [ButtonPositionContext.Thumbnail]: [
    ButtonPosition.TopLeft,
    ButtonPosition.TopRight,
    ButtonPosition.BottomLeft,
    ButtonPosition.BottomRight,
  ],
  [ButtonPositionContext.Playlist]: [
    ButtonPosition.TopLeft,
    ButtonPosition.TopRight,
    ButtonPosition.BottomLeft,
    ButtonPosition.BottomRight,
  ],
  [ButtonPositionContext.EndscreenModern]: [
    ButtonPosition.TopLeft,
    ButtonPosition.TopRight,
    ButtonPosition.BottomLeft,
    ButtonPosition.BottomRight,
  ],
  [ButtonPositionContext.Sidebar]: [
    ButtonPosition.TopLeft,
    ButtonPosition.BottomLeft,
  ],
  [ButtonPositionContext.Notification]: [
    ButtonPosition.TopRight,
    ButtonPosition.BottomRight,
  ],
  [ButtonPositionContext.Endscreen]: [
    ButtonPosition.TopLeft,
    ButtonPosition.BottomLeft,
  ],
}

export const buttonPositionDefault: Record<string, string> = {
  [ButtonPositionContext.Thumbnail]: ButtonPosition.TopLeft,
  [ButtonPositionContext.Playlist]: ButtonPosition.TopLeft,
  [ButtonPositionContext.EndscreenModern]: ButtonPosition.TopLeft,
  [ButtonPositionContext.Sidebar]: ButtonPosition.TopLeft,
  [ButtonPositionContext.Notification]: ButtonPosition.TopRight,
  [ButtonPositionContext.Endscreen]: ButtonPosition.TopLeft,
}
