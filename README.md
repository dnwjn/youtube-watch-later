<p align="center"><img src="assets/icon.png" width="150" alt="Social card of YouTube Watch Later"></p>

<h1 align="center">YouTube Watch Later</h1>

> Have you ever browsed YouTube and used that "Add to Watch Later" button? Me too.
>
> Are you annoyed when you want to use that button, but it is not there? Me too!
>
> Would you love to always have such a button, so you can instantly add videos to your Watch Later playlist? ME TOO!

YouTube Watch Later is a small extension that adds an "Add to Watch Later" button to videos on various pages and in the notification drawer. Simply install the extension, configure it to your likings inside the popup, and go add those videos to your Watch Later playlist!

## Installation

You can download the extension from the following stores:

|                                                                                        Chromium                                                                                        |                                                                                           Edge                                                                                            |                                                                          Firefox                                                                           |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------:|
| <a href="https://chromewebstore.google.com/detail/youtube-watch-later/nmpfhocciajonacicdelpbhipglapgaa"><img src="assets/chrome-web-store.png" width="244" alt="Chrome Web Store"></a> | <a href="https://microsoftedge.microsoft.com/addons/detail/youtube-watch-later/hbceknmmffnemncljbkccfgcgnccbale"><img src="assets/edge-addons.png" width="244" alt="Microsoft Store"></a> | <a href="https://addons.mozilla.org/en-US/firefox/addon/youtube-watch-later/"><img src="assets/firefox-add-ons.svg" width="200" alt="Mozilla Add-ons"></a> |

Or, if you prefer to install the extension manually, you can download the latest release from [GitHub][GitHub latest].

## Locations

The button is available in the following locations:

| Location                   | Description                                                                             |
|----------------------------|-----------------------------------------------------------------------------------------|
| Video thumbnails           | Video thumbnails on the homepage, search results, channel pages, and other video lists. |
| Notification drawer        | Video notifications in the notification drawer.                                         |
| Video player controls      | Inside the video player controls, next to the like/dislike buttons.                     |
| Suggested video thumbnails | Suggested video thumbnails at the end of a video.                                       |

## Settings

### General

The following general settings can be configured:

| Setting                    | Description                                                                                      | Default  | Notes                                                   |
|----------------------------|--------------------------------------------------------------------------------------------------|----------|---------------------------------------------------------|
| Mark notifications as read | Allow notifications to be marked as read when you add those videos to your Watch Later playlist. | disabled | Only affects the button inside the notification drawer. |
| Logging                    | Allow the extension to send logs to your console. Could be useful for debugging purposes.        | disabled |                                                         |

### Button

The following button settings can be configured:

| Setting    | Description                                                         | Default    | Notes                                                        |
|------------|---------------------------------------------------------------------|------------|--------------------------------------------------------------|
| Visibility | Set the visibility of the button to either `always` or `hover`.     | `always`   | Does not affect the button inside the video player controls. |
| Opacity    | Set the opacity of the button to either `full` or `half`.           | `full`     | Does not affect the button inside the video player controls. |
| Position   | Set the position of the button to either `top left` or `top right`. | `top left` | Does not affect the button inside the video player controls. |

> Please note that a page reload is required for these settings to take effect.

## Changelog

Please see the [changelog] for more information about what has changed recently.

## License

The scripts and documentation in this project are released under the [GPL-3.0 license][license].

[Chrome]: https://chrome.google.com/webstore/detail/youtube-watch-later
[Edge]: https://microsoftedge.microsoft.com/addons/detail/youtube-watch-later
[Firefox]: https://addons.mozilla.org/en-US/firefox/addon/youtube-watch-later
[GitHub latest]: https://github.com/dnwjn/youtube-watch-later/releases/latest
[changelog]: CHANGELOG.md
[license]: LICENSE.md
