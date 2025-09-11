# https://www.mozilla.org/en-US/firefox/125.0/releasenotes/

Version 125.0.1, first offered to Release channel users on April 16, 2024

_NOTE: Due to a high-severity quality issue discovered shortly before release, the 125.0 release was skipped in favor of 125.0.1._

*   Firefox now supports the AV1 codec for Encrypted Media Extensions (EME), enabling higher-quality playback from video streaming providers.
    
*   The Firefox PDF viewer now supports text highlighting.
    
    ![Screenshot showing new PDF text highlighting feature](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/RN-image-highlight.png)
    
    ![](https://www.firefox.com/media/img/firefox/releasenotes/progressive.c155af30a9cf.svg)
    
    This feature is part of a progressive roll out.
    
    What is a progressive roll out?
    
    Certain new Firefox features are released gradually. This means some users will see the feature before everyone does. This approach helps to get early feedback to catch bugs and improve behavior quickly, meaning more Firefox users overall have a better experience.
    
*   Firefox View now displays pinned tabs in the Open tabs section. Tab indicators have also been added to Open tabs, so users can do things like see which tabs are playing media and quickly mute or unmute across windows. Indicators were also added for bookmarks, tabs with notifications, and more!
    
    ![Screenshot showing a pinned tab in a different window with the media playback indicator visible in Firefox View](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/125_fxview_pinned_tabs.png)
    
*   Firefox now prompts users in the US and Canada to save their addresses upon submitting an address form, allowing Firefox to autofill stored address information in the future.
    
*   Firefox now more proactively blocks downloads from URLs that are considered to be potentially untrustworthy.
    
*   The URL Paste Suggestion feature provides a convenient way for users to quickly visit URLs copied to the clipboard in the address bar of Firefox. When the clipboard contains a URL and the URL bar is focused, an autocomplete result appears automatically. Activating the clipboard suggestion will navigate the user to the URL with 1 click.
    
    ![Screenshot showing the Visit from clipboard button for the URL paste suggestion feature](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/125_url_paste_suggestion.png)
    
*   Users of tab-specific Container add-ons can now search in the Address Bar for tabs that are open in different containers. Special thanks to volunteer contributor atararx for kicking off the work on this feature!
    
*   Firefox now provides an option to enable Web Proxy Auto-Discovery (WPAD) while configured to use system proxy settings.
    

*   In a group of radio buttons where no option is selected, the tab key now only reaches the first option rather than cycling through all available options. The arrow keys navigate between options as they do when there is a selected option. This makes keyboard navigation more efficient and consistent.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 125 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-125-release-notes).
    

*   Following several requests, we have reintroduced the option to disable the Pause Debugger Overlay (`devtools.debugger.features.overlay`). This overlay appears over the page content when the debugger pauses JavaScript execution. In certain scenarios, the overlay can be intrusive, making it challenging to interact with the page, for instance, evaluating shades of color underneath.
    
*   We've added a new drop-down menu button at the bottom of the source view in the Debugger panel, specifically designed for Source Map related actions. Users can now easily disable or enable Source Maps support, open the Source Map file in a new tab, switch between the original source and the generated bundle, toggle the "open original source by default" option, and view the Source Map status such as errors, loading status, etc.
    
    ![Screenshot showing new Source Map options drop-down menu](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/125_devtools_sourcemaps_menu.png)
    

*   Firefox now supports the [`popover`](https://html.spec.whatwg.org/#the-popover-attribute) global attribute used for designating an element as a popover element. The element won't be rendered until it is made visible, after which it will appear on top of other page content.
    
*   WebAssembly multi-memory is now enabled by default. Wasm multi-memory allows wasm modules to use and import multiple independent linear memories. This enables more efficient interoperability between modules and provides better polyfills for upcoming wasm standards, such as the component model.
    
*   Added support for Unicode Text Segmentation to JavaScript.
    
*   Added support for [`contextlost`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) and [`contextrestored`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) events on HTMLCanvasElement and OffscreenCanvas to allow user code to recover from context loss with hardware accelerated 2d canvas.
    
*   Firefox now supports the [`navigator.clipboard.readText()`](https://developer.mozilla.org/docs/Web/API/Clipboard_API) web API. A paste context menu will appear for the user to confirm when attempting to read clipboard data not provided by the same-origin page.
    
*   Added support for the [`content-box`](https://developer.mozilla.org/docs/Web/CSS/transform-box#content-box) and [`stroke-box`](https://developer.mozilla.org/docs/Web/CSS/transform-box#stroke-box) keywords of the [`transform-box`](https://developer.mozilla.org/docs/Web/CSS/transform-box) CSS property.
    
*   The [`align-content`](https://developer.mozilla.org/docs/Web/CSS/CSS_box_alignment/Box_alignment_in_block_abspos_tables) property now works in block layout, allowing block direction alignment without needing a flex or grid container.
    
*   Support for `SVGAElement.text` was removed in favor of the more widely-implemented `SVGAElement.textContent` method.
    

*   The recently-shipped functionality more proactively blocking downloads from untrusted sources is not working as intended and causing impaired ability to download files in legitimate situations. We are working to address this ASAP via disabling the feature remotely for existing installs and will also revert the change for the upcoming Firefox 125.0.2 release.
    
*   When attempting to launch Firefox while it is already running, an extra blank tab with an address of `https://0.0.0.1` may sometimes appear. The cause of this has been identified and will be resolved in the Firefox 125.0.3 release.
    
*   Some users have reported seeing long hangs when clicking on the address bar due to the new Clipboard Suggestion feature. Disabling this functionality by unchecking the "Clipboard" box in `about:preferences#search` should resolve the hangs for impacted users. The underlying performance issue will be addressed in a future Firefox release.
    
    ![Screenshot showing the Clipboard option unselected in the Firefox Suggest preferences](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/125_clipboard_suggest_disable.png)
    

*   With the release of Firefox 125, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 12 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   Artem Manushenkov: [1619201](https://bugzilla.mozilla.org/1619201)
    *   Bojidar Marinov \[:bojidar-bg\]: [1839845](https://bugzilla.mozilla.org/1839845)
    *   daxpedda: [1873642](https://bugzilla.mozilla.org/1873642)
    *   Dmitri: [1881682](https://bugzilla.mozilla.org/1881682)
    *   Hovav Shacham: [1880366](https://bugzilla.mozilla.org/1880366)
    *   jsharp@fastly.com: [1861533](https://bugzilla.mozilla.org/1861533)
    *   marten.richter: [1872496](https://bugzilla.mozilla.org/1872496), [1873263](https://bugzilla.mozilla.org/1873263)
    *   Nikki Bernobic \[:echrs\]: [1862253](https://bugzilla.mozilla.org/1862253), [1878635](https://bugzilla.mozilla.org/1878635)
    *   Patrycja Rosa \[:ptrcnull\] (she/her): [1881979](https://bugzilla.mozilla.org/1881979)
    *   rushliu: [1883600](https://bugzilla.mozilla.org/1883600)
    *   uhhadd: [1883184](https://bugzilla.mozilla.org/1883184)
    *   zhanghe9702: [1881896](https://bugzilla.mozilla.org/1881896)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)