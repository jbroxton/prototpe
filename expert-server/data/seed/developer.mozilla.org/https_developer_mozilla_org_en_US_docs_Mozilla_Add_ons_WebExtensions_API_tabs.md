# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs

## [Types](#types)

[`tabs.MutedInfoReason`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/MutedInfoReason)

Specifies the reason a tab was muted or unmuted.

[`tabs.MutedInfo`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/MutedInfo)

This object contains a boolean indicating whether the tab is muted, and the reason for the last state change.

[`tabs.PageSettings`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/PageSettings)

Used to control how a tab is rendered as a PDF by the [`tabs.saveAsPDF()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/saveAsPDF) method.

[`tabs.Tab`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab)

This type contains information about a tab.

[`tabs.TabStatus`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/TabStatus)

Indicates whether the tab has finished loading.

[`tabs.WindowType`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/WindowType)

The type of window that hosts this tab.

[`tabs.ZoomSettingsMode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ZoomSettingsMode)

Defines whether zoom changes are handled by the browser, by the extension, or are disabled.

[`tabs.ZoomSettingsScope`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ZoomSettingsScope)

Defines whether zoom changes will persist for the page's origin, or only take effect in this tab.

[`tabs.ZoomSettings`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ZoomSettings)

Defines zoom settings [`mode`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ZoomSettingsMode), [`scope`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ZoomSettingsScope), and default zoom factor.

## [Properties](#properties)

[`tabs.TAB_ID_NONE`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/TAB_ID_NONE)

A special ID value given to tabs that are not browser tabs (for example, tabs in devtools windows).

## [Functions](#functions)

[`tabs.captureTab()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/captureTab)

Creates a data URL encoding an image of the visible area of the given tab.

[`tabs.captureVisibleTab()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/captureVisibleTab)

Creates a data URL encoding an image of the visible area of the currently active tab in the specified window.

[`tabs.connect()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/connect)

Sets up a messaging connection between the extension's background scripts (or other privileged scripts, such as popup scripts or options page scripts) and any [content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) running in the specified tab.

[`tabs.create()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create)

Creates a new tab.

[`tabs.detectLanguage()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/detectLanguage)

Detects the primary language of the content in a tab.

[`tabs.discard()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/discard)

Discards one or more tabs.

[`tabs.duplicate()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/duplicate)

Duplicates a tab.

[`tabs.executeScript()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript) (Manifest V2 only)

Injects JavaScript code into a page.

[`tabs.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/get)

Retrieves details about the specified tab.

[`tabs.getAllInWindow()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/getAllInWindow) Deprecated

Gets details about all tabs in the specified window.

[`tabs.getCurrent()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/getCurrent)

Gets information about the tab that this script is running in, as a [`tabs.Tab`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab) object.

[`tabs.getSelected()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/getSelected) Deprecated

Gets the tab that is selected in the specified window. **Deprecated**: use [`tabs.query({active: true})`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query) instead.

[`tabs.getZoom()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/getZoom)

Gets the current zoom factor of the specified tab.

[`tabs.getZoomSettings()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/getZoomSettings)

Gets the current zoom settings for the specified tab.

[`tabs.goForward()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/goForward)

Go forward to the next page, if one is available.

[`tabs.goBack()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/goBack)

Go back to the previous page, if one is available.

[`tabs.group()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/group)

Adds tabs to a tab group.

[`tabs.hide()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/hide) Experimental

Hides one or more tabs.

[`tabs.highlight()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/highlight)

Highlights one or more tabs.

[`tabs.insertCSS()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/insertCSS) (Manifest V2 only)

Injects CSS into a page.

[`tabs.move()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/move)

Moves one or more tabs to a new position in the same window or to a different window.

[`tabs.moveInSuccession()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/moveInSuccession)

Modifies the succession relationship for a group of tabs.

[`tabs.print()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/print)

Prints the contents of the active tab.

[`tabs.printPreview()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/printPreview)

Opens print preview for the active tab.

[`tabs.query()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query)

Gets all tabs that have the specified properties, or all tabs if no properties are specified.

[`tabs.reload()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/reload)

Reload a tab, optionally bypassing the local web cache.

[`tabs.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/remove)

Closes one or more tabs.

[`tabs.removeCSS()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/removeCSS) (Manifest V2 only)

Removes from a page CSS which was previously injected by calling [`tabs.insertCSS()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/insertCSS).

[`tabs.saveAsPDF()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/saveAsPDF)

Saves the current page as a PDF.

[`tabs.sendMessage()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage)

Sends a single message to the content script(s) in the specified tab.

[`tabs.sendRequest()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendRequest) Deprecated

Sends a single request to the content script(s) in the specified tab. **Deprecated**: use [`tabs.sendMessage()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage) instead.

[`tabs.setZoom()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/setZoom)

Zooms the specified tab.

[`tabs.setZoomSettings()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/setZoomSettings)

Sets the zoom settings for the specified tab.

[`tabs.show()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/show) Experimental

Shows one or more tabs that have been [`hidden`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/hide).

[`tabs.toggleReaderMode()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/toggleReaderMode)

Toggles Reader mode for the specified tab.

[`tabs.ungroup()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/ungroup)

Removes tabs from tab groups.

[`tabs.update()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update)

Navigate the tab to a new URL, or modify other properties of the tab.

[`tabs.warmup()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/warmup)

Prepare the tab to make a potential following switch faster.

## [Events](#events)

[`tabs.onActivated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated)

Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired.

[`tabs.onActiveChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActiveChanged) Deprecated

Fires when the selected tab in a window changes. **Deprecated**: use [`tabs.onActivated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated) instead.

[`tabs.onAttached`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onAttached)

Fired when a tab is attached to a window, for example because it was moved between windows.

[`tabs.onCreated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated)

Fired when a tab is created. Note that the tab's URL may not be set at the time this event fired.

[`tabs.onDetached`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onDetached)

Fired when a tab is detached from a window, for example because it is being moved between windows.

[`tabs.onHighlightChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onHighlightChanged) Deprecated

Fired when the highlighted or selected tabs in a window change. **Deprecated**: use [`tabs.onHighlighted`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onHighlighted) instead.

[`tabs.onHighlighted`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onHighlighted)

Fired when the highlighted or selected tabs in a window change.

[`tabs.onMoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onMoved)

Fired when a tab is moved within a window.

[`tabs.onRemoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved)

Fired when a tab is closed.

[`tabs.onReplaced`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onReplaced)

Fired when a tab is replaced with another tab due to prerendering.

[`tabs.onSelectionChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onSelectionChanged) Deprecated

Fires when the selected tab in a window changes. **Deprecated**: use [`tabs.onActivated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated) instead.

[`tabs.onUpdated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated)

Fired when a tab is updated.

[`tabs.onZoomChange`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onZoomChange)

Fired when a tab is zoomed.

## [Example extensions](#example_extensions)

*   [annotate-page](https://github.com/mdn/webextensions-examples/tree/main/annotate-page)
*   [apply-css](https://github.com/mdn/webextensions-examples/tree/main/apply-css)
*   [beastify](https://github.com/mdn/webextensions-examples/tree/main/beastify)
*   [bookmark-it](https://github.com/mdn/webextensions-examples/tree/main/bookmark-it)
*   [chill-out](https://github.com/mdn/webextensions-examples/tree/main/chill-out)
*   [commands](https://github.com/mdn/webextensions-examples/tree/main/commands)
*   [context-menu-copy-link-with-types](https://github.com/mdn/webextensions-examples/tree/main/context-menu-copy-link-with-types)
*   [contextual-identities](https://github.com/mdn/webextensions-examples/tree/main/contextual-identities)
*   [cookie-bg-picker](https://github.com/mdn/webextensions-examples/tree/main/cookie-bg-picker)
*   [devtools-panels](https://github.com/mdn/webextensions-examples/tree/main/devtools-panels)
*   [find-across-tabs](https://github.com/mdn/webextensions-examples/tree/main/find-across-tabs)
*   [firefox-code-search](https://github.com/mdn/webextensions-examples/tree/main/firefox-code-search)
*   [history-deleter](https://github.com/mdn/webextensions-examples/tree/main/history-deleter)
*   [imagify](https://github.com/mdn/webextensions-examples/tree/main/imagify)
*   [list-cookies](https://github.com/mdn/webextensions-examples/tree/main/list-cookies)
*   [menu-demo](https://github.com/mdn/webextensions-examples/tree/main/menu-demo)
*   [menu-labelled-open](https://github.com/mdn/webextensions-examples/tree/main/menu-labelled-open)
*   [menu-remove-element](https://github.com/mdn/webextensions-examples/tree/main/menu-remove-element)
*   [open-my-page-button](https://github.com/mdn/webextensions-examples/tree/main/open-my-page-button)
*   [permissions](https://github.com/mdn/webextensions-examples/tree/main/permissions)
*   [session-state](https://github.com/mdn/webextensions-examples/tree/main/session-state)
*   [store-collected-images](https://github.com/mdn/webextensions-examples/tree/main/store-collected-images)
*   [tabs-tabs-tabs](https://github.com/mdn/webextensions-examples/tree/main/tabs-tabs-tabs)

## [Browser compatibility](#browser_compatibility)

**Note:** This API is based on Chromium's [`chrome.tabs`](https://developer.chrome.com/docs/extensions/reference/api/tabs) API. This documentation is derived from [`tabs.json`](https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/api/tabs.json) in the Chromium code.