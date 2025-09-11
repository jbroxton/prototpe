# https://support.mozilla.org/en-US/kb/change-firefox-behavior-when-open-file

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 6/6/25 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)42% of users voted this helpful

This article describes how Firefox handles downloaded files for different types of content, such as saving a file or opening an application installed on your computer, and how you can change that behavior.

*   For help with problems downloading files, see [What to do if you can't download or save files](https://support.mozilla.org/en-US/kb/cant-download-or-save-files).
*   For help with embedded media on web pages, see [Fix common audio and video issues](https://support.mozilla.org/en-US/kb/fix-common-audio-and-video-issues).
*   For help changing the e-mail program Firefox uses, see [Change the program used to open email links](https://support.mozilla.org/en-US/kb/change-program-used-open-email-links).

## Table of Contents

*   [1 File types and download actions](#w_file-types-and-download-actions)
*   [2 Changing download actions](#w_changing-download-actions)
    *   [2.1 Set Firefox to ask you what to do for files with no defined content type](#w_set-firefox-to-ask-you-what-to-do-for-files-with-no-defined-content-type)
*   [3 Adding download actions](#w_adding-download-actions)
    *   [3.1 "Always Open Similar Files" option](#w_always-open-similar-files-option)
    *   [3.2 "What should Firefox do with this file?" prompt](#w_what-should-firefox-do-with-this-file-prompt)
    *   [3.3 "What should Firefox do with this file?" prompt does not show an application](#w_what-should-firefox-do-with-this-file-prompt-does-not-show-an-application)
*   [4 Resetting download actions for all content types](#w_resetting-download-actions-for-all-content-types)

## File types and download actions

When you click on a link to download a file, the [Media type](https://wikipedia.org/wiki/Media_type), also called the MIME type or [Content type](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Type), as configured by the web server, will determine what action Firefox will take.

Firefox will not be able to properly handle a file if a misconfigured web server sends it with an incorrect content type. For example, Firefox may display the content as plain text instead of opening the file in an application. To learn more, see [Properly configuring server MIME types](https://developer.mozilla.org/docs/Learn/Server-side/Configuring_server_MIME_types) and [Common MIME types](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) at MDN web docs. You can contact the website in such cases, or you can try a Firefox add-on such as [Content-Type Fixer](https://addons.mozilla.org/firefox/addon/content-type-fixer) to work around the problem. (If you use an add-on and need help with it, you should visit the add-on site or contact the add-on developer for support.)

If Firefox does not have a set download action for a type of file, Firefox will save the file by default. If you select in the Downloads panel right-click context menu for the file, ([see below](#w_adding-download-actions)) a new Content Type and Action entry will be added to the panel _Applications_ section of Firefox settings.

**Note:** Firefox treats links to some types of media files, such as .mp3 files, the same way it treats .txt and .html links, by handling them internally. The file will not be downloaded and the Downloads panel will not open. Instead, the file will open and play in Firefox, with a control bar displayed to manage playback (see [Audio and video in Firefox](https://support.mozilla.org/en-US/kb/new?title=Audio+and+video+in+Firefox "Page does not exist.") for details). Firefox only uses _Applications_ settings to determine what action is taken when a file is treated as a download ([see below](#w_changing-download-actions)).

## Changing download actions

You can change what action Firefox takes for defined content types. This will not affect media embedded in a web page – only links to the files themselves.

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  In the panel, go to the _Applications_ section.
3.  Select the _Content Type_ entry for action you want to change. (You might see more than one entry for the same [file format or extension](https://wikipedia.org/wiki/File_format) because some types of files include multiple content types.)
4.  The Action column will give you a drop-down menu, with options on the action to take.
    
    ![Fx77Applications-PDF-Mac](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2020-06-05-12-51-53-04da10.png)![Fx78Applications-PDF](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2020-06-04-15-00-09-0c760b.png)![Fx91Applications-PDF-Win](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-03-04-10-22-58-b6b632.png)
    
    *   **Open in Firefox**: Select this if you want Firefox to display the content. It only applies to a limited number of content types that Firefox is able to decode (PDF, AVIF, XML, SVG, and WebP Image).
    *   **Always ask**: This will show you a prompt asking _What should Firefox do with this file?_ ([see below](#w_what-should-firefox-do-with-this-file-prompt)) so that you can choose the action you want to take. This can be useful if Firefox is automatically saving that type of file or is always opening it with a certain application, and you want to be asked what to do.
    *   **Save File**: This will always save the file to your computer, when you download that type of file. To learn more, see [Where to find and manage downloaded files in Firefox](https://support.mozilla.org/en-US/kb/where-find-and-manage-downloaded-files-firefox).
    *   **Use WindowsmacOSsystem default application**: This will open the file with the default application configured in your operating system. This is only shown for content types that include the _Open in Firefox_ option (PDF, AVIF, XML, SVG, and WebP Image files) and is available when your system has another application set to open that type of file by default.
    *   **Use <_application name_\>**: Open the file or handle the protocol with this application. (Some Content Types, such as mailto, irc and ircs, are [protocols](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/protocol_handlers), not types of files.) Options can include one or more web applications to handle the protocol or an installed application.
    *   **Use other…**: This opens the _Select Helper Application_ dialog, where you can choose the application you wish to use.
    *   **Application Details…**: If web applications, or if installed applications other than the system default are listed, this opens a dialog where you can learn the location of those applications or remove an application as an available option.
5.  Close the page. Any changes you've made will automatically be saved.

## Set Firefox to ask you what to do for files with no defined content type

When you click on a link to download a file and Firefox doesn't have a content type and download action set up for that type of file, Firefox will save the file by default. If you want Firefox to ask you what to do with these downloads, you can go to the bottom of the _Applications_ section under _What should Firefox do with other files?_ and select .

![Fx101settings-Applications-OtherFiles](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-05-04-05-39-45-6cd522.png)

When you choose the setting , you will see a _What should Firefox do with this file?_ prompt ([see below](#w_what-should-firefox-do-with-this-file-prompt)) when you download any file that has no defined content type.

## Adding download actions

When you choose in Firefox settings under _Applications_ (as shown above) and you download a file with no defined content type and action, you will see a _What should Firefox do with this file?_ prompt. When you choose an action and also select the option, **Do this automatically for files like this from now on**, a new Content Type and Action entry will be added to the _Applications_ list for that type of file. See the ["What should Firefox do with this file?" prompt](#w_what-should-firefox-do-with-this-file-prompt) section below, for more information.

When you download a type of file that can be opened with an installed application you can set Firefox to always open similar files as follows:

1.  Right-clickHold down the Control key while you click the downloaded item in the Downloads panel. (You can also do this from the [Library window Downloads history](https://support.mozilla.org/en-US/kb/where-find-and-manage-downloaded-files-firefox#w_see-downloads-history).)
2.  Select from the context menu.
    
    *   This option may be missing in some cases, such as for executable files or files served by the website with an incorrect content type ([see above](#w_file-types-and-download-actions)).
    
    ![Fx98Downloads-FileContextMenu](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-02-23-16-10-39-02aa06.png)
    

## "Always Open Similar Files" option

When you select from the context menu for a downloaded item, the file will open in the system default application and a new Content Type entry will be added to the _Applications_ section of Firefox settings, with the download action set to use that application. The next time you download that type of file and open the context menu, the option will be check marked.

![Fx98AlwaysOpenSimilarFilesCheckmark](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-04-02-03-24-50-081c82.png)

If you clear the check mark, the download action for that Content Type in the _Applications_ section of Firefox settings will be changed to _Save File_. You can later select a different action in Firefox settings ([see above)](#w_changing-download-actions) if you wish, such as to choose a different application, or so that Firefox asks you what to do when you download that type of file.

**Note:** When you open a file in Firefox with an application, the file is also saved to the folder location shown next to in the **Downloads** section under _Files and Applications_ in Firefox settings (see [Where to find and manage downloaded files in Firefox](https://support.mozilla.org/en-US/kb/where-find-and-manage-downloaded-files-firefox) for details). To learn more about how file downloads are handled, see [How file downloads are handled in Firefox](https://support.mozilla.org/en-US/kb/manage-downloads-preferences-using-downloads-menu).

## "What should Firefox do with this file?" prompt

If you change the action for a defined file type to or if you select for other files not listed in the _Applications_ section of Firefox settings ([see above](#w_changing-download-actions)), you will see a _What should Firefox do with this file?_ prompt for those downloaded files.

![Fx98prompt-OpenWithFirefox](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2022-03-28-03-44-58-f555a6.png)

*   **Open with Firefox**: Opens the file in Firefox. This option will only be shown for those content types that include an _Open in Firefox_ option in the _Applications_ section of Firefox settings (PDF, AVIF, XML, SVG, and WebP Image files).
*   **Open with**: Opens the file in the operating system's default application for that file type. (You can also use the drop-down menu to choose another application.)
*   **Save File**: Saves the file to the download folder (specified in your Firefox settings, in the panel _Downloads_ section).
*   **Do this automatically for files like this from now on**: Check mark this option to always take the selected action and then click OK. You may need to restart Firefox for the download action change to take effect.

## "What should Firefox do with this file?" prompt does not show an application

The "What should Firefox do with this file?" prompt may not show a default application for some file types you download, when you have Firefox set to in the _Applications_ section of Firefox settings. You can click the Choose…Browse… button to choose an application installed on your computer to open the file.

![Fx78OpeningPPTfile](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-07-19-17-49-53-78bbf6.png)![Fx90OpeningFileChoose-mac](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-07-20-12-10-12-a14ea8.png)

## Resetting download actions for all content types

If you are having problems with how Firefox is handling file downloads that you can't resolve, or if you just want to start fresh, you can restore the default content types and actions by refreshing Firefox. To learn more, see [Refresh Firefox - reset add-ons and settings](https://support.mozilla.org/en-US/kb/refresh-firefox-reset-add-ons-and-settings).

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Chris Ilias](https://support.mozilla.org/en-US/user/Chris_Ilias/), [Tonnes](https://support.mozilla.org/en-US/user/Tonnes/), [scoobidiver](https://support.mozilla.org/en-US/user/scoobidiver/), [Swarnava Sengupta](https://support.mozilla.org/en-US/user/Swarnava/), [soucet](https://support.mozilla.org/en-US/user/soucet/), [ideato](https://support.mozilla.org/en-US/user/ideato/), [Mozinet](https://support.mozilla.org/en-US/user/Mozinet/), [Kiki](https://support.mozilla.org/en-US/user/kelimuttu/), [Lan](https://support.mozilla.org/en-US/user/upwinxp/), [scootergrisen](https://support.mozilla.org/en-US/user/scootergrisen/), [Joni](https://support.mozilla.org/en-US/user/heyjoni/), [Artist](https://support.mozilla.org/en-US/user/Artist/), [Heather](https://support.mozilla.org/en-US/user/HBloomer/), [Marcelo Ghelman](https://support.mozilla.org/en-US/user/marcelo.ghelman/), [PGGWriter](https://support.mozilla.org/en-US/user/peregrin.hendley/), [Fabi](https://support.mozilla.org/en-US/user/Fabi.L/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**