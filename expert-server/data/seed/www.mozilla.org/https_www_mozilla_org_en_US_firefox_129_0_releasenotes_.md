# https://www.mozilla.org/en-US/firefox/129.0/releasenotes/

Version 129.0, first offered to Release channel users on August 6, 2024

*   [Reader View](https://support.mozilla.org/kb/firefox-reader-view-clutter-free-web-pages) now has an enhanced Text and Layout menu with new options for character spacing, word spacing, and text alignment. These changes offer a more accessible reading experience.
    
    ![screenshot of reader view's text menu demonstrating the new spacing and layout options](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/129_reader_view_text.png)
    
*   [Reader View](https://support.mozilla.org/kb/firefox-reader-view-clutter-free-web-pages) now has a Theme menu with additional Contrast and Gray options. You can also select custom colors for text, background, and links from the Custom tab.
    
    ![screenshot of reader view's theme menu demonstrating the new theme options](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/129_reader_view_theme.png)
    
*   A tab preview is now displayed when hovering the mouse over background tabs, making it easier to locate the desired tab without needing to switch tabs.
    
    ![screenshot of a preview image displayed under a background tab when you mouse over the tab](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/129_tab_preview.png)
    
    ![](https://www.firefox.com/media/img/firefox/releasenotes/progressive.c155af30a9cf.svg)
    
    This feature is part of a progressive roll out.
    
    What is a progressive roll out?
    
    Certain new Firefox features are released gradually. This means some users will see the feature before everyone does. This approach helps to get early feedback to catch bugs and improve behavior quickly, meaning more Firefox users overall have a better experience.
    
*   HTTPS is replacing HTTP as the default protocol in the address bar on non-local sites. If a site is not available via HTTPS, Firefox will fall back to HTTP.
    
*   HTTPS DNS records can now be resolved with the operating system's DNS resolver on specific platforms (Windows 11, Linux, Android 10+). Previously this required [DNS over HTTPS](https://support.mozilla.org/kb/firefox-dns-over-https) to be enabled. This capability allows the use of HTTP/3 without needing to use the [Alt-Svc](https://developer.mozilla.org/docs/Web/HTTP/Headers/Alt-Svc) header, upgrades requests to HTTPS when the DNS record is present, and enables wider use of [ECH](https://support.mozilla.org/kb/faq-encrypted-client-hello).
    
*   Added support for multiple languages in the same document spoken in macOS VoiceOver.
    
*   [Address Autofill](https://support.mozilla.org/kb/automatically-fill-your-address-web-forms) is now enabled for users in France and Germany.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 129 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-129-release-notes).
    

*   Added support for more inactive CSS warnings, including cases where:
    
    *   The `resize` property is used incorrectly.
    *   `float` properties are used incorrectly.
    *   `box-sizing` is used on elements that ignore width/height.
    *   table-related CSS properties are not on table-related elements.
    
*   The Network Blocking feature in the Network panel now blocks HTTP requests in addition to blocking responses.
    
*   The Rules side panel in the Inspector panel now displays `@starting-style` rules. Additionally, there is a tooltip for the var() function, indicating the `@starting-style` CSS custom properties value.
    
*   The Rules side panel now shows the impact of invalid at computed-value time custom property declarations in the computed panel.
    

*   Added support for [Float16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array) typed arrays along with new [DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) methods for reading and setting Float16 values, and a `Math.f16round()` static method that can be used to round numbers to 16 bits. The new type is useful for sharing data with a GPU, in particular for use cases where it makes sense to trade off precision for memory consumption.
    
*   Added support for [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style). This `at-rule` allows to define styles that are applied to an element when it is first rendered, enabling transitions on elements that are added to the DOM or that have their display type changed from none to another value.
    
*   Added support for the [transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior) CSS property. This property allows us to create a transition on discrete animated CSS properties.
    
*   Added support for the `textInput` event. This is a non-standardized API, however it is implemented by some web apps that use legacy libraries or frameworks. Please keep using `beforeinput` when developing new web apps.
    
*   Added support for DNS lookup of [HTTPS Resource Records (RR)](https://datatracker.ietf.org/doc/rfc9460/) with the native DNS resolver, increasing HTTPS coverage and facilitating the use of [Encrypted Client Hello (ECH)](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/) if present in HTTPS RR.
    

*   Under certain conditions, copyrighted video served via digital rights management may experience playback issues ([bug 1911283](https://bugzilla.mozilla.org/show_bug.cgi?id=1911283)).  
    A patch is underway. For an immediate workaround, please complete the following steps:
    
    *   Go to _about:config_ in the Awesomebar.
    *   Search for `media.eme.mfcdm.origin-filter.enabled`.
    *   Flip the pref from `1` to `0`.2.  Select the check mark button. (Fixed in 129.0.1)
    

*   With the release of Firefox 129, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 9 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   Anand Roy \[:aroy\]: [1894414](https://bugzilla.mozilla.org/1894414), [1902674](https://bugzilla.mozilla.org/1902674)
    *   Gaël: [1905081](https://bugzilla.mozilla.org/1905081)
    *   Henry Wilkes (they/them) \[:henry-x\]: [1904802](https://bugzilla.mozilla.org/1904802)
    *   Isaac Lee: [1904113](https://bugzilla.mozilla.org/1904113)
    *   Jaime Torres: [1893229](https://bugzilla.mozilla.org/1893229)
    *   Louis Mascari: [1904110](https://bugzilla.mozilla.org/1904110)
    *   Masataka Yakura \[:myakura\]: [1902633](https://bugzilla.mozilla.org/1902633)
    *   Tim Williams: [1904108](https://bugzilla.mozilla.org/1904108)
    *   Timur Valeev: [1881694](https://bugzilla.mozilla.org/1881694)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)