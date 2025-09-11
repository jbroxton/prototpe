# https://www.mozilla.org/en-US/firefox/133.0/releasenotes/

Version 133.0, first offered to Release channel users on November 26, 2024

*   Firefox now has a new anti-tracking feature, Bounce Tracking Protection, which is now available in [Enhanced Tracking Protection's](https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop) "Strict" mode. This feature detects bounce trackers based on their [redirect behavior](https://blog.mozilla.org/security/2020/08/04/firefox-79-includes-protections-against-redirect-tracking/) and periodically purges their cookies and site data to block tracking.
    
*   The sidebar to view [tabs from other devices](https://support.mozilla.org/kb/view-synced-tabs-other-devices) can now be opened via the [Tab overview menu](https://support.mozilla.org/kb/tab-overview-menu).
    
    ![screenshot of the Tab Overview menu showing the tabs from other devices menu entry](https://www.mozilla.org/media/img/firefox/releasenotes/note-images/133_tab_overview.png)
    
*   Canvas2D switched from Direct2D to a platform independent acceleration backend on Windows.
    

*   The “Picture-in-Picture: auto-open on tab switch” feature from [Firefox Labs](https://support.mozilla.org/kb/firefox-labs-explore-experimental-features-firefox) now behaves more reliably across a wider range of sites, automatically opening relevant videos while ignoring others.
    

*   When server time is available, the "expire" attribute value is adjusted by adding the difference between the server and local times. If the current time is set in the future, cookies that have not expired according to the server time are considered valid.
    

*   You can find information about policy updates and enterprise specific bug fixes in the [Firefox for Enterprise 133 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-133-release-notes).
    

*   Firefox now supports the `keepalive` option in the [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API). This feature allows developers to make HTTP requests that can continue to run even after the page is unloaded, such as during page navigation or closing.
    
*   Firefox now supports the [Permissions API](https://developer.mozilla.org/docs/Web/API/Permissions_API) in `Worker` Context.
    
*   Firefox now dispatches [beforetoggle events](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) just before a dialog opens and [toggle events](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) after the dialog closes, matching the behavior of [popovers](https://developer.mozilla.org/docs/Web/HTML/Global_attributes/popover).
    
*   Methods are now available on [UInt8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) to convert to and from Base64 and hexadecimal encodings. This is an implementation of a Stage 3 TC39 proposal, for more details see the [proposal text](https://github.com/tc39/proposal-arraybuffer-base64).
    
*   Added support for [image decoding](https://developer.mozilla.org/docs/Web/API/ImageDecoder) as part of the [WebCodecs API](https://developer.mozilla.org/docs/Web/API/WebCodecs_API). This allows for decoding of images from the main and worker threads.
    

*   With the release of Firefox 133, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 16 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   abhijeetchawla\[:ff2400t\]: [1810429](https://bugzilla.mozilla.org/1810429), [1810480](https://bugzilla.mozilla.org/1810480), [1810482](https://bugzilla.mozilla.org/1810482), [1810483](https://bugzilla.mozilla.org/1810483), [1810485](https://bugzilla.mozilla.org/1810485), [1810486](https://bugzilla.mozilla.org/1810486), [1855165](https://bugzilla.mozilla.org/1855165), [1855168](https://bugzilla.mozilla.org/1855168)
    *   bootleq: [1905331](https://bugzilla.mozilla.org/1905331)
    *   Chizoba ODINAKA: [1918731](https://bugzilla.mozilla.org/1918731)
    *   Christian Liebel: [1921633](https://bugzilla.mozilla.org/1921633)
    *   Collin Richards: [1086524](https://bugzilla.mozilla.org/1086524)
    *   Diego Ciudad Real: [1853990](https://bugzilla.mozilla.org/1853990), [1878737](https://bugzilla.mozilla.org/1878737)
    *   gasc: [1868303](https://bugzilla.mozilla.org/1868303)
    *   Jason: [1882316](https://bugzilla.mozilla.org/1882316)
    *   Lukasz Gniadzik \[:lgniadzik\]: [1926280](https://bugzilla.mozilla.org/1926280)
    *   Maxime Thiebaut: [1915982](https://bugzilla.mozilla.org/1915982)
    *   Oliver Old \[:oold\]: [1640243](https://bugzilla.mozilla.org/1640243)
    *   psychpsyo: [1837773](https://bugzilla.mozilla.org/1837773)
    *   Serah Nderi: [1923710](https://bugzilla.mozilla.org/1923710), [1923737](https://bugzilla.mozilla.org/1923737), [1924202](https://bugzilla.mozilla.org/1924202), [1924608](https://bugzilla.mozilla.org/1924608)
    *   Syed Bariman Jan: [1918706](https://bugzilla.mozilla.org/1918706), [1918734](https://bugzilla.mozilla.org/1918734), [1922523](https://bugzilla.mozilla.org/1922523)
    *   tanishkasingh2004: [1922593](https://bugzilla.mozilla.org/1922593), [1923190](https://bugzilla.mozilla.org/1923190)
    *   tawanda: [1918735](https://bugzilla.mozilla.org/1918735), [1923146](https://bugzilla.mozilla.org/1923146)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)