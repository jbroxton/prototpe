# https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/130

## [Changes for web developers](#changes_for_web_developers)

### [HTML](#html)

*   The [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#name) attribute of the `<details>` element now allows the grouping of `<details>` elements, where only one element within a group can be open at a time. This allows you to create an exclusive accordion without using JavaScript ([Firefox bug 1856460](https://bugzil.la/1856460) and [Firefox bug 1909613](https://bugzil.la/1909613)).
*   The [`dir`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir) and [`lang`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang) [global attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes) now have improved inheritance, including how they work with [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM#attribute_inheritance) ([Firefox bug 1876163](https://bugzil.la/1876163)).

### [CSS](#css)

*   The [`hyphens`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens) CSS property is now properly supported for Czech and Slovak languages. Among other things, this ensures that words will no longer split on syllables ([Firefox bug 1908931](https://bugzil.la/1908931)).

### [APIs](#apis)

*   The [X25519](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#x25519) digital signature algorithm is supported by the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), and can be used in the [`SubtleCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) methods: [`deriveKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey "deriveKey()"), [`deriveBits()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits "deriveBits()"), [`generateKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey "generateKey()"), [`importKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey "importKey()") and [`exportKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey "exportKey()") ([Firefox bug 1904836](https://bugzil.la/1904836)).
*   The [Web Codecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) is supported on desktop releases, giving web developers low-level access to the individual frames of a video stream and chunks of audio. Android support is enabled in the Nightly release. The new interfaces include: [`VideoEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder), [`VideoDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder), [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk), [`VideoFrame`](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame), [`VideoColorSpace`](https://developer.mozilla.org/en-US/docs/Web/API/VideoColorSpace), [`AudioEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/AudioEncoder), [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData), and [`AudioDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/AudioDecoder). ([Firefox bug 1908572](https://bugzil.la/1908572)).

#### Removals

*   [`WebGLRenderingContext.drawingBufferColorSpace`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawingBufferColorSpace) and [`WebGL2RenderingContext.drawingBufferColorSpace`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) were prematurely released (without an implementation) in [Firefox 127](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/127), and have been removed ([Firefox bug 1909559](https://bugzil.la/1909559)).

### [WebAssembly](#webassembly)

#### General

*   System add-ons are now completely disabled by default ([Firefox bug 1904310](https://bugzil.la/1904310)).
*   Fixed an issue with the internal prompt listener to correctly select the appropriate user prompt on Android ([Firefox bug 1902264](https://bugzil.la/1902264)).

#### WebDriver BiDi

*   Added support for the `browsingContext.navigationFailed` event, which is triggered when a navigation attempt fails to complete ([Firefox bug 1846601](https://bugzil.la/1846601)).
*   The `network.setCacheBehavior` command now allows defining the network cache behavior both globally and for individual navigables simultaneously ([Firefox bug 1905307](https://bugzil.la/1905307)).
*   The `network.responseCompleted` and `network.fetchError` events are now emitted when the actual request stops, eliminating a race condition where `browsingContext.domContentLoaded` and `browsingContext.load` events were emitted before the `network.responseCompleted` event ([Firefox bug 1882803](https://bugzil.la/1882803)).
*   Data URLs (e.g., for background images or fetch requests) are now fully supported across all network events ([Firefox bug 1904343](https://bugzil.la/1904343)).
*   Fixed an issue where the `network.authRequired` event was sent out multiple times with each call to the `network.continueWithAuth` command ([Firefox bug 1899711](https://bugzil.la/1899711)).

#### Marionette

*   Fixed an issue in `WebDriver:ElementSendKeys` so that it only scrolls the element into view if it is not already visible ([Firefox bug 1906095](https://bugzil.la/1906095)).

## [Changes for add-on developers](#changes_for_add-on_developers)

*   The `options` parameter of [`webRequest.getSecurityInfo`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/getSecurityInfo) is now optional ([Firefox bug 1909474](https://bugzil.la/1909474)).
*   [`runtime.getURL`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getURL) (and the deprecated [`extension.getURL`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getURL)) now always prepended the extension origin to the path, without further normalization. Previously, when an absolute URL was provided, instead of a relatively URL, the absolute URL was returned. ([Firefox bug 1795082](https://bugzil.la/1795082)).

## [Experimental web features](#experimental_web_features)

These features are newly shipped in Firefox 130 but are disabled by default. To experiment with them, search for the appropriate preference on the `about:config` page and set it to `true`. You can find more such features on the [Experimental features](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features) page.

*   **Request video frame callback:** `media.rvfc.enabled`.
    
    The [`requestVideoFrameCallback()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback "requestVideoFrameCallback()") method of the [`HTMLVideoElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) interface registers a callback function that runs when a new video frame is sent to the compositor. This enables developers to perform efficient operations on each video frame, such as video analysis, painting to a canvas, synchronization with external audio sources, and so on. The method returns a callback handle that can be passed to [`HTMLVideoElement.cancelVideoFrameCallback()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/cancelVideoFrameCallback) in order to cancel the outstanding callback request. Both methods are enabled by default on the nightly build. ([Firefox bug 1800882](https://bugzil.la/1800882)).
    
*   **CSP violation reports using the Reporting API:** `dom.reporting.enabled`.
    
    The [Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API) can be used for reporting [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) violations. This includes support for [`Report`](https://developer.mozilla.org/en-US/docs/Web/API/Report) objects that have a `type` property with the value `"csp-violation"` and `body` property that is an instance of the [`CSPViolationReportBody`](https://developer.mozilla.org/en-US/docs/Web/API/CSPViolationReportBody) interface, the [`report-to`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to) directive of the [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) HTTP response header, and the [`Reporting-Endpoints`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints) and [`Report-To`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Report-To) HTTP response headers. This feature is disabled by default. ([Firefox bug 1391243](https://bugzil.la/1391243)).