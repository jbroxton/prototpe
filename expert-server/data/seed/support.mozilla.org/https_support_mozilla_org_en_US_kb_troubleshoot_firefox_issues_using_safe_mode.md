# https://support.mozilla.org/en-US/kb/troubleshoot-firefox-issues-using-safe-mode

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 3/13/23 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)38% of users voted this helpful

When you run Firefox in **Troubleshoot Mode**, add-ons and some other features and customizations are disabled ([see below](#w_what-does-troubleshoot-mode-disable) for details). If you're having a problem in Firefox that does not occur in Troubleshoot Mode, the cause of the problem is one of the disabled items.

**Note:** Troubleshoot Mode was previously known as _Safe Mode_ in earlier versions of Firefox.

## Table of Contents

*   [1 How to start Firefox in Troubleshoot Mode](#w_how-to-start-firefox-in-troubleshoot-mode)
*   [2 Troubleshoot Mode window](#w_troubleshoot-mode-window)
*   [3 Diagnosing problems in Troubleshoot Mode](#w_diagnosing-problems-in-troubleshoot-mode)
    *   [3.1 The problem happens in Troubleshoot Mode](#w_the-problem-happens-in-troubleshoot-mode)
    *   [3.2 The problem does not happen in Troubleshoot Mode](#w_the-problem-does-not-happen-in-troubleshoot-mode)
*   [4 Exiting Troubleshoot Mode](#w_exiting-troubleshoot-mode)
*   [5 What does Troubleshoot Mode disable?](#w_what-does-troubleshoot-mode-disable)

## How to start Firefox in Troubleshoot Mode

Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png), click , select and click Restart in the _Restart Firefox in Troubleshoot Mode?_ dialog.

**Note:** You can also start Firefox in Troubleshoot Mode by holding down the Shift key while starting Firefox.holding down the option key while starting Firefox.quitting Firefox and then going to your **Terminal** and running: `firefox -safe-mode`  
You may need to specify the Firefox installation path (e.g. /usr/lib/firefox).

## Troubleshoot Mode window

![Fx89TroubleshootModeWin10](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-06-15-10-13-14-78eb78.png)

Choose one of these options:

*   Click Open to start Firefox with a default theme, your extensions disabled and some other features and customizations turned off. These changes are temporary. When you leave Troubleshoot Mode and start Firefox normally, your add-ons and other settings will return to the state they were in before you entered Troubleshoot Mode.
*   Click Refresh Firefox to restore Firefox to its factory default state while saving your essential information. These changes are permanent. Before you choose this option, see [Refresh Firefox - reset add-ons and settings](https://support.mozilla.org/en-US/kb/refresh-firefox-reset-add-ons-and-settings) for more information.

## Diagnosing problems in Troubleshoot Mode

After you start Firefox in _Troubleshoot Mode_, test its behavior and see if the problem goes away.

## The problem happens in Troubleshoot Mode

If the problem still happens in Troubleshoot Mode, it is not being caused by an add-on or by one of the other features and customizations that Troubleshoot Mode disables. Other possible causes include changes made to Firefox preference settings, which are not disabled in Troubleshoot Mode. See the following articles for solutions:

*   [Troubleshoot and diagnose Firefox problems](https://support.mozilla.org/en-US/kb/troubleshoot-and-diagnose-firefox-problems)
*   [Reset Firefox preferences to troubleshoot and fix problems](https://support.mozilla.org/en-US/kb/reset-preferences-fix-problems)

## The problem does not happen in Troubleshoot Mode

If the problem does not happen in Troubleshoot Mode, the most likely cause is an extension, theme or hardware acceleration. See this article for solutions:

*   [Troubleshoot extensions, themes and hardware acceleration issues to solve common Firefox problems](https://support.mozilla.org/en-US/kb/troubleshoot-extensions-themes-to-fix-problems)

## Exiting Troubleshoot Mode

1.  Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .Click the Firefox menu at the top of the screen and select .Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  Start Firefox as you normally would.

## What does Troubleshoot Mode disable?

*   [Add-ons (extensions and themes)](https://support.mozilla.org/en-US/kb/find-and-install-add-ons-add-features-to-firefox)
*   [Hardware acceleration](https://support.mozilla.org/en-US/kb/upgrade-graphics-drivers-use-hardware-acceleration) and [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
*   [Window and sidebar size and position settings](https://support.mozilla.org/en-US/kb/changes-toolbars-and-window-sizes-are-not-saved)
*   userChrome and userContent customizations
*   [JavaScript Just-in-time (JIT) compiler](https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/)

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Chris Ilias](https://support.mozilla.org/en-US/user/Chris_Ilias/), [Bo102010](https://support.mozilla.org/en-US/user/Bo102010/), [zzxc](https://support.mozilla.org/en-US/user/zzxc/), [novica](https://support.mozilla.org/en-US/user/novica/), [Tonnes](https://support.mozilla.org/en-US/user/Tonnes/), [Michele Rodaro](https://support.mozilla.org/en-US/user/michro/), [Scott](https://support.mozilla.org/en-US/user/SkipRinPerth/) , [Michael Verdi](https://support.mozilla.org/en-US/user/Verdi/), [scoobidiver](https://support.mozilla.org/en-US/user/scoobidiver/), [Swarnava Sengupta](https://support.mozilla.org/en-US/user/Swarnava/), [Jack](https://support.mozilla.org/en-US/user/jack013/), [Mozinet](https://support.mozilla.org/en-US/user/Mozinet/), [Kiki](https://support.mozilla.org/en-US/user/kelimuttu/), [Artist](https://support.mozilla.org/en-US/user/Artist/), [Fabi](https://support.mozilla.org/en-US/user/Fabi.L/), [Denys](https://support.mozilla.org/en-US/user/denyshon/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**