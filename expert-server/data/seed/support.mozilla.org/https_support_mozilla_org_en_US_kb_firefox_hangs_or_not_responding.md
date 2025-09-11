# https://support.mozilla.org/en-US/kb/firefox-hangs-or-not-responding

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 11/26/24 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)27% of users voted this helpful

When Firefox **hangs**, it stops responding to your clicks and keystrokes and doesn't seem to be doing anything. Also, a "(Not Responding)" label is displayed in the title bar and the mouse cursor becomes a spinning wheel when it's over the Firefox window.Also, the mouse becomes a spinning wait cursor when it's over the Firefox window. This article gives you solutions to Firefox hangs depending on when they happen.

*   If Firefox does not start at all, see [Firefox won't start - find solutions](https://support.mozilla.org/en-US/kb/firefox-wont-start-find-solutions).
*   If Firefox uses a lot of computer resources, see [Firefox uses too much memory or CPU resources - How to fix](https://support.mozilla.org/en-US/kb/firefox-uses-too-much-memory-or-cpu-resources).
*   If you get an "unresponsive script" warning, see [Warning Unresponsive script - What it means and how to fix it](https://support.mozilla.org/en-US/kb/warning-unresponsive-script).
*   If Firefox closes unexpectedly, see [Troubleshoot Firefox crashes (closing or quitting unexpectedly)](https://support.mozilla.org/en-US/kb/troubleshoot-firefox-crashes-closing-or-quitting).

To resolve problems not specifically mentioned in this article, or if the suggested solutions do not solve the problem, see [Troubleshoot and diagnose Firefox problems](https://support.mozilla.org/en-US/kb/troubleshoot-and-diagnose-firefox-problems).

**Note:** If you [send performance data](https://support.mozilla.org/en-US/kb/manage-firefox-data-collection-privacy-settings), Mozilla will gather data including hangs for your Firefox, which will help making Firefox better for future versions.

## Table of Contents

*   [1 Firefox hangs as soon as it opens](#w_firefox-hangs-as-soon-as-it-opens)
*   [2 Firefox hangs at random times](#w_firefox-hangs-at-random-times)
    *   [2.1 Create a new places database](#w_create-a-new-places-database)
    *   [2.2 Turn off hardware acceleration](#w_turn-off-hardware-acceleration)
    *   [2.3 Change the PAC implementation](#w_change-the-pac-implementation)
*   [3 Firefox hangs after using it for a long time](#w_firefox-hangs-after-using-it-for-a-long-time)
*   [4 Firefox hangs when downloading files or saving images](#w_firefox-hangs-when-downloading-files-or-saving-images)
    *   [4.1 Clear download history](#w_clear-download-history)
    *   [4.2 Choose a different download folder](#w_choose-a-different-download-folder)
*   [5 Firefox hangs when you quit it](#w_firefox-hangs-when-you-quit-it)

## Firefox hangs as soon as it opens

Interactions between certain Internet security software (firewall or anti-virus) can cause Firefox startup hangs on some systems. A [Firefox update](https://support.mozilla.org/en-US/kb/update-firefox-latest-release) or security software update may resolve this problem. You can also try to [reconfigure your firewall](https://support.mozilla.org/en-US/kb/configure-firewalls-so-firefox-can-access-internet) or disable your antivirus software temporarily, to see if the problem goes away. If your Internet security software is causing the issue, contact the software provider's support site or switch to a different product.

## Firefox hangs at random times

If Firefox seems to hang randomly and not after a specific action (for example, downloading a file or quitting Firefox), try the solutions in this section.

## Create a new _places_ database

If hangs are **periodic**, it may be caused by a corrupted _places_ database.

**Information**: The "places" files store the annotations, bookmarks, favorite icons, input history, keywords, and browsing history (a record of visited pages).

To create a new _places_ database, do the following:

**Warning:** This will clear your browsing history and remove bookmarks of the day.

1.  Open your profile folder:
    
    *   Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png), click and select .From the menu, select . The **Troubleshooting Information** tab will open.
    *   Under the **Application Basics** section next to _Profile FolderProfile Directory_, click Open FolderShow in FinderOpen Directory. A window will open that contains your profile folder.Your profile folder will open.Your profile directory will open.
    
    **Note:** If Firefox displays an error after clicking Open Folder or if you are unable to open or use Firefox, follow the instructions in [Finding your profile without opening Firefox](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data#w_finding-your-profile-without-opening-firefox).
    
2.  Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .Click the Firefox menu at the top of the screen and select .Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select . Wait until Firefox has completely quit.
3.  In the Firefox profile folder, find and rename the files **places.sqlite** to **places.sqlite.old** and **places.sqlite-journal** to **places.sqlite-journal.old** (if it exists).
    *   To rename a file, right-click on it and select rename from the menuclick on it once to select it and then click a second time on the file name to make it editable. Then add .old to the end of its name.
4.  Finally, reopen Firefox.
    *   When Firefox reopens it will create a new _places_ database. Your browsing history will be lost but Firefox will automatically import your bookmarks from the most recent backup file.

## Turn off hardware acceleration

With some graphics card and graphics driver setups, Firefox may hang when using hardware acceleration. You can try turning off hardware acceleration to see if it fixes the problem.

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  Select the panel.
3.  Under **Performance**, uncheck .  
    Additional settings will be displayed.
    
    ![Fx115Performance-disableHWA](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2024-02-04-09-58-02-c34ae7.png)
    
4.  Uncheck .
5.  Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .Click the Firefox menu at the top of the screen and select .Click the Firefox menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
6.  Start Firefox the way you normally do.

If the problem is no longer happening, then hardware acceleration was likely the cause. You can try [updating your graphics drivers](https://support.mozilla.org/en-US/kb/upgrade-graphics-drivers-use-hardware-acceleration) to see if that fixes it or simply run without hardware acceleration.

## Change the PAC implementation

If you're using a proxy auto-config file (PAC), Firefox may hang when you attempt to load sites that don't exist or that you haven't opened recently. To determine if you use an automatic proxy configuration file:

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  In the panel, go down to the **Network Settings** section.
3.  Click Settings…. The Connection Settings dialog appears.
4.  If **Automatic proxy configuration URL** is selected, you are using an automatic proxy configuration file. Do not disable this setting, which will prevent you from accessing the Internet. Instead, provide [this workaround](https://bugzilla.mozilla.org/show_bug.cgi?id=235853#c216) to your network administrator.
5.  Click Cancel.

## Firefox hangs after using it for a long time

Firefox may hang if left open for long periods of time. To fix the issue, restart Firefox.

If you regularly leave Firefox open so that you return to where you left off, you may want to use Firefox's Session Restore feature. For more information, see [Configuring session restore](https://support.mozilla.org/en-US/kb/restore-previous-session#w_configuring-session-restore).

## Firefox hangs when downloading files or saving images

If Firefox hangs when you attempt to download a file or save an image, try these solutions:

## Clear download history

Firefox may hang when downloading files if your download history has grown too large. To clear the download history:

1.  Open the Library window using one of these methods:
    *   Click the Downloads button ![Screenshots down arrow icon fx55](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2017-08-08-03-09-35-23cf57.png) on the toolbar, if it's available, and click from the menu.
    *   Click the menu ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) button and click from the menu.
2.  Click the Clear Downloads button at the top of the Library window.
3.  Download some sample files to see if the hanging has stopped.

## Choose a different download folder

Firefox may hang if the last download folder location (such as a shared volume or USB drive) is no longer available. To fix this:

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  Select the panel.
3.  Under **Downloads**, select **Save files to** and click the ChooseBrowse button.
4.  In the **Choose Download Folder** window, choose a new folder location.
5.  Close the page. Any changes you've made will automatically be saved.

See if you are now able to download files or save images. If this works, you can go back to your Firefox settings, if you wish, and select .

## Firefox hangs when you quit it

Sometimes when you close Firefox, it may stop responding and remain in memory, even though no Firefox windows are open. This can prevent Firefox from working properly the next time you open it or you may see a "Close Firefox" dialog box with an error message, _Firefox is already running, but is not responding.__A copy of Firefox is already open._ You must then end all Firefox processes or restart the computer before you can reopen Firefox (see ["Firefox is already running but is not responding" error - How to fix](https://support.mozilla.org/en-US/kb/firefox-already-running-not-responding) for other causes and solutions).

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Bo102010](https://support.mozilla.org/en-US/user/Bo102010/), [Underpass](https://support.mozilla.org/en-US/user/underpass/), [Tonnes](https://support.mozilla.org/en-US/user/Tonnes/), [Goofy](https://support.mozilla.org/en-US/user/Goofy_BZ/), [tanner](https://support.mozilla.org/en-US/user/Tanner/), [NoahSUMO](https://support.mozilla.org/en-US/user/Noah_SUMO/), [Michael Verdi](https://support.mozilla.org/en-US/user/Verdi/), [scoobidiver](https://support.mozilla.org/en-US/user/scoobidiver/), [Swarnava Sengupta](https://support.mozilla.org/en-US/user/Swarnava/), [ideato](https://support.mozilla.org/en-US/user/ideato/), [user633449](https://support.mozilla.org/en-US/user/user633449/), [user669794](https://support.mozilla.org/en-US/user/user669794/), [als](https://support.mozilla.org/en-US/user/retrovertigo/), [Wesley Branton](https://support.mozilla.org/en-US/user/ComputerWhiz/), [Lan](https://support.mozilla.org/en-US/user/upwinxp/), [Joni](https://support.mozilla.org/en-US/user/heyjoni/), [Artist](https://support.mozilla.org/en-US/user/Artist/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**