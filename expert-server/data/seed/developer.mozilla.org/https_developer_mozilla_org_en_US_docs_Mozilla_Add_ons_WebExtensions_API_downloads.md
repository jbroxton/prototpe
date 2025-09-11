# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads

## [Types](#types)

[`downloads.FilenameConflictAction`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/FilenameConflictAction)

Defines options for what to do if the name of a downloaded file conflicts with an existing file.

[`downloads.InterruptReason`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/InterruptReason)

Defines a set of possible reasons why a download was interrupted.

[`downloads.DangerType`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DangerType)

Defines a set of common warnings of possible dangers associated with downloadable files.

[`downloads.State`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/State)

Defines different states that a current download can be in.

[`downloads.DownloadItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadItem)

Represents a downloaded file.

[`downloads.StringDelta`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/StringDelta)

Represents the difference between two strings.

[`downloads.DoubleDelta`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DoubleDelta)

Represents the difference between two doubles.

[`downloads.BooleanDelta`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/BooleanDelta)

Represents the difference between two booleans.

[`downloads.DownloadTime`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadTime)

Represents the time a download took to complete.

[`downloads.DownloadQuery`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadQuery)

Defines a set of parameters that can be used to search the downloads manager for a specific set of downloads.

## [Functions](#functions)

[`downloads.download()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download)

Downloads a file, given its URL and other optional preferences.

[`downloads.search()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/search)

Queries the [`DownloadItems`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadItem) available in the browser's downloads manager, and returns those that match the specified search criteria.

[`downloads.pause()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/pause)

Pauses a download.

[`downloads.resume()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/resume)

Resumes a paused download.

[`downloads.cancel()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/cancel)

Cancels a download.

[`downloads.getFileIcon()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/getFileIcon)

Retrieves an icon for the specified download.

[`downloads.open()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/open)

Opens the downloaded file with its associated application.

[`downloads.show()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/show)

Opens the platform's file manager application to show the downloaded file in its containing folder.

[`downloads.showDefaultFolder()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/showDefaultFolder)

Opens the platform's file manager application to show the default downloads folder.

[`downloads.erase()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/erase)

Erases matching [`DownloadItems`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadItem) from the browser's download history, without deleting the downloaded files from disk.

[`downloads.removeFile()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/removeFile)

Removes a downloaded file from disk, but not from the browser's download history.

[`downloads.acceptDanger()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/acceptDanger)

Prompts the user to accept or cancel a dangerous download.

[`downloads.setShelfEnabled()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/setShelfEnabled)

Enables or disables the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it.

## [Events](#events)

[`downloads.onCreated`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onCreated)

Fires with the [`DownloadItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadItem) object when a download begins.

[`downloads.onErased`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onErased)

Fires with the `downloadId` when a download is erased from history.

[`downloads.onChanged`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/onChanged)

When any of a [`DownloadItem`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/DownloadItem)'s properties except `bytesReceived` changes, this event fires with the `downloadId` and an object containing the properties that changed.

## [Example extensions](#example_extensions)

*   [latest-download](https://github.com/mdn/webextensions-examples/tree/main/latest-download)

## [Browser compatibility](#browser_compatibility)