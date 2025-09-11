# https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/132

## [Changes for web developers](#changes_for_web_developers)

### [HTML](#html)

No notable changes

### [CSS](#css)

*   The [`text-emphasis-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-position) property now supports the `auto` value to bring it inline with [`text-underline-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-position) ([Firefox bug 1919658](https://bugzil.la/1919658)).
*   CSS now supports the [Nested declaration rule](https://developer.mozilla.org/en-US/docs/Web/API/CSSNestedDeclarations), which means that nested CSS is now parsed in the correct order ([Firefox bug 1918408](https://bugzil.la/1918408)).

#### Removals

*   The [`-moz-user-modify`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-modify) CSS property has been removed. This property has been deprecated in favor of the [`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/contenteditable) global attribute. ([Firefox bug 1920118](https://bugzil.la/1920118)).

### [JavaScript](#javascript)

*   The [`(?ims-ims:...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Modifier) regular expression modifiers allow you to make changes to only take effect in a specific part of a regex pattern. ([Firefox bug 1913752](https://bugzil.la/1913752) & [Firefox bug 1899813](https://bugzil.la/1899813)).

### [HTTP](#http)

*   The [default/document value](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation/List_of_default_Accept_values#default_values) of the HTTP [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) header was changed to `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`. This removes image MIME types that sometimes caused compatibility issues, and aligns with the fetch specification and Safari. ([Firefox bug 1917177](https://bugzil.la/1917177)).

#### Removals

*   HTTP/2 Server Push is deactivated by default with the preference `network.http.http2.allow-push` now set to `false`. This feature is no longer supported by any other major browser, and the implementation may be completely removed in a future release. ([Firefox bug 1915848](https://bugzil.la/1915848)).

### [Privacy](#privacy)

*   All [third-party cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies) are now blocked in [Strict Enhanced Tracking Protection](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop#w_strict-enhanced-tracking-protection). ([Firefox bug 1918037](https://bugzil.la/1918037)).

### [APIs](#apis)

*   The [`drawingBufferColorSpace`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawingBufferColorSpace "drawingBufferColorSpace") and [`unpackColorSpace`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/unpackColorSpace "unpackColorSpace") properties of the [`WebGLRenderingContext`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) and [`WebGL2RenderingContext`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) interfaces are now supported. These specify the color space of the WebGL drawing buffer, and the color space to convert to when importing textures, respectively. ([Firefox bug 1885491](https://bugzil.la/1885491), [Firefox bug 1885446](https://bugzil.la/1885446)).
*   The [`Notification.silent`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/silent) property is now supported, which controls whether system notifications should be silent. When `silent: true` is specified in the [`Notification()`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification "Notification()") constructor, the resulting system notification is issued without accompanying sounds or vibrations, regardless of device settings ([Firefox bug 1809028](https://bugzil.la/1809028)).
*   The `fetchpriority` attribute of the [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link), [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script), and [`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img) elements, the `fetchPriority` property of the [`HTMLLinkElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement), [`HTMLScriptElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement), and [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement) interfaces, the [`options.priority`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#priority) parameter passed to the [`Request()` constructor](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), and the `fetchpriority` directive in the HTTP [`Link`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link) header, are now supported. These allow developers to provide a hint about the relative priority for fetching a particular resource compared to other resources of the same type, and can be used alongside other ways of setting the priority, such as preloading. ([Firefox bug 1854077](https://bugzil.la/1854077)).
*   The [`CSSNestedDeclarations`](https://developer.mozilla.org/en-US/docs/Web/API/CSSNestedDeclarations) interface and associated [`CSSNestedDeclarations.style`](https://developer.mozilla.org/en-US/docs/Web/API/CSSNestedDeclarations/style) property are now supported ([Firefox bug 1918408](https://bugzil.la/1918408)).
*   The `microphone` and `camera` [permissions](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) can now be used in the [`Permissions.query()`](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query) method to test whether access to the corresponding hardware has been granted, denied, or still requires user approval. ([Firefox bug 1609427](https://bugzil.la/1609427) and [Firefox bug 1915222](https://bugzil.la/1915222)).

#### Media, WebRTC, and Web Audio

*   The [`requestVideoFrameCallback()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback "requestVideoFrameCallback()") and [`cancelVideoFrameCallback()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/cancelVideoFrameCallback "cancelVideoFrameCallback()") methods of the [`HTMLVideoElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) interface are now supported. The `requestVideoFrameCallback()` registers a callback function that runs when a new video frame is sent to the compositor. Developers can use this function to perform operations on each video frame, enabling more efficient painting to a canvas, video analysis, synchronization with external audio sources, and so on. The method returns a callback handle that can be passed to `cancelVideoFrameCallback()` in order to cancel the outstanding callback request. ([Firefox bug 1919367](https://bugzil.la/1919367), [Firefox bug 1800882](https://bugzil.la/1800882)).
*   The [`MediaStreamTrack.getCapabilities()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities) method is now supported. This returns an object detailing the accepted values or value range for each constrainable property of the associated [`MediaStreamTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) ([Firefox bug 1179084](https://bugzil.la/1179084)).

### [WebDriver conformance (WebDriver BiDi, Marionette)](#webdriver_conformance_webdriver_bidi_marionette)

#### WebDriver BiDi

*   Implemented several improvements to make WebDriver BiDi commands more reliable when used during navigation or with newly created tabs. Previously commands such as `browsingContext.setViewport` were likely to fail due to an `AbortError`, they will now be retried a few times to avoid such issues. ([Firefox bug 1854942](https://bugzil.la/1854942), [Firefox bug 1918287](https://bugzil.la/1918287), [Firefox bug 1918672](https://bugzil.la/1918672), [Firefox bug 1921756](https://bugzil.la/1921756))
*   The `browsingContext.contextCreated` event is now correctly emitted for lazy-loaded frames. Previously the event would only be emitted when the iframe actually started loading its content. ([Firefox bug 1878166](https://bugzil.la/1878166))
*   Network events are now correctly emitted for cached stylesheet requests. ([Firefox bug 1879438](https://bugzil.la/1879438))
*   Network event timings were previously using the wrong unit and were provided in microseconds. They are now correctly set in milliseconds. ([Firefox bug 1916685](https://bugzil.la/1916685))
*   The `requestTime` from network event timings should now be more accurate and really match the time where the request actually started. ([Firefox bug 1922390](https://bugzil.la/1922390))

## [Experimental web features](#experimental_web_features)

These features are newly shipped in Firefox 132 but are disabled by default. To experiment with them, search for the appropriate preference on the `about:config` page and set it to `true`. You can find more such features on the [Experimental features](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features) page.

*   **Cookie Store API:** `dom.cookieStore.enabled`.
    
    The [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) is a modern, [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\-based method of managing cookies that does not block the event loop and does not rely on [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) (it can therefore be made available to [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)). As of Firefox 132, a subset of the Cookie Store API has been implemented. ([Firefox bug 1800882](https://bugzil.la/1800882)). This includes:
    
    *   The [`CookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) interface, but `partitioned` is not included in return values.
    *   The [`CookieChangeEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CookieChangeEvent) interface, excluding `partitioned` properties.
    *   The [`Window.cookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/Window/cookieStore) property.
    *   The [`ServiceWorkerGlobalScope.cookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/cookieStore) property.
*   **The `fetch()` `keepalive` option:** `dom.fetchKeepalive.enabled`.
    
    The global [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch "fetch()") method has a [`keepalive`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#keepalive) initialization option. When `keepalive` is set to `true`, the browser will not abort the associated request if the page that initiated it is unloaded before the request is complete.
    
    This enables a fetch request to function as an alternative to [`Navigator.sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) when sending analytics at the end of a session, which has some advantages (you can use HTTP methods other than [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST), customize request properties, and access the server response via the fetch [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) fulfillment). It is also available in [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). ([Firefox bug 1906952](https://bugzil.la/1906952)).
    
*   **`CloseWatcher`**: `dom.closewatcher.enabled`. The [`CloseWatcher`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher) interface enables developers to implement components that can be closed using device-native mechanisms, in the same way as built-in components. For example, on Android you can close a dialog using the back button: this interface allows you to similarly close a custom sidebar. ([Firefox bug 1888729](https://bugzil.la/1888729)).
    
*   **`Promise.try()`**: `javascript.options.experimental.promise_try`. [`Promise.try()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try) is a convenience method that takes a callback of any kind (returns or throws, synchronously or asynchronously) and wraps its result in a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) so that promise semantics (e.g., [`.then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then), [`.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)) can be used to handle it ([Firefox bug 1905364](https://bugzil.la/1905364)).
    
*   **`JSON.parse` with source**: `javascript.options.experimental.json_parse_with_source`. The [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) extends `JSON.parse` behavior to provide features to mitigate issues around loss of precision when converting values such as large floats and date values between JavaScript values and JSON text ([Firefox bug 1913085](https://bugzil.la/1913085), [Firefox bug 1925334](https://bugzil.la/1925334)). Specifically, the following features are now available:
    
    *   The `JSON.parse()` [`reviver` parameter `context` argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter): Provides access to the original JSON source text that was parsed.
    *   [`JSON.isRawJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/isRawJSON): Tests whether a value is an object returned by `JSON.rawJSON()`.
    *   [`JSON.rawJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON): Creates a "raw JSON" object containing a piece of JSON text, which can then be included in an object to preserve the specified value when that object is stringified.