# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API

## [Browser API differences](#browser_api_differences)

Note that this is different from Google Chrome's extension system, which uses the `chrome` namespace instead of `browser`, and which uses callbacks instead of promises for asynchronous functions in Manifest V2. As a porting aid, the Firefox implementation of WebExtensions APIs supports `chrome` and callbacks as well as `browser` and promises. Mozilla has also written a polyfill which enables code that uses `browser` and promises to work unchanged in Chrome: [https://github.com/mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill).

Firefox also implements these APIs under the `chrome` namespace using callbacks. This allows code written for Chrome to run largely unchanged in Firefox for the APIs documented here.

Not all browsers support all the APIs: for the details, see [Browser support for JavaScript APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs) and [Chrome incompatibilities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities).

## [Examples](#examples)

Throughout the JavaScript API listings, short code examples illustrate how the API is used. You can experiment with most of these examples using the console in the [Toolbox](https://extensionworkshop.com/documentation/develop/debugging/#developer-tools-toolbox). However, you need Toolbox running in the context of a web extension. To do this, open `about:debugging` then **This Firefox**, click **Inspect** against any installed or temporary extension, and open **Console**. You can then paste and run the example code in the console.

For example, here is the first code example on this page running in the Toolbox console in Firefox Developer Edition:

![Illustration of a snippet of web extension code run from the console in the Toolbox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/javascript_exercised_in_console.jpg)

## [JavaScript API listing](#javascript_api_listing)

See below for a complete list of JavaScript APIs:

[action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/action)

Read and modify attributes of and listen to clicks on the browser toolbar button defined with the [`action`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action) manifest key.

[alarms](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/alarms)

Schedule code to run at a specific time in the future. This is like `Window.setTimeout()` and `Window.setInterval()`, except that those functions don't work with background pages that are loaded on demand.

[bookmarks](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks)

The [WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) `bookmarks` API lets an extension interact with and manipulate the browser's bookmarking system. You can use it to bookmark pages, retrieve existing bookmarks, and edit, remove, and organize bookmarks.

[browserAction](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction)

Read and modify attributes of and listen to clicks on the browser toolbar button defined with the [`browser_action`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_action) manifest key.

[browserSettings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserSettings)

Enables an extension to modify certain global browser settings. Each property of this API is a `types.BrowserSetting` object, providing the ability to modify a particular setting.

[browsingData](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData)

Enables extensions to clear the data that is accumulated while the user is browsing.

[captivePortal](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/captivePortal)

Determine the captive portal state of the user's connection. A captive portal is a web page displayed when a user first connects to a Wi-Fi network. The user provides information or acts on the captive portal web page to gain broader access to network resources, such as accepting terms and conditions or making a payment.

[clipboard](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/clipboard)

The WebExtension `clipboard` API (which is different from the [standard Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)) enables an extension to copy items to the system clipboard. Currently the WebExtension `clipboard` API only supports copying images, but it's intended to support copying text and HTML in the future.

[commands](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands)

Listens for the user executing commands registered using the [`commands` manifest.json key](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands).

[contentScripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts)

Use this API to register content scripts. Registering a content script instructs the browser to insert the given content scripts into pages that match the given URL patterns.

[contextualIdentities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities)

Work with contextual identities: list, create, remove, and update contextual identities.

[cookies](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies)

Enables extensions to get, set, and remove cookies, and be notified when they change.

[declarativeNetRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest)

This API enables extensions to specify conditions and actions that describe how network requests should be handled. These declarative rules enable the browser to evaluate and modify network requests without notifying extensions about individual network requests.

[devtools](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools)

Enables extensions to interact with the browser's Developer Tools. You use this API to create Developer Tools pages, interact with the window that is being inspected, inspect the page network usage.

[dns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dns)

Enables an extension to resolve domain names.

[dom](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dom)

Access special extension only DOM features.

[downloads](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads)

Enables extensions to interact with the browser's download manager. You can use this API module to download files, cancel, pause, resume downloads, and show downloaded files in the file manager.

[events](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/events)

Common types used by APIs that dispatch events.

[extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension)

Utilities related to your extension. Get URLs to resources packages with your extension. Get the [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) object for your extension's pages. Get the values for various settings.

[extensionTypes](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extensionTypes)

Some common types used in other WebExtension APIs.

[find](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/find)

Finds text in a web page, and highlights matches.

[history](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history)

Use the `history` API to interact with the browser history.

[i18n](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n)

Functions to internationalize your extension. You can use these APIs to get localized strings from locale files packaged with your extension, find out the browser's current language, and find out the value of its [Accept-Language header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation#the_accept-language_header).

[identity](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity)

Use the identity API to get an [OAuth2](https://oauth.net/2/) authorization code or access token, which an extension can then use to access user data from a service that supports OAuth2 access (such as Google or Facebook).

[idle](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/idle)

Find out when the user's system is idle, locked, or active.

[management](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/management)

Get information about installed add-ons.

[menus](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus)

Add items to the browser's menu system.

[notifications](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications)

Display notifications to the user, using the underlying operating system's notification mechanism. Because this API uses the operating system's notification mechanism, the details of how notifications appear and behave may differ according to the operating system and the user's settings.

[omnibox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/omnibox)

Enables extensions to implement customized behavior when the user types into the browser's address bar.

[pageAction](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction)

Read and modify attributes of and listen to clicks on the address bar button defined with the [`page_action`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/page_action) manifest key.

[permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions)

Enables extensions to request extra permissions at runtime, after they have been installed.

[pkcs11](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pkcs11)

The `pkcs11` API enables an extension to enumerate [PKCS #11](https://en.wikipedia.org/wiki/PKCS_11) security modules and to make them accessible to the browser as sources of keys and certificates.

[privacy](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/privacy)

Access and modify various privacy-related browser settings.

[proxy](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy)

Use the proxy API to proxy web requests. You can use the `proxy.onRequest` event listener to intercept web requests, and return an object that describes whether and how to proxy them.

[runtime](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime)

This module provides information about your extension and the environment it's running in.

[scripting](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting)

Inserts JavaScript and CSS into websites. This API offers two approaches to inserting content:

[search](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/search)

Use the search API to retrieve the installed search engines and execute searches.

[sessions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sessions)

Use the sessions API to list, and restore, tabs and windows that have been closed while the browser has been running.

[sidebarAction](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sidebarAction)

Gets and sets properties of an extension's sidebar.

[storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)

Enables extensions to store and retrieve data, and listen for changes to stored items.

[tabGroups](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabGroups)

This API enables extensions to modify and rearrange [tab groups](https://support.mozilla.org/en-US/kb/tab-groups).

[tabs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs)

Interact with the browser's tab system.

[theme](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/theme)

Enables browser extensions to get details of the browser's theme and update the theme.

[topSites](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/topSites)

Use the topSites API to get an array containing pages that the user has visited frequently.

[types](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/types)

Defines the `BrowserSetting` type, which is used to represent a browser setting.

[userScripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/userScripts)

Use this API to register user scripts, third-party scripts designed to manipulate webpages or provide new features. Registering a user script instructs the browser to attach the script to pages that match the URL patterns specified during registration.

[userScripts (Legacy)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/userScripts_legacy)

**Warning:** This is documentation for the legacy `userScripts` API. It's available in Firefox for Manifest V2. For functionality to work with user scripts in Manifest V3 see the new `userScripts` API.

[webNavigation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation)

Add event listeners for the various stages of a navigation. A navigation consists of a frame in the browser transitioning from one URL to another, usually (but not always) in response to a user action like clicking a link or entering a URL in the location bar.

[webRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest)

Add event listeners for the various stages of making an HTTP request, which includes websocket requests on `ws://` and `wss://`. The event listener receives detailed information about the request and can modify or cancel the request.

[windows](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows)

Interact with browser windows. You can use this API to get information about open windows and to open, modify, and close windows. You can also listen for window open, close, and activate events.