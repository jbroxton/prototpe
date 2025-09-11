# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks

## [Types](#types)

[`bookmarks.BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode)

Represents a bookmark or folder in the bookmarks tree.

[`bookmarks.BookmarkTreeNodeType`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNodeType)

A [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) enum which describes whether a node in the tree is a bookmark, a folder, or a separator.

[`bookmarks.BookmarkTreeNodeUnmodifiable`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNodeUnmodifiable)

A [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) enum which specifies why a bookmark or folder is unmodifiable.

[`bookmarks.CreateDetails`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/CreateDetails)

Contains information which is passed to the [`bookmarks.create()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/create) function when creating a new bookmark.

## [Functions](#functions)

[`bookmarks.create()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/create)

Creates a bookmark or folder.

[`bookmarks.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/get)

Retrieves one or more [`BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode)s, given a bookmark's ID or an array of bookmark IDs.

[`bookmarks.getChildren()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/getChildren)

Retrieves the children of the specified [`BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode).

[`bookmarks.getRecent()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/getRecent)

Retrieves a requested number of recently added bookmarks.

[`bookmarks.getSubTree()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/getSubTree)

Retrieves part of the bookmarks tree, starting at the specified node.

[`bookmarks.getTree()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/getTree)

Retrieves the entire bookmarks tree into an array of [`BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode) objects.

[`bookmarks.move()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/move)

Moves the specified [`BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode) to a new location in the bookmark tree.

[`bookmarks.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/remove)

Removes a bookmark or an empty bookmark folder, given the node's ID.

[`bookmarks.removeTree()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/removeTree)

Recursively removes a bookmark folder; that is, given the ID of a folder node, removes that node and all its descendants.

[`bookmarks.search()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/search)

Searches for [`BookmarkTreeNode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode)s matching a specified set of criteria.

[`bookmarks.update()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/update)

Updates the title and/or URL of a bookmark, or the name of a bookmark folder, given the bookmark's ID.

## [Events](#events)

[`bookmarks.onCreated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onCreated)

Fired when a bookmark or folder is created.

[`bookmarks.onRemoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onRemoved)

Fired when a bookmark or folder is removed. When a folder is removed recursively, a single notification is fired for the folder, and none for its contents.

[`bookmarks.onChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onChanged)

Fired when a bookmark or folder changes. Currently, only `title` and `url` changes trigger this.

[`bookmarks.onMoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onMoved)

Fired when a bookmark or folder is moved to a different parent folder or to a new offset within its folder.

[`bookmarks.onChildrenReordered`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onChildrenReordered)

Fired when the user has sorted the children of a folder in the browser's UI. This is not called as a result of a [`move()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/move).

[`bookmarks.onImportBegan`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onImportBegan)

Fired when a bookmark import session is begun. Expensive observers should ignore [`bookmarks.onCreated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onCreated) updates until [`bookmarks.onImportEnded`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onImportEnded) is fired. Observers should still handle other notifications immediately.

[`bookmarks.onImportEnded`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/onImportEnded)

Fired when a bookmark import session has finished.

## [Example extensions](#example_extensions)

*   [bookmark-it](https://github.com/mdn/webextensions-examples/tree/main/bookmark-it)

## [Browser compatibility](#browser_compatibility)

**Note:** This API is based on Chromium's [`chrome.bookmarks`](https://developer.chrome.com/docs/extensions/reference/api/bookmarks) API. This documentation is derived from [`bookmarks.json`](https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/api/bookmarks.json) in the Chromium code.