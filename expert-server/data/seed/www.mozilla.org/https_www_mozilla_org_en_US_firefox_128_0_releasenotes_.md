# https://www.mozilla.org/en-US/firefox/128.0/releasenotes/

Version 128.0, first offered to Release channel users on July 9, 2024

*   Firefox can now translate selections of text and hyperlinked text to other languages from the context menu.
    
    ![screenshot of the context menu when right clicking on selected text with a focus the translation option from the context menu, and then displaying the Translation feature after the translation option was clicked](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/128_translate_text.png)
    
*   For users in the US and Canada, Firefox will now show your recent searches or currently trending searches when you open the Address Bar to get you back to your previous search session or inspire your next one.
    
    ![screenshot of the open Address bar listing recent searches and trending searches](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/128_search_continuation.png)
    
*   Firefox now has a simpler and more unified dialog for clearing user data. In addition to streamlining data categories, the new dialog also provides insights into the site data size corresponding to the selected time range.
    
    ![screenshot of the Clear browsing data and cookies dialog. Demonstrating the new features of clearing data within a selected time range and the size of that data](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/128_clear_site_data.png)
    
*   Firefox now supports playback of protected content from streaming sites like Netflix while in Private Browsing mode.
    
*   Firefox now supports the experimental [Privacy Preserving Attribution API](https://support.mozilla.org/kb/privacy-preserving-attribution), which provides an alternative to user tracking for ad attribution. This experiment is only enabled via [origin trial](https://wiki.mozilla.org/Origin_Trials) and can be disabled in the new Website Advertising Preferences section in the Privacy and Security settings.
    
*   On macOS, microphone capture through getUserMedia will now use system-provided voice processing when applicable, improving audio quality.
    
*   Firefox is now available in the Saraiki (skr) language.
    

*   Firefox now proxies DNS by default when using SOCKS v5, avoiding leaking DNS queries to the network when using SOCKS v5 proxies.
    

*   Firefox now supports rendering more `text/*` file types inline, rather than requiring them to be downloaded to be viewed.
    
*   The root certificate used to verify add-ons and signed content has been renewed to avoid upcoming expiration.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 128 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-128-release-notes).
    

*   [CSS rules specificity](https://developer.mozilla.org/docs/Web/CSS/Specificity) is now displayed in a tooltip when hovering a CSS rule selector in the Inspector Rules view. This can help web developers understand why a given rule is applied before another.
    
    ![screenshot of the specificity tooltip when hovering a CSS Rule selector in the Inspector Rules view](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/128_devtools_css_specificity.png)
    
*   The Inspector panel now flags a custom property declaration as invalid when the value does not match the registered custom property definition. As shown in the screenshot below, the declaration of a custom property, `--b`, expecting a `<length>` value syntax (e.g., `10px`), is instead used with a color specified. An exclamation icon appears next to it with a tooltip explaining the error.
    
    ![screenshot of an example of the exclamation icon beside an invalid custom property declaration and a tooltip explaining the error](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/128_devtools_invalid_property.png)
    
*   Improvements have been made to Inactive CSS. A warning is now displayed when `column-span` is used on elements outside of multi-column containers and when properties only applying to replaced elements are used on non-replaced elements.
    

*   [Resizeable ArrayBuffers](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resize) and [Growable SharedArrayBuffers](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/grow) are now supported in SpiderMonkey. This allows the size of an ArrayBuffer to be changed without having to allocate a new buffer and copy data into it.
    
*   The [setCodecPreferences](https://www.w3.org/TR/webrtc/#dom-rtcrtptransceiver-setcodecpreferences) method allows applications to disable the negotiation of specific codecs (including RTX/RED/FEC). It also allows an application to cause a remote peer to prefer the codec that appears first in the list for sending.
    
*   The Accept header for images and documents was [changed](https://developer.mozilla.org/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values) to better align with the Fetch standard and other browsers.
    
*   Support was added for `@property` and the [CSS properties-and-values API](https://developer.mozilla.org/docs/Web/API/CSS_Properties_and_Values_API).
    
*   A new `bytes()` method is provided on many objects like Request/Response and Blob that provides a convenient way of [getting an Uint8Array typed array](https://github.com/w3ctag/design-principles/issues/463).
    
*   The [relative color syntax](https://developer.mozilla.org/docs/Web/CSS/CSS_colors/Relative_colors) is now supported in CSS color functions. This allows to create colors based on other colors.
    

*   With the release of Firefox 128, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 9 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   Henry Wilkes: [1851618](https://bugzilla.mozilla.org/1851618)
    *   jhnsmth1052: [1868451](https://bugzilla.mozilla.org/1868451)
    *   kravantokh: [28354](https://bugzilla.mozilla.org/28354)
    *   Malte Jürgens: [1896978](https://bugzilla.mozilla.org/1896978)
    *   Max Inden: [1895319](https://bugzilla.mozilla.org/1895319)
    *   Olivier Mehani: [1900584](https://bugzilla.mozilla.org/1900584)
    *   Sukhmeet: [1893013](https://bugzilla.mozilla.org/1893013), [1896878](https://bugzilla.mozilla.org/1896878)
    *   tannal2409: [1842458](https://bugzilla.mozilla.org/1842458), [1853548](https://bugzilla.mozilla.org/1853548), [1886716](https://bugzilla.mozilla.org/1886716), [1892347](https://bugzilla.mozilla.org/1892347), [1895391](https://bugzilla.mozilla.org/1895391), [1895530](https://bugzilla.mozilla.org/1895530)
    *   Ujas Thakkar: [1874917](https://bugzilla.mozilla.org/1874917)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)