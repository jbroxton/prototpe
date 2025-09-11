# https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 2 weeks, 2 days ago ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)65% of users voted this helpful

Enhanced Tracking Protection in Firefox automatically protects your privacy while you browse. It blocks trackers that follow you around online to collect information about your browsing habits and interests [without breaking site functionality](https://support.mozilla.org/en-US/kb/smartblock-enhanced-tracking-protection). It also includes protections against harmful scripts, such as malware that drains your battery.

## Table of Contents

*   [1 Protections Dashboard](#w_protections-dashboard)
*   [2 What Enhanced Tracking Protection blocks](#w_what-enhanced-tracking-protection-blocks)
*   [3 Bounce Tracking Protection](#w_bounce-tracking-protection)
*   [4 How to tell when Firefox is protecting you](#w_how-to-tell-when-firefox-is-protecting-you)
*   [5 How to tell what’s being blocked on a site](#w_how-to-tell-whats-being-blocked-on-a-site)
*   [6 What to do if a site seems broken](#w_what-to-do-if-a-site-seems-broken)
    *   [6.1 Report a broken site](#w_report-a-broken-site)
*   [7 Adjust your global Enhanced Tracking Protection settings](#w_adjust-your-global-enhanced-tracking-protection-settings)
    *   [7.1 Standard Enhanced Tracking Protection](#w_standard-enhanced-tracking-protection)
    *   [7.2 Strict Enhanced Tracking Protection](#w_strict-enhanced-tracking-protection)
    *   [7.3 Custom Enhanced Tracking Protection](#w_custom-enhanced-tracking-protection)
        *   [7.3.1 WebCompat exception checkboxes](#w_webcompat-exception-checkboxes)
*   [8 Copy Clean Link](#w_copy-clean-link)
    *   [8.1 Copy from the address bar](#w_copy-from-the-address-bar)
    *   [8.2 Copy from in-page links](#w_copy-from-in-page-links)
*   [9 Related articles](#w_related-articles)

## Protections Dashboard

To see what’s been blocked on all sites over the past week, visit your Protections Dashboard. Click the shield ![Fx89ShieldIcon](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-05-12-06-f2679d.png) to the left of the address bar and select or type **about:protections** into the address bar. This will open the _Protections Dashboard_ page in a new tab.

## What Enhanced Tracking Protection blocks

Firefox uses a list of known trackers provided by [Disconnect](https://disconnect.me/trackerprotection). By default, Firefox blocks the following types of trackers and scripts:

*   Social media trackers
*   Cross-site tracking cookies
*   Fingerprinters
*   Cryptominers
*   Tracking content: These trackers are hidden in ads, videos and other in-page content. In **Standard** mode, tracking content is blocked only in [Private Windows](https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history). To add this protection to all windows, visit your privacy preferences and select **Strict** or **Custom** as [explained below](#w_adjust-your-global-enhanced-tracking-protection-settings).

To learn more about trackers and scripts blocked by Firefox, see [Trackers and scripts Firefox blocks in Enhanced Tracking Protection](https://support.mozilla.org/en-US/kb/trackers-and-scripts-firefox-blocks-enhanced-track), [Third-party trackers](https://support.mozilla.org/en-US/kb/third-party-trackers) and [SmartBlock for Enhanced Tracking Protection](https://support.mozilla.org/en-US/kb/smartblock-enhanced-tracking-protection).

## Bounce Tracking Protection

Bounce Tracking Protection is a feature in Enhanced Tracking Protection (ETP) [strict mode](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop#w_strict-enhanced-tracking-protection) that prevents redirect trackers (bounce trackers) from collecting data as you navigate between websites. These trackers redirect you through intermediate URLs to gather information about your browsing habits.

How it works:

*   Firefox automatically detects and classifies bounce trackers.
*   Cookies and storage associated with these trackers are cleared if no user interaction occurs within a designated time.

Bounce Tracking Protection effortlessly enhances your privacy, operating in the background when ETP is set to strict mode. For technical details, visit the [Mozilla Source Docs](https://firefox-source-docs.mozilla.org/toolkit/components/antitracking/anti-tracking/bounce-tracking-protection/index.html).

## How to tell when Firefox is protecting you

The shield to the left of the address bar tells you if Firefox is blocking trackers and scripts on a site.

![Shield Address bar](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-04-23-12-56-36-6bb740.png)![Fx130Shield-Addressbar](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2024-09-29-13-08-37-21ab16.png)

## How to tell what’s being blocked on a site

*   Click the shield to see what Firefox has blocked.
    
    ![Protections for panel](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2024-02-20-09-08-56-5f9d3d.png)
    

This panel will display different information depending on the site you’re on.

*   **Blocked:** Firefox blocked these trackers and scripts. Select each one to see a detailed list.
*   **Allowed:** These are the trackers and scripts that were allowed to load on the page. This happens because some websites may require loading trackers and scripts to function properly. Firefox only allows trackers and scripts needed for the site to work and blocks the rest. For more information, visit [SmartBlock for Enhanced Tracking Protection](https://support.mozilla.org/en-US/kb/smartblock-enhanced-tracking-protection).
*   **None Detected:** Firefox looked for these trackers and scripts, but did not find them on this site.
*   Select to adjust your global privacy settings.
*   Select to view a personalized summary of your protections over the past week, including tools to take control of your online security.

## What to do if a site seems broken

If a site seems broken, disabling Enhanced Tracking Protection might fix the issue by allowing trackers on just that site. Enhanced Tracking Protection will still prevent trackers on other sites. To disable it:

1.  Visit the website.
2.  At the left of the address bar, click the ![Fx89ShieldIcon](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-05-12-06-f2679d.png) shield icon.
3.  At the top of the panel, toggle off the Enhanced Tracking Protection switch ![Fx91ETPbluetoggle](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-03-16-12-56-21-3859dc.png). The site will be added to your Enhanced Tracking Protection exception list, allowing trackers on it, and the page will reload automatically.
    
    ![Protection panel](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2024-02-20-06-58-36-8c3fa8.png)![Fx138ProtectionPanelOff](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-05-13-03-19-08-3f5858.png)
    

Follow the same process to turn Enhanced Tracking Protection back on. The site will be removed from the exception list, and the page will reload automatically.

You may encounter breakage on some sites when you’re in **Strict** Enhanced Tracking Protection. This is because trackers are hidden in some content. For example, a website might embed an outside video or social media post that contains trackers. To block the trackers, Firefox must also block the content itself. Trackers are often hidden in the following types of content:

*   Login fields
*   Forms
*   Payments
*   Comments
*   Videos

## Report a broken site

If a broken site starts working properly again after turning off the Enhanced Tracking Protection, you can click the shield ![Fx91shield-ETPoff](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-03-16-13-20-43-26a8c0.png) icon and select **Send report**. This will show the _Report a Broken Site_ panel.

![Fx98ETP-ReportBrokenSite](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-03-23-12-12-39-99d4dd.png)

The Send Report button will send site related data to Mozilla, so future Firefox versions can load that site working properly with Enhanced Tracking Protection enabled for everyone. By filling the optional **Describe the problem** field helps us fix the problem faster.

For more information, see [How do I report a broken site in Firefox desktop?](https://support.mozilla.org/en-US/kb/report-breakage-due-blocking)

## Adjust your global Enhanced Tracking Protection settings

When you download Firefox, all protections included in **Standard** Enhanced Tracking Protection are already enabled.

To view or change your Enhanced Tracking Protection settings for all sites, follow the steps below.

1.  On the left side of your address bar on any website, click the shield ![Fx89ShieldIcon](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-05-12-06-f2679d.png) icon.
2.  Select .
    
    ![Protection settings](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-08-07-15-11-07-03310a.png)
    
3.  This will open the Settings _Privacy & Security_ panel in a new tab and show you the **Enhanced Tracking Protection** settings.
    
    ![Standard ETP](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-08-07-15-13-17-eb6d8a.png)
    

**Tip:** These settings are also available from the Firefox menu:  
In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select . Then select .

## Standard Enhanced Tracking Protection

By default, Firefox blocks the following on all sites:

*   Social media trackers
*   Cross-site tracking cookies (other third-party cookies are isolated)
*   Tracking content in [Private Windows](https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history) only
*   Cryptominers
*   Fingerprinters

## Strict Enhanced Tracking Protection

To further increase privacy, select **Strict** Enhanced Tracking Protection. This will block the following:

*   Social media trackers
*   Cross-site tracking cookies (other third-party cookies are isolated)All cross-site cookies
*   Tracking content in all windows
*   Cryptominers
*   Fingerprinters

To select this set up for your Enhanced Tracking Protection settings, follow these steps:

1.  Click the shield ![Fx89ShieldIcon](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-05-12-06-f2679d.png) to the left of the address bar on any webpage.
2.  Click .
    
    The Firefox Settings _Privacy & Security_ panel will open.
    
3.  Under _Enhanced Tracking Protection_, select .
4.  Select the ![reload all tabs retina](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-09-13-11-05-25-37ec1e.png) button to apply your new privacy settings.

## Custom Enhanced Tracking Protection

Want to block some trackers and scripts, but not others? Use **Custom** Enhanced Tracking Protection.

1.  Click the shield ![Fx89ShieldIcon](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-05-12-06-f2679d.png) to the left of the address bar on any webpage.
2.  Click .
    
    The Firefox Settings _Privacy & Security_ panel will open.
    
3.  Under _Enhanced Tracking Protection_, select .
4.  Choose which trackers and scripts to block by selecting those checkboxes.
5.  Select the ![reload all tabs retina](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-09-13-11-05-25-37ec1e.png) button to apply your new privacy settings.

You can also turn off all protections in **Custom** by deselecting all checkboxes. This allows all trackers and scripts to load.

### WebCompat exception checkboxes

Starting with [Firefox version](https://support.mozilla.org/en-US/kb/find-what-version-firefox-you-are-using) 142, Firefox may allow certain trackers to load on specific websites to ensure they work properly. These are called **WebCompat exceptions**, and you can manage them in Strict and Custom settings.

*   In the **Strict** and **Custom** section, select or deselect the checkboxes to adjust Web compatibility exceptions.
*   Deselecting these options will block **all** trackers, even on sites that may break without them.

**Note:** Disabling WebCompat exceptions can improve privacy, but may cause website features (like video playback or login popups) to stop working correctly.

To apply changes, click the ![reload all tabs retina](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-09-13-11-05-25-37ec1e.png) if prompted.

## Copy Clean Link

Starting with [Firefox version](https://support.mozilla.org/en-US/kb/find-what-version-firefox-you-are-using) 120, the _Copy Clean Link_ feature is automatically enabled to safeguard users against URL-based tracking by stripping tracking parameters from any copied URL.

## Copy from the address bar

To copy URLs from the address bar stripping any tracking parameters it may have, do the following:

1.  Right-click the URL you want to copy and select .
2.  Paste the clean URL from the clipboard.
    
    ![Copy Clean Link address bar](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-04-28-14-22-25-511be7.png)
    

## Copy from in-page links

To copy URLs from in-page links stripping any tracking parameters it may have, do the following:

1.  Right-click the URL you want to copy and select .
2.  Paste the clean URL from the clipboard.

## Related articles

*   [How do I report a broken site in Firefox desktop?](https://support.mozilla.org/en-US/kb/report-breakage-due-blocking)

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Chris Ilias](https://support.mozilla.org/en-US/user/Chris_Ilias/), [Michele Rodaro](https://support.mozilla.org/en-US/user/michro/), [Mozinet](https://support.mozilla.org/en-US/user/Mozinet/), [Lan](https://support.mozilla.org/en-US/user/upwinxp/), [Joni](https://support.mozilla.org/en-US/user/heyjoni/), [Marcelo Ghelman](https://support.mozilla.org/en-US/user/marcelo.ghelman/), [Lamont Gardenhire](https://support.mozilla.org/en-US/user/Lamont287/), [Jeff](https://support.mozilla.org/en-US/user/jeff.youmans/), [Mark Heijl](https://support.mozilla.org/en-US/user/markh2/), [Angela Lazar](https://support.mozilla.org/en-US/user/anlazar/), [PGGWriter](https://support.mozilla.org/en-US/user/peregrin.hendley/), [Samuelegrice@mymail.com](https://support.mozilla.org/en-US/user/samuelegrice/), [Fabi](https://support.mozilla.org/en-US/user/Fabi.L/), [k\_alex](https://support.mozilla.org/en-US/user/k_alex/), [Bithiah](https://support.mozilla.org/en-US/user/VintageMind/), [Abby](https://support.mozilla.org/en-US/user/aparise/), [dirkpeukert4](https://support.mozilla.org/en-US/user/dirkpeukert4/), [Denys](https://support.mozilla.org/en-US/user/denyshon/), [Lucas Siebert](https://support.mozilla.org/en-US/user/lsiebert/), [Dayani Lucia G.F.](https://support.mozilla.org/en-US/user/dgalindo/), [Flavius Floare](https://support.mozilla.org/en-US/user/ffloare/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**