# https://www.mozilla.org/en-US/firefox/126.0/releasenotes/

Version 126.0, first offered to Release channel users on May 14, 2024

*   The Copy Without Site Tracking option can now remove parameters from nested URLs. It also includes expanded support for blocking over 300 tracking parameters from copied links, including those from major shopping websites. Keep those trackers away when sharing links!
    
    ![screenshot of the context menu when right clicking a URL and demonstrating the Copy Without Site Tracking option](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/126_copy_without_site_tracking.png)
    
*   Firefox now supports Content-encoding: [zstd (zstandard compression)](http://facebook.github.io/zstd/). This is an alternative to broti and gzip compression for web content, and can provide higher compression levels for the same CPU used, or conversely lower server CPU use to get the same compression. This is heavily used on sites such as Facebook.
    
*   Catalan is now available in Firefox Translations.
    
*   Enabled AV1 hardware decode acceleration on macOS for M3 Macs.
    
*   Telemetry was added to create an aggregate count of searches by category to broadly inform search feature development. These categories are based on 20 high-level content types, such as "sports,” "business," and "travel". This data will not be associated with specific users and will be collected using OHTTP to remove IP addresses as potentially identifying metadata. No profiling will be performed, and no data will be shared with third parties. ([read more](https://blog.mozilla.org/products/firefox/firefox-search-update/))
    
*   NVIDIA RTX Video Super Resolution (“VSR”) is now available in Firefox. RTX VSR enhances and sharpens lower resolution video when upscaled to higher resolutions and also removes blocky artifacts commonly visible on low bitrate streamed video. VSR requires at least a 20-series or higher NVIDIA RTX GPU, Microsoft Windows 10/11 64-bit, and NVIDIA driver version R530 or higher. The feature can be enabled in the NVIDIA control panel.
    
*   NVIDIA RTX Video HDR is now available in Firefox. RTX Video HDR automatically converts SDR video to vibrant HDR10 in real time, letting you enjoy video with improved clarity on your HDR10 panel. It requires at least a 20-series NVIDIA RTX GPU, Microsoft Windows 10/11 64-bit, and NVIDIA driver version 550 or higher. The feature can be enabled in the NVIDIA control panel.
    

*   The URL Paste Suggestion feature added in [Fx125](https://www.mozilla.org/firefox/125.0.1/releasenotes/) was temporarily disabled while the team investigates a potential performance issue. The feature will be re-enabled in a future release once the performance issue is addressed.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 126 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-126-release-notes).
    

*   Added an option to disable/enable the Developer Tools' [split console](https://firefox-source-docs.mozilla.org/devtools-user/web_console/split_console/index.html) feature.
    

*   Implemented [URL.parse()](https://url.spec.whatwg.org/#dom-url-parse). Unlike the [URL constructor](https://developer.mozilla.org/docs/Web/API/URL/URL), which throws when parsing fails, the static `URL.parse()` method returns `null` instead.
    
*   The [CSS zoom property](https://drafts.csswg.org/css-viewport/#zoom-property) has been enabled by default following a lot of web compatibility and standardization work in the CSSWG.
    
*   Added support for [CSS Custom](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-state-pseudo-class) `:state()` and `CustomStateSet` pseudo-classes.
    

*   Added support for [IDBFactory.databases](https://developer.mozilla.org/docs/Web/API/IDBFactory/databases) for enumeration of IndexedDB databases.
    

*   On macOS, the text in the Crash Reporter dialog box is not localized for the non-en-US locales. This is tracked under [Bug 1896097](https://bugzilla.mozilla.org/show_bug.cgi?id=1896097) and we will rollout a fix in a future release. (fixed in 126.0.1)
    

*   With the release of Firefox 126, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 12 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   \[:flowejam\]: [1885693](https://bugzilla.mozilla.org/1885693)
    *   Amit Prakash Ambasta: [1889054](https://bugzilla.mozilla.org/1889054)
    *   Atlas Foulks: [243797](https://bugzilla.mozilla.org/243797), [1273551](https://bugzilla.mozilla.org/1273551)
    *   Camille: [1856717](https://bugzilla.mozilla.org/1856717), [1883058](https://bugzilla.mozilla.org/1883058)
    *   Christoph Moench-Tegeder: [1890593](https://bugzilla.mozilla.org/1890593)
    *   gravyant: [1838152](https://bugzilla.mozilla.org/1838152)
    *   Harshit: [1888221](https://bugzilla.mozilla.org/1888221)
    *   Mika Valkealahti: [1879304](https://bugzilla.mozilla.org/1879304)
    *   Nuohan Li: [1888420](https://bugzilla.mozilla.org/1888420)
    *   serfreeman1337: [1810362](https://bugzilla.mozilla.org/1810362)
    *   siddharthaswarnkar: [1825386](https://bugzilla.mozilla.org/1825386), [1853829](https://bugzilla.mozilla.org/1853829)
    *   Vaibhav Mali: [1880783](https://bugzilla.mozilla.org/1880783)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)