# https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html

This document provides a high level, nontechnical overview of Firefox’s Places component (Bookmarks and History).

More information regarding Bookmarks - [Bookmarks in Firefox](https://support.mozilla.org/en-US/kb/bookmarks-firefox)

There are multiple ways to access and manipulate Bookmarks, such as:

Contents

*   [Nontechnical Overview](#nontechnical-overview)
    
    *   [Firefox menu bar](#firefox-menu-bar)
        
    *   [Main application button](#main-application-button)
        
    *   [Bookmarks Toolbar](#bookmarks-toolbar)
        
    *   [Firefox sidebar](#firefox-sidebar)
        
    *   [The Library window](#the-library-window)
        
    *   [Keyboard shortcuts](#keyboard-shortcuts)
        
    *   [Firefox Context Menu](#firefox-context-menu)
        
    *   [Undo / Redo](#undo-redo)
        
    *   [Import Bookmarks](#import-bookmarks)
        
    *   [Restore Bookmarks](#restore-bookmarks)
        

## [Main application button](#id8)[](#main-application-button "Link to this heading")

[![Image of the main Bookmarks application button](https://firefox-source-docs.mozilla.org/_images/firefox-bookmarks-main-application.png)](https://firefox-source-docs.mozilla.org/_images/firefox-bookmarks-main-application.png)

Firefox - Bookmarks Main Application[](#id2 "Link to this image")

## [Bookmarks Toolbar](#id9)[](#bookmarks-toolbar "Link to this heading")

[![Image of the Bookmarks Toolbar](https://firefox-source-docs.mozilla.org/_images/firefox-bookmarks-toolbar.png)](https://firefox-source-docs.mozilla.org/_images/firefox-bookmarks-toolbar.png)

Firefox - Bookmarks Toolbar[](#id3 "Link to this image")

On the top of your Firefox screen just under the search bar - Bookmarks are on the left side.

Firefox’s toolbar provides easy access to common features:

*   Click the menu button , click More Tools and choose Customize Toolbar.
    
    *   **To turn on the Title bar:** Put a check mark next to Title Bar in the lower left.
        
    *   **To turn on the Bookmarks toolbar:** Click the Toolbars dropdown menu at the bottom of the screen and select Bookmarks Toolbar.
        
*   Click the Done button.
    

## [The Library window](#id11)[](#the-library-window "Link to this heading")

1.  Click the hamburger Menu icon in the upper-right corner of your screen.
    
2.  In the middle of the drop-down menu select Library.
    
3.  In the Library menu select Bookmarks.
    
4.  Press Show All Bookmark button.
    

## [Keyboard shortcuts](#id12)[](#keyboard-shortcuts "Link to this heading")

> *   Show / Manage Bookmarks (Library Window) - Shift + Ctrl / Cmd + O
>     
> *   Add / Edit Bookmark - Ctrl / Cmd + D
>     
> *   Bookmark all tabs into 1 bookmark folder - Shift + Ctrl / Cmd + D
>     
> *   Delete bookmark / Bookmarks / Bookmarks folder - Delete
>     
> *   Show / Hide the Bookmarks toolbar - Shift + Ctrl / Cmd + B
>     
> *   Focus Next Bookmark/Folder whose name (or sorted property) starts with a given character or character sequence - Type the character or quickly type the character sequence - in Bookmarks Library, Bookmarks Toolbar, Bookmarks Menu, Bookmarks Sidebar
>     

## [Undo / Redo](#id14)[](#undo-redo "Link to this heading")

Undo / Redo options available In Library Window and Sidebar Panel. You can reverse your commands (creating bookmark, deleting bookmark, copy/paste etc.) with:

> *   Keyboard combinations:
>     
>     *   Undo - Ctrl / Cmd + Z
>         
>     *   Redo - Shift + Ctrl / Cmd + Z
>         
> *   Choosing option in Menu - Edit - Undo / Redo
>     

[![Image of the Undo/Redo options for Bookmark](https://firefox-source-docs.mozilla.org/_images/bookmark-undo-redo.png)](https://firefox-source-docs.mozilla.org/_images/bookmark-undo-redo.png)

Firefox - Undo / Redo for bookmark[](#id5 "Link to this image")

## [Import Bookmarks](#id15)[](#import-bookmarks "Link to this heading")

There are various options to import bookmarks to Firefox. Some of them are:

> *   [from Internet Explorer or Microsoft Edge](https://support.mozilla.org/en-US/kb/import-bookmarks-internet-explorer-or-microsoft-edge)
>     
> *   [from Google Chrome](https://support.mozilla.org/en-US/kb/import-bookmarks-google-chrome)
>     
> *   [from an HTML file](https://support.mozilla.org/en-US/kb/import-bookmarks-html-file)
>     

## [Restore Bookmarks](#id16)[](#restore-bookmarks "Link to this heading")

Firefox automatically creates backups of your bookmarks and saves the last 15 backups for safekeeping.

**To restore your bookmarks:**

1.  Click on _hamburger menu_ button to open the Menu panel.
    
2.  Go to _Bookmarks_ - _Manage Bookmarks_.
    
3.  Select the backup from which you want to restore:
    
    > 1.  The dated entries are automatic bookmark backups.
    >     
    > 2.  From a manual backup ( _Choose file…_ ).
    >     
    
4.  After selecting the option and confirming your choice your bookmarks would be restored.
    

**For manually add backup:**

1.  Click on _hamburger menu_ button to open the Menu panel.
    
2.  Go to _Bookmarks_ - _Manage Bookmarks_.
    
3.  In the _Library window_, click the button and then select _Backup…_.
    
4.  In the Bookmarks backup filename window that opens, choose a location to save the file, which is named `bookmarks-date.json` by default. The desktop is usually a good spot, but any place that is easy to remember will work.
    
5.  Save the bookmarks json file. The Bookmarks backup filename window will close and then you can close the _Library_ window.