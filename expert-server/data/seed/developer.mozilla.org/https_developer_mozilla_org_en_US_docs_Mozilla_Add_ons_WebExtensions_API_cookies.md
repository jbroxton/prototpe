# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies

## [Permissions](#permissions)

For an extension to use this API, it must specify the `"cookies"` [API permission](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#api_permissions) in its [manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) file and [host permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#host_permissions) for any sites whose cookies it wants to access. The extension can get, set, or remove any cookies that can be read, written, or deleted by a URL matching the host permissions. For example:

[`http://*.example.com/`](#http.example.com)

An extension with this host permission can:

*   Read a non-secure cookie for `www.example.com` with any path.
*   Write a secure or non-secure cookie for `www.example.com` with any path.

It can _not_:

*   Read a secure cookie for `www.example.com`.

[`http://www.example.com/`](#httpwww.example.com)

An extension with this host permission can:

*   Read a non-secure cookie for `www.example.com` with any path.
*   Read a non-secure cookie for `.example.com` with any path.
*   Write a secure or non-secure cookie for `www.example.com` with any path.
*   Write a secure or non-secure cookie for `.example.com` with any path.

It can _not_:

*   Read or write a cookie for `foo.example.com`.
*   Read or write a cookie for `foo.www.example.com`.

[`*://*.example.com/`](#.example.com)

An extension with this host permission can:

*   Read or write a secure or non-secure cookie for `www.example.com` with any path.

## [Tracking protection](#tracking_protection)

Trackers use third-party cookies, that is, cookies set by a website other than the one you are on, to identify the websites you visit. For example:

1.  You visit `a-shopping-site.com`, which uses `ad-tracker.com` to deliver its adverts on the web. `ad-tracker.com` sets a cookie associated with the `ad-tracker.com` domain. While you are on `a-shopping-site.com`, `ad-tracker.com` receives information about the products you browse.
2.  You now visit `a-news-site.com` that uses `ad-tracker.com` to deliver adverts. `ad-tracker.com` read its cookie and use the information collected from `a-shopping-site.com` to decide which adverts to display to you.

Firefox includes two features to prevent tracking: [dynamic partitioning](#storage_partitioning) and [first-party isolation](#first-party_isolation). These features separate cookies so that trackers cannot make an association between websites visited. So, in the preceding example, `ad-tracker.com` cannot see the cookie created on `a-news-site.com` when visiting `a-shopping-site.com`.

From Firefox 103, dynamic partitioning is the default feature used. However, if the user or an extension turns on first-party isolation, it takes precedence over dynamic partitioning.

**Note:** When private browsing uses dynamic partitioning, normal browsing may not be partitioning cookies. See [Status of partitioning in Firefox](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning#status_of_partitioning_in_firefox), for details.

### [Storage partitioning](#storage_partitioning)

When using [dynamic partitioning](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning#dynamic_partitioning), Firefox partitions the storage accessible to JavaScript APIs by top-level site while providing appropriate access to unpartitioned storage to enable common use cases. This feature is being rolled out progressively. See [Status of partitioning in Firefox](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning#status_of_partitioning_in_firefox), for implementation details.

Storage partitions are keyed by the schemeful URL of the top-level [website](https://developer.mozilla.org/en-US/docs/Glossary/Site) and, when dynamic partitioning is active, the key value is available through the `partitionKey.topLevelSite` property in the cookies API, for example, `partitionKey: {topLevelSite: "http://site"}`.

Generally, top-level documents are in unpartitioned storage, while third-party iframes are in partitioned storage. If a partition key cannot be determined, the default (unpartitioned storage) is used. For example, while all HTTP(S) sites can be used as a partition key, `moz-extension:-` URLs cannot. Therefore, iframes in Firefox's extension documents do not use partitioned storage.

By default, [`cookies.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/get), [`cookies.getAll()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAll), [`cookies.set()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/set), and [`cookies.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/remove) work with cookies in unpartitioned storage. To work with cookies in partitioned storage in these APIs, `topLevelSite` in `partitionKey` must be set. The exception is `getAll`, where setting `partitionKey` without `topLevelSite` returns cookies in partitioned and unpartitioned storage. [`cookies.onChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged) fires for any cookie that the extension can access, including cookies in partitioned storage. To ensure that the correct cookie is modified, extensions should read the `cookie.partitionKey` property from the event and pass its value to [`cookies.set()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/set) and [`cookies.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/remove).

### [First-party isolation](#first-party_isolation)

When first-party isolation is on, cookies are qualified by the domain of the original page the user visited (essentially, the domain shown to the user in the URL bar, also known as the "first-party domain").

First-party isolation can be enabled by the user by adjusting the browser's configuration and set by extensions using the [`firstPartyIsolate`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/privacy/websites) setting in the [`privacy`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/privacy) API. Note that first-party isolation is enabled by default in [Tor Browser](https://www.torproject.org/).

The `cookies` API represents the first-party domain using the `firstPartyDomain` attribute. All cookies set while first-party isolation is on have this attribute set to the domain of the original page. In the preceding example, this is `a-shopping-site.com` for one cookie and `a-news-site.com` for the other. When first-party isolation is off, all cookies set by websites have this property set to an empty string.

The [`cookies.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/get), [`cookies.getAll()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAll), [`cookies.set()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/set) and [`cookies.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/remove) APIs all accept a `firstPartyDomain` option.

When first-party isolation is on, you must provide this option or the API call fails and returns a rejected promise. For `get()`, `set()`, and `remove()` you must pass a string value. For `getAll()`, you may also pass `null` here, and this gets all cookies, whether or not they have a non-empty value for `firstPartyDomain`.

When first-party isolation is off, the `firstPartyDomain` parameter is optional and defaults to an empty string. A non-empty string can be used to retrieve or modify first-party isolation cookies. Likewise, passing `null` as `firstPartyDomain` to `getAll()` returns all cookies.

## [Types](#types)

[`cookies.Cookie`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/Cookie)

Represents information about an HTTP cookie.

[`cookies.CookieStore`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/CookieStore)

Represents a cookie store in the browser.

[`cookies.OnChangedCause`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/OnChangedCause)

Represents the reason a cookie changed.

[`cookies.SameSiteStatus`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/SameSiteStatus)

Represents the same-site status of the cookie.

## [Methods](#methods)

[`cookies.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/get)

Retrieves information about a single cookie.

[`cookies.getAll()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAll)

Retrieves all cookies that match a given set of filters.

[`cookies.set()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/set)

Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.

[`cookies.remove()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/remove)

Deletes a cookie by name.

[`cookies.getAllCookieStores()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAllCookieStores)

Lists all existing cookie stores.

## [Event handlers](#event_handlers)

[`cookies.onChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged)

Fired when a cookie is set or removed.

## [Example extensions](#example_extensions)

*   [cookie-bg-picker](https://github.com/mdn/webextensions-examples/tree/main/cookie-bg-picker)
*   [list-cookies](https://github.com/mdn/webextensions-examples/tree/main/list-cookies)

## [Browser compatibility](#browser_compatibility)

**Note:** This API is based on Chromium's [`chrome.cookies`](https://developer.chrome.com/docs/extensions/reference/api/cookies) API. This documentation is derived from [`cookies.json`](https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/api/cookies.json) in the Chromium code.