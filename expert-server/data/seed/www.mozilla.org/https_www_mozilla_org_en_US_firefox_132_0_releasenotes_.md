# https://www.mozilla.org/en-US/firefox/132.0/releasenotes/

Version 132.0, first offered to Release channel users on October 29, 2024

*   [Microsoft PlayReady](https://www.microsoft.com/playready/) [encrypted media playback](https://www.mux.com/video-glossary/eme-encrypted-media-extensions) is now being rolled out to select sites on Windows. Through this support, we are gradually rolling out a 1080p baseline and 4K Ultra HD support with key streaming partners. An added benefit is that viewers get less battery drain and better performance when streaming their favorite movies and shows.
    
    ![](https://www.firefox.com/media/img/firefox/releasenotes/progressive.c155af30a9cf.svg)
    
    This feature is part of a progressive roll out.
    
    What is a progressive roll out?
    
    Certain new Firefox features are released gradually. This means some users will see the feature before everyone does. This approach helps to get early feedback to catch bugs and improve behavior quickly, meaning more Firefox users overall have a better experience.
    
*   Wide Color Gamut WebGL is now available for Windows and macOS users! With this support, Firefox is bringing a richer, more vivid range of colors to the videos, games, and images on your screen. This implementation currently supports wider color (P3) profiles in 8-bit.
    
*   WebRender hardware accelerated rendering is now enabled for most SVG filter primitives, improving performance for certain graphics-heavy content. Accelerated filters are feBlend, feColorMatrix, feComponentTransfer, feComposite, feDropShadow, feFlood, feGaussianBlur, feMerge and feOffset.
    
*   Added support for macOS’ new screen and window sharing selection features on macOS 15 and later. Support for macOS 14 will be added in a future release.
    
*   The macOS session resume feature has been enhanced. Firefox will now automatically relaunch if it was open before a system restart, like after an OS update.
    
*   Firefox now blocks third-party cookie access when Enhanced Tracking Protection's Strict mode is enabled.
    

*   As a follow-up to our work to upgrade mixed content starting with Firefox 127, HTTP-favicons will now also be blocked if they can not be received over HTTPS instead.
    
*   The [Copy Without Site Tracking](https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop#w_copy-without-site-tracking) option is now grayed out when no known tracking parameters are found within the link. Additionally, more tracking parameter support has been added for websites such as LinkedIn and Shopee. Please report tracking parameters that aren't removed by [filing a bug](https://bugzilla.mozilla.org/enter_bug.cgi?product=Core&component=Privacy%3A%20Anti-Tracking&bug_type=enhancement&blocked=1920601&short_desc=Strip%20%22PARAMETER%22%20on%20WEBSITE%20with%20%22Copy%20Without%20Site%20Tracking%22&comment=Parameter%20to%20strip%3A%20%0ASites%20to%20strip%20this%20parameter%20from%20\(*%20for%20all\)%3A%20%0AExample%20link%20to%20site%20adding%20such%20a%20link%3A%20%0AAdditional%20information%20about%20this%20parameter%3A%20%0A%0A) in Bugzilla.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 132 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-132-release-notes).
    

*   Support for HTTP/2 Push has been removed due to compatibility issues with various sites. This feature is not currently supported by any other major browser.
    
*   Console logging in service workers is now functional again. The `console.log` API can be used within active service workers and the output inspected in the Console panel of the Developer Tools toolbox.
    
*   Support for debugging remote devices via USB has also been restored. Simply go to `about:debugging`, plug in your phone using a USB cable, and refresh the device list. The phone will now appear correctly in the list.
    

*   Added support for a post-quantum key exchange mechanism for TLS 1.3 (mlkem768x25519) which secures communications against advanced / long-term threats.
    
*   Added support for Certificate Compression which reduces the size and increases the speed of a TLS handshake.
    
*   Text directionality computation has been updated to follow the latest model defined in the HTML specification, improving interoperability with other web browsers.
    
*   The `requestVideoFrameCallback()` method is now available on the `HTMLVideoElement` interface. This method enables developers to perform efficient operations on each video frame.
    
*   The `getCapabilities` method allows applications to gather the media capabilities supported for the live MediaStreamTrack.
    
*   The `fetchpriority` attribute enables web developers to optimize resource loading by specifying the relative priority of resources to be fetched by the browser. It accepts three values: `auto` (default priority), `low` (lower priority), `high` (higher priority). It can be specified on `script`, `link`, `img` elements, on the `RequestInit` parameter of the `fetch()` method and `Link` response headers. The HTML specification leaves the detailed interpretation of this attribute up to implementers. Firefox will typically use it to increase or decrease the urgency parameter of HTTP/2 and HTTP/3 requests.
    
*   The heuristic granting storage access for some window openings is now disabled.
    

*   With the release of Firefox 132, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 7 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   Biswapriyo Nath \[:biswa96\]: [1920567](https://bugzilla.mozilla.org/1920567)
    *   delthas: [1815783](https://bugzilla.mozilla.org/1815783)
    *   Jess Lark: [1910488](https://bugzilla.mozilla.org/1910488)
    *   Martin Carolan: [1905364](https://bugzilla.mozilla.org/1905364)
    *   Patrick Ribas \[:pribas\]: [1913978](https://bugzilla.mozilla.org/1913978)
    *   Sam James: [1917964](https://bugzilla.mozilla.org/1917964)
    *   sandy.chu.40: [1909885](https://bugzilla.mozilla.org/1909885), [1915451](https://bugzilla.mozilla.org/1915451)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)