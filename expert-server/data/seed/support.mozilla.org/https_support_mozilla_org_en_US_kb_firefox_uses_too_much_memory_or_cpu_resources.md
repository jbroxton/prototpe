# https://support.mozilla.org/en-US/kb/firefox-uses-too-much-memory-or-cpu-resources

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 3/7/25 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)32% of users voted this helpful

At times, Firefox may require significant system resources in order to download, process, and display web content. If you are experiencing periods of sustained high resource usage while using Firefox, this article presents some options for you to review.

*   The CPU (Central Processing Unit) is the "brain" of the computer.
*   The RAM (Random Access Memory) or Memory helps your computer perform multiple tasks at the same time.
*   When your system resources are being heavily used, the overall performance and stability of the computer can be impacted.
*   Depending on your operating system, you can review and monitor resource usage through specific tools. See the [Use additional troubleshooting tools](#w_use-additional-troubleshooting-tools) section below for more information.

**Note:** If you [send performance data](https://support.mozilla.org/en-US/kb/manage-firefox-data-collection-privacy-settings), Mozilla will gather data including memory and CPU usage, which will help make Firefox better for future versions.

## Table of Contents

*   [1 Update to the latest version](#w_update-to-the-latest-version)
*   [2 Restart Firefox](#w_restart-firefox)
*   [3 Restart your computer](#w_restart-your-computer)
*   [4 Disable resource consuming extensions and themes](#w_disable-resource-consuming-extensions-and-themes)
*   [5 Hide intrusive content](#w_hide-intrusive-content)
*   [6 Use fewer tabs](#w_use-fewer-tabs)
*   [7 Close tabs that use too many system resources](#w_close-tabs-that-use-too-many-system-resources)
*   [8 Check Firefox hardware acceleration](#w_check-firefox-hardware-acceleration)
*   [9 Close other applications](#w_close-other-applications)
*   [10 Delete content-prefs.sqlite file](#w_delete-content-prefs-sqlite-file)
*   [11 Refresh Firefox](#w_refresh-firefox)
*   [12 Use additional troubleshooting tools](#w_use-additional-troubleshooting-tools)
    *   [12.1 Firefox tools](#w_firefox-tools)
    *   [12.2 Operating system tools](#w_operating-system-tools)
*   [13 Add RAM to your computer](#w_add-ram-to-your-computer)
*   [14 Upgrade your computer](#w_upgrade-your-computer)

## Update to the latest version

The latest Firefox version may include performance improvements. [Update Firefox to the latest release](https://support.mozilla.org/en-US/kb/update-firefox-latest-release).

## Restart Firefox

Firefox may use more system resources if it's left open for long periods of time. A workaround for this is to periodically restart Firefox. You can configure Firefox to save your tabs and windows so that when you start it again, you can start where you left off. See [Restore previous session - Configure when Firefox shows your most recent tabs and windows](https://support.mozilla.org/en-US/kb/restore-previous-session) for details.

## Restart your computer

Firefox may grind to a halt due to operating system issues, such as a pending Windows update, that can be resolved by restarting your computer.

## Disable resource consuming extensions and themes

Extensions and themes can cause Firefox to use more system resources than it normally would.

To determine if an extension or theme is causing Firefox to use too many resources, [start Firefox in Troubleshoot Mode](https://support.mozilla.org/en-US/kb/diagnose-firefox-issues-using-troubleshoot-mode) and observe its memory and CPU usage. In Troubleshoot Mode, extensions and themes are disabled, so if you notice a significant improvement, you can try disabling or uninstalling extensions.

*   For more information on starting Firefox in Troubleshoot Mode and on how to find which extension or theme is causing your problem, see [Troubleshoot extensions, themes and hardware acceleration issues to solve common Firefox problems](https://support.mozilla.org/en-US/kb/troubleshoot-extensions-themes-to-fix-problems).

## Hide intrusive content

Many web pages have content you don't need, but which still use system resources to display its content. Firefox's built-in content blocking can help save resources by preventing third-party tracking content from loading. See the [Enhanced Tracking Protection](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop) article for details.

Some extensions allow you to block unnecessary content; for example:

*   [Adblock Plus](https://addons.mozilla.org/firefox/addon/adblock-plus/) and [uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/) allow you to hide ads on websites.
*   [NoScript](https://addons.mozilla.org/firefox/addon/noscript) allows you to selectively enable and disable scripts running on websites.

Please reach out to the add-on developer directly, if you need help with a specific add-on.

## Use fewer tabs

Each tab requires Firefox to store a web page in memory. If you frequently have **more than 100 tabs open**, consider using a more lightweight mechanism to keep track of pages to read and things to do, such as:

*   [Bookmarks](https://support.mozilla.org/en-US/kb/bookmarks-firefox). _Hint: "[Bookmark All Tabs](https://support.mozilla.org/en-US/kb/tabs-organize-websites-single-window#w_tab-tips)" will bookmark a set of tabs._
*   [Save web pages for later with Pocket for Firefox](https://support.mozilla.org/en-US/kb/save-web-pages-later-pocket-firefox).
*   [To-do list applications](http://lifehacker.com/378062/five-best-gtd-applications).

## Close tabs that use too many system resources

Some websites use scripts that use a lot of memory and/or CPU to keep them up to date, such as online mail client pages. If these scripts are not optimized, they can lead to the use of too many system resources. You can see which tabs are using the most system resources by opening the [Firefox Task Manager](https://support.mozilla.org/en-US/kb/task-manager-tabs-or-extensions-are-slowing-firefox) (_about:processes_ page). If you do not need these tabs open all the time, you can close them to reduce system resources usage.

## Check Firefox hardware acceleration

Firefox hardware acceleration eases memory and CPU usage in many cases. Check in [Firefox's performance settings](https://support.mozilla.org/en-US/kb/performance-settings) that hardware acceleration is turned on. Also make sure that [your graphics drivers are up-to-date](https://support.mozilla.org/en-US/kb/upgrade-graphics-drivers-use-hardware-acceleration).

## Close other applications

Having many applications running simultaneously may cause your computer to run slowly and other applications to do so as well. By closing down some of the unnecessary applications, system usage will be reduced.

## Delete content-prefs.sqlite file

Firefox stores your data in various files in your profile folder. The file used for saving individual website settings might be corrupt. If you delete (or rename) that file, your zoom level settings will be reset but it could decrease CPU usage.

1.  *   Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png), click and select .From the menu, select . The **Troubleshooting Information** tab will open.
    *   Under the **Application Basics** section next to _Profile FolderProfile Directory_, click Open FolderShow in FinderOpen Directory. A window will open that contains your profile folder.Your profile folder will open.Your profile directory will open.
    
    **Note:** If Firefox displays an error after clicking Open Folder or if you are unable to open or use Firefox, follow the instructions in [Finding your profile without opening Firefox](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data#w_finding-your-profile-without-opening-firefox).
    
2.  Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .Click the Firefox menu at the top of the screen and select .Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
3.  In your profile folder, delete the file content-prefs.sqlite. It will be recreated next time you open Firefox.

## Refresh Firefox

The _Refresh Firefox_ feature can fix many issues by restoring your [Firefox profile](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data) to its default state while saving your essential information. See [Refresh Firefox - reset add-ons and settings](https://support.mozilla.org/en-US/kb/refresh-firefox-reset-add-ons-and-settings) for details.

## Use additional troubleshooting tools

There are a variety of troubleshooting tools that can be used both in Firefox and on your operating system to troubleshoot elevated system resource usage.

## Firefox tools

*   The [Firefox Task Manager](https://support.mozilla.org/en-US/kb/task-manager-tabs-or-extensions-are-slowing-firefox) (not to be confused with Windows Task Manager) is a great tool to see whether tabs and extensions are using too many system resources.
*   The **about:memory** page allows you to troubleshoot specific issues relating to memory (for instance, caused by a website, an extension, a theme, etc.) and sometimes its Minimize memory usage button may help you instantly reduce memory usage. For guidance on use of **about:memory** visit [about:memory](https://firefox-source-docs.mozilla.org/performance/memory/about_colon_memory.html).
*   Even if you're not a programmer, you can try your hand at some other [tools and tips Firefox developers use to debug leaks](https://firefox-source-docs.mozilla.org/performance/index.html#memory-profiling-and-leak-detection-tools).

## Operating system tools

*   View how system resources are being used by checking [the Windows Task Manager](https://wikipedia.org/wiki/Task_Manager_\(Windows\)) _Performance_ tab (click on "More details" in the Task Manager to show all tabs). See [this Windows blog post](https://blogs.windows.com/windowsexperience/2013/06/06/windows-8-task-manager-in-depth/) at Microsoft's site for more information.

*   View how system resources are being used by checking Activity Monitor. See [How to use Activity Monitor on your Mac](https://support.apple.com/en-ca/HT201464) at Apple's site for more information.

*   Although it's not included on every distribution of Linux, most versions of Linux have a graphical resource monitor. It's often called System Monitor, but there are other alternatives also available.
*   Running the `top` command in the terminal will display a list of all the running processes and their system resource consumption.

**WARNING:** There are a variety of third-party programs that promise to increase your computer's performance. You should exercise caution when installing third-party software and only use reputable software provided by an official source.

## Add RAM to your computer

If you exhausted all tips in the previous sections and your memory usage is still close to the maximum, maybe it's time for you to add more memory to your computer. Adding RAM will provide a huge performance boost.

## Upgrade your computer

If you exhausted all tips in the previous sections and you are still experiencing high system resource usage, it may be time to upgrade your computer. As technology progresses, software is becoming more advanced and requires more powerful computers to run effectively.

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Chris Ilias](https://support.mozilla.org/en-US/user/Chris_Ilias/), [Tonnes](https://support.mozilla.org/en-US/user/Tonnes/), [Michele Rodaro](https://support.mozilla.org/en-US/user/michro/), [Tim](https://support.mozilla.org/en-US/user/timc/), [Michael Verdi](https://support.mozilla.org/en-US/user/Verdi/), [scoobidiver](https://support.mozilla.org/en-US/user/scoobidiver/), [Andrew](https://support.mozilla.org/en-US/user/feer56/), [John99](https://support.mozilla.org/en-US/user/John99/), [TyDraniu](https://support.mozilla.org/en-US/user/TyDraniu/), [Swarnava Sengupta](https://support.mozilla.org/en-US/user/Swarnava/), [soucet](https://support.mozilla.org/en-US/user/soucet/), [Ashickur Rahman](https://support.mozilla.org/en-US/user/ashickurnoor/), [Kiki](https://support.mozilla.org/en-US/user/kelimuttu/), [Wesley Branton](https://support.mozilla.org/en-US/user/ComputerWhiz/), [Lan](https://support.mozilla.org/en-US/user/upwinxp/), [Joni](https://support.mozilla.org/en-US/user/heyjoni/), [SphinxKnight](https://support.mozilla.org/en-US/user/SphinxKnight/), [Dinesh](https://support.mozilla.org/en-US/user/DineshMv/), [Marcelo Ghelman](https://support.mozilla.org/en-US/user/marcelo.ghelman/), [Ömer Timur](https://support.mozilla.org/en-US/user/OmTi/), [Caitlin Neiman](https://support.mozilla.org/en-US/user/caitmuenster/), [Zppix](https://support.mozilla.org/en-US/user/Zppix/), [JohnG](https://support.mozilla.org/en-US/user/JohnGre/), [yoasif](https://support.mozilla.org/en-US/user/yoasif/), [vmmunoz4](https://support.mozilla.org/en-US/user/vmmunoz4/), [Angela Lazar](https://support.mozilla.org/en-US/user/anlazar/), [ErlingR](https://support.mozilla.org/en-US/user/erling.rosag/), [Lucas Siebert](https://support.mozilla.org/en-US/user/lsiebert/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**