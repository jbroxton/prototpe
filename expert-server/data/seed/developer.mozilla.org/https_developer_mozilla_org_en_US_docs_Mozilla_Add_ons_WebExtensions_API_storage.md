# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage

## [Types](#types)

[`storage.StorageArea`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea)

An object representing a storage area.

[`storage.StorageChange`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageChange)

An object representing a change to a storage area.

## [Properties](#properties)

`storage` has four properties, which represent the different types of available storage area.

[`storage.local`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local)

Represents the `local` storage area. Items in `local` storage are local to the machine the extension was installed on.

[`storage.managed`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/managed)

Represents the `managed` storage area. Items in `managed` storage are set by the domain administrator and are read-only for the extension. Trying to modify this namespace results in an error.

[`storage.session`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session)

Represents the `session` storage area. Items in `session` storage are stored in memory and are not persisted to disk.

[`storage.sync`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync)

Represents the `sync` storage area. Items in `sync` storage are synced by the browser, and are available across all instances of that browser that the user is logged into, across different devices.

## [Events](#events)

[`storage.onChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged)

Fired when one or more items change in any of the storage areas.

## [Example extensions](#example_extensions)

*   [annotate-page](https://github.com/mdn/webextensions-examples/tree/main/annotate-page)
*   [favourite-colour](https://github.com/mdn/webextensions-examples/tree/main/favourite-colour)
*   [forget-it](https://github.com/mdn/webextensions-examples/tree/main/forget-it)
*   [navigation-stats](https://github.com/mdn/webextensions-examples/tree/main/navigation-stats)
*   [proxy-blocker](https://github.com/mdn/webextensions-examples/tree/main/proxy-blocker)
*   [quicknote](https://github.com/mdn/webextensions-examples/tree/main/quicknote)
*   [stored-credentials](https://github.com/mdn/webextensions-examples/tree/main/stored-credentials)
*   [userScripts-mv3](https://github.com/mdn/webextensions-examples/tree/main/userScripts-mv3)

## [Browser compatibility](#browser_compatibility)

**Note:** This API is based on Chromium's [`chrome.storage`](https://developer.chrome.com/docs/extensions/reference/api/storage) API. This documentation is derived from [`storage.json`](https://chromium.googlesource.com/chromium/src/+/master/extensions/common/api/storage.json) in the Chromium code.