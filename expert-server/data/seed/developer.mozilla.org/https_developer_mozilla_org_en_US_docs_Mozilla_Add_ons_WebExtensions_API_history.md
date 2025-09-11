# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history

## [Types](#types)

[`history.TransitionType`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/TransitionType)

Describes how the browser navigated to a particular page.

[`history.HistoryItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/HistoryItem)

Provides information about a particular page in the browser history.

[`history.VisitItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/VisitItem)

Describes a single visit to a page.

## [Functions](#functions)

[`history.search()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/search)

Searches the browser history for [`history.HistoryItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/HistoryItem) objects matching the given criteria.

[`history.getVisits()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/getVisits)

Retrieves information about visits to a given page.

[`history.addUrl()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/addUrl)

Adds a record to the browser history of a visit to the given page.

[`history.deleteUrl()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/deleteUrl)

Removes all visits to the given URL from the browser history.

[`history.deleteRange()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/deleteRange)

Removes all visits to pages that the user made during the given time range.

[`history.deleteAll()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/deleteAll)

Removes all visits from the browser history.

## [Events](#events)

[`history.onTitleChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/onTitleChanged)

Fired when the title of a page visited by the user is recorded.

[`history.onVisited`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/onVisited)

Fired each time the user visits a page, providing the [`history.HistoryItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/HistoryItem) data for that page.

[`history.onVisitRemoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/onVisitRemoved)

Fired when a URL is removed completely from the browser history.

## [Example extensions](#example_extensions)

*   [history-deleter](https://github.com/mdn/webextensions-examples/tree/main/history-deleter)

## [Browser compatibility](#browser_compatibility)

**Note:** This API is based on Chromium's [`chrome.history`](https://developer.chrome.com/docs/extensions/reference/api/history) API. This documentation is derived from [`history.json`](https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/api/history.json) in the Chromium code.