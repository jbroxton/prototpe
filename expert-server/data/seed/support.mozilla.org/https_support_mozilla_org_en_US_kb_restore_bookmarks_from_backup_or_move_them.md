# https://support.mozilla.org/en-US/kb/restore-bookmarks-from-backup-or-move-them

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 12/4/22 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)53% of users voted this helpful

Firefox automatically creates backups of your [bookmarks](https://support.mozilla.org/en-US/kb/bookmarks-firefox) and saves the last 15 backups for safekeeping. This article describes how to restore your bookmarks from the automatic backups that Firefox creates, how to save and restore your own bookmark backup files, and how to move your bookmarks to another computer.

*   If your bookmarks suddenly become unavailable in Firefox, see [Recover lost or missing Bookmarks](https://support.mozilla.org/en-US/kb/recover-lost-or-missing-bookmarks) for troubleshooting information.
*   For more information about using bookmarks, see [Bookmarks in Firefox](https://support.mozilla.org/en-US/kb/bookmarks-firefox).

## Table of Contents

*   [1 Backup and restore](#w_backup-and-restore)
    *   [1.1 Manual backup](#w_manual-backup)
    *   [1.2 Restoring from backups](#w_restoring-from-backups)
*   [2 Moving bookmarks to another computer](#w_moving-bookmarks-to-another-computer)
    *   [2.1 Using Firefox Sync](#w_using-firefox-sync)
    *   [2.2 Using a bookmark backup file](#w_using-a-bookmark-backup-file)
*   [3 Restoring bookmarks after upgrading or downgrading Windows 10](#w_restoring-bookmarks-after-upgrading-or-downgrading-windows-10)

## Backup and restore

## Manual backup

1.  Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) to open the menu panel. Click and then click the bar at the bottom.
2.  In the Library window, click the ![import-export-arrows](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-10-04-10-18-16-d309be.png)Import and Backup button and then select .  
    ![Bookmarks Backup 68](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-10-05-08-14-55-26baa0.png)
3.  In the Bookmarks backup filename window that opens, choose a location to save the file, which is named bookmarks-"date".json by default. The desktop is usually a good spot, but any place that is easy to remember will work.
4.  Save the bookmarks json file. The Bookmarks backup filename window will close and then you can close the Library window.

## Restoring from backups

**Caution: Restoring bookmarks from a backup will overwrite your current set of bookmarks with the ones in the backup file.**

1.  Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) to open the menu panel. Click and then click the bar at the bottom.
2.  In the Library window, click the ![import-export-arrows](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-10-04-10-18-16-d309be.png)Import and Backup button and then select .  
    ![Bookmarks Restore 68](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2019-10-05-08-19-30-c86aaa.png)
3.  Select the backup from which you want to restore:
    *   The dated entries are automatic bookmark backups.
    *   lets you restore from a manual backup (see above).
4.  After selecting a backup and confirming your choice, your bookmarks from that backup will be restored.
5.  Close the Library window.

## Moving bookmarks to another computer

## Using Firefox Sync

You can use Firefox Sync to move your bookmarks from one computer to another.

**Important:** Firefox Sync continuously updates itself as you change bookmarks, so **it does not provide a true backup service**, nor is it intended to be used as one.

Firefox Sync is the best way to keep your bookmarks (and other profile data) synchronized between all of the computers you use. See [How do I set up Sync on my computer?](https://support.mozilla.org/en-US/kb/how-do-i-set-sync-my-computer) for more information and instructions on setting it up.

## Using a bookmark backup file

You can also use a bookmark backup file from one computer and restore it on another computer. This is useful if you can't synchronize the two computers' bookmarks using Sync, for some reason.

The bookmark backup file can either be a [manual backup](#w_manual-backup) (see above) or one of the automatic dated backups located inside the [Firefox profile folder](https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data) named bookmarkbackups folder. Place the bookmark backup file on your transfer media (for example a Flash drive) and copy it to the desktop (or any location) of the other computer. You can then restore the backup from the Firefox Library window, using the option, as described in the [Restoring from backups](#w_restoring-from-backups) section above.

## Restoring bookmarks after upgrading or downgrading Windows 10

After upgrading or downgrading your Windows 10 operating system, a directory named Windows.old is created, and most of the data erased from the upgrade or downgrade is stored there. One especially useful item is the Bookmarks from Firefox. Follow the instructions in [Restoring from backups](#w_restoring-from-backups) above, and when you select , follow the path _C:\\Windows.old\\Users\\<UserName>\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\<filename.default>\\bookmarkbackups_ to your previous bookmarks. Check the file date for information when the backup was created. Be aware using a backup bookmark folder will replace all the bookmarks in Firefox with the bookmarks in the backup file.

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Chris Ilias](https://support.mozilla.org/en-US/user/Chris_Ilias/), [Tonnes](https://support.mozilla.org/en-US/user/Tonnes/), [Jan.](https://support.mozilla.org/en-US/user/Jan./), [Michael Verdi](https://support.mozilla.org/en-US/user/Verdi/), [scoobidiver](https://support.mozilla.org/en-US/user/scoobidiver/), [rnewman@mozilla.com](https://support.mozilla.org/en-US/user/rnewman@mozilla.com/), [Swarnava Sengupta](https://support.mozilla.org/en-US/user/Swarnava/), [mluna](https://support.mozilla.org/en-US/user/mluna/), [Jason](https://support.mozilla.org/en-US/user/greasemonkey/), [ideato](https://support.mozilla.org/en-US/user/ideato/), [Lan](https://support.mozilla.org/en-US/user/upwinxp/), [Artist](https://support.mozilla.org/en-US/user/Artist/), [Jibsman](https://support.mozilla.org/en-US/user/Jibsman/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**