# https://firefox-source-docs.mozilla.org/browser/places/index.html

This document describes the implementation of the Firefox Places component.

It is a robust system to manage History and Bookmarks through a database on the backend side and a model-view-controller system that connects frontend UI user manipulation.

## History and Bookmarks[](#history-and-bookmarks "Link to this heading")

In Firefox 2, History and Bookmarks used to be kept into separate databases in the Resource Description Framework format ([RDF format](https://en.wikipedia.org/wiki/Resource_Description_Framework)).

However, Firefox 3 implemented the Places system. It has been done due to multiple reasons, such as:

> *   **Performance**: certain search or maintenance operations were very slow
>     
> *   **Reliability**: the filesystem facing side of RDF was not so robust, often causing corruption or unexpected states
>     
> *   **Flexibility**: being able to cross data allows for interesting features, like the Awesome Bar
>     
> *   **Maintainability**: the future of RDF was unclear, while SQLite is actively maintained and used by a large number of applications
>     

## Where to Start[](#where-to-start "Link to this heading")

For the high-level, non-technical summary of how History and Bookmarks works, read [Nontechnical Overview](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html). For more specific, technical details of implementation, read [Architecture Overview](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html).

## Governance[](#governance "Link to this heading")

See [Bookmarks & History (Places)](https://firefox-source-docs.mozilla.org/mots/index.html#bookmarks-history)

## Table of Contents[](#table-of-contents "Link to this heading")

*   [Nontechnical Overview](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html)
    *   [Firefox menu bar](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#firefox-menu-bar)
    *   [Main application button](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#main-application-button)
    *   [Bookmarks Toolbar](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#bookmarks-toolbar)
    *   [Firefox sidebar](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#firefox-sidebar)
    *   [The Library window](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#the-library-window)
    *   [Keyboard shortcuts](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#keyboard-shortcuts)
    *   [Firefox Context Menu](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#firefox-context-menu)
    *   [Undo / Redo](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#undo-redo)
    *   [Import Bookmarks](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#import-bookmarks)
    *   [Restore Bookmarks](https://firefox-source-docs.mozilla.org/browser/places/nontechnical-overview.html#restore-bookmarks)
*   [Architecture Overview](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html)
    *   [Codebase](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html#codebase)
    *   [Frontend](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html#frontend)
    *   [Backend](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html#backend)
    *   [Storage](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html#storage)
    *   [Synchronization](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html#synchronization)