# https://www.mozilla.org/en-US/firefox/127.0/releasenotes/

Version 127.0, first offered to Release channel users on June 11, 2024

*   You can now set Firefox to automatically launch whenever you start or restart your Windows computer. Setting Firefox to auto-launch optimizes efficiency in our browser-centric digital routines, eliminating manual startup delays and facilitating immediate web access. ([Learn more](https://support.mozilla.org/kb/open-firefox-automatically-when-you-start-computer))
    
*   We completed work to optimize and enable DNS prefetching for HTTPS documents via the `rel="dns-prefetch"` link hint. This standard allows web developers to specify domain names for important assets that should be resolved preemptively.
    
*   It is now possible to close all duplicate tabs in a window with the _Close duplicate tabs_ command available from the _List all tabs_ widget in the tab bar or a tab context menu.
    
*   Firefox will now automatically try to [upgrade `<img>`, `<audio>`, and `<video>` elements from HTTP to HTTPS](https://blog.mozilla.org/security/2024/06/05/firefox-will-upgrade-more-mixed-content-in-version-127/) if they are embedded within an HTTPS page. If these so-called mixed content elements do not support HTTPS, they will no longer load.
    
*   For added protection on MacOS and Windows, a device sign in (e.g. your operating system password, fingerprint, face or voice login if enabled) can be required when accessing and filling stored passwords in the [Firefox Password Manager](https://support.mozilla.org/kb/password-manager-remember-delete-edit-logins) about:logins page.
    

*   To reduce user fingerprinting information and the risk of some website compatibility issues, the CPU architecture for 32-bit x86 Linux will now be reported as x86\_64 in Firefox's User-Agent string and `navigator.platform` and `navigator.oscpu` Web APIs.
    
*   Links and other focusable elements are now tab-navigable by default on macOS, instead of following macOS' "Keyboard navigation" setting. This is a more accessible default and matches the default in all other platforms. A checkbox in the settings page still allows users to restore the old behavior.
    
*   The Screenshots feature in Firefox has gotten a big update! It now supports taking screenshots of file types like SVG, XML, and more as well as various about: pages within Firefox. We've also made the screenshot tool more accessible to everyone by implementing new keyboard shortcuts and adding theme compatibility and High Contrast Mode (HCM) support. And finally, performance for capturing large screenshots has been improved.
    

*   You can find information about policy updates and enterprise-specific bug fixes in the [Firefox for Enterprise 127 Release Notes](https://support.mozilla.org/kb/firefox-enterprise-127-release-notes).
    

*   `navigator.clipboard.read()/write()` has been enabled (see [documentation](https://developer.mozilla.org/docs/Web/API/Clipboard_API)). A paste context menu will appear for the user to confirm when attempting to read clipboard content that is not originated from a `same-origin` page.
    

*   Users with a Firefox primary password set should provide this when Firefox 127 first starts. Dismissing the primary password prompt instead will break restoring the previous session, and can disrupt other functionality. This is only required once ([bug 1901899](https://bugzilla.mozilla.org/show_bug.cgi?id=1901899)). (fixed in 127.0.1)
    
*   On Windows, the Private Window icon is displayed in the taskbar even though `browser.privateWindowSeparation.enabled` is set to `false` ([bug 1901840](https://bugzilla.mozilla.org/1901840)). (fixed in 127.0.2)
    
*   Under certain conditions, YouTube playback may experience stalling issues ([bug 1878510](https://bugzilla.mozilla.org/1878510)). (fixed in 127.0.2)
    

*   With the release of Firefox 127, we are pleased to welcome the developers who contributed their first code change to Firefox in this release, 8 of whom were brand new volunteers! Please join us in thanking each of these diligent and enthusiastic individuals, and take a look at their contributions:
    
    *   alphare33: [1856611](https://bugzilla.mozilla.org/1856611)
    *   ash: [1783183](https://bugzilla.mozilla.org/1783183)
    *   Dongwoo Kang \[:nyanrus\]: [1891317](https://bugzilla.mozilla.org/1891317)
    *   endington543: [1820570](https://bugzilla.mozilla.org/1820570), [1891816](https://bugzilla.mozilla.org/1891816), [1892348](https://bugzilla.mozilla.org/1892348), [1893985](https://bugzilla.mozilla.org/1893985)
    *   jmc531: [1885695](https://bugzilla.mozilla.org/1885695)
    *   Joseph Webster: [1825105](https://bugzilla.mozilla.org/1825105), [1893061](https://bugzilla.mozilla.org/1893061), [1894063](https://bugzilla.mozilla.org/1894063)
    *   Leeya: [1742889](https://bugzilla.mozilla.org/1742889)
    *   Steve P: [1836440](https://bugzilla.mozilla.org/1836440), [1844935](https://bugzilla.mozilla.org/1844935), [1880909](https://bugzilla.mozilla.org/1880909)
    

## Get the most recent version

[All Firefox downloads](https://www.mozilla.org/en-US/download/all/desktop-release/)