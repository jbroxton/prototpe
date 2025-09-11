# https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features

## [HTML](#html)

### [Layout for input type="search"](#layout_for_input_typesearch)

Layout for `input type="search"` has been updated. This causes a search field to have a clear icon once someone starts typing in it, to match other browser implementations. (See [Firefox bug 558594](https://bugzil.la/558594) for more details.)

Release channel

Version added

Enabled by default?

Nightly

81

No

Developer Edition

81

No

Beta

81

No

Release

81

No

[`layout.forms.input-type-search.enabled`](#layout.forms.input-type-search.enabled)

Set to `true` to enable.

### [Toggle password display](#toggle_password_display)

HTML password input elements ([`<input type="password">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password)) include an "eye" icon that can be toggled to display or obscure the password text ([Firefox bug 502258](https://bugzil.la/502258)).

Release channel

Version added

Enabled by default?

Nightly

96

No

Developer Edition

96

No

Beta

96

No

Release

96

No

[`layout.forms.reveal-password-button.enabled`](#layout.forms.reveal-password-button.enabled)

Set to `true` to enable.

## [CSS](#css)

### [Hex boxes to display stray control characters](#hex_boxes_to_display_stray_control_characters)

This feature renders control characters (Unicode category Cc) other than _tab_ (`U+0009`), _line feed_ (`U+000A`), _form feed_ (`U+000C`), and _carriage return_ (`U+000D`) as a hex box when they are not expected. (See [Firefox bug 1099557](https://bugzil.la/1099557) for more details.)

Release channel

Version added

Enabled by default?

Nightly

43

Yes

Developer Edition

43

No

Beta

43

No

Release

43

No

[`layout.css.control-characters.visible`](#layout.css.control-characters.visible)

Set to `true` to enable.

### [initial-letter property](#initial-letter_property)

The [`initial-letter`](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter) CSS property is part of the [CSS Inline Layout](https://drafts.csswg.org/css-inline/) specification and allows you to specify how dropped, raised, and sunken initial letters are displayed. (See [Firefox bug 1223880](https://bugzil.la/1223880) for more details.)

Release channel

Version added

Enabled by default?

Nightly

50

No

Developer Edition

50

No

Beta

50

No

Release

50

No

[`layout.css.initial-letter.enabled`](#layout.css.initial-letter.enabled)

Set to `true` to enable.

### [fit-content() function](#fit-content_function)

The [`fit-content()`](https://developer.mozilla.org/en-US/docs/Web/CSS/fit-content_function) function as it applies to [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width) and other sizing properties. This function is already well-supported for CSS Grid Layout track sizing. (See [Firefox bug 1312588](https://bugzil.la/1312588) for more details.)

Release channel

Version added

Enabled by default?

Nightly

91

No

Developer Edition

91

No

Beta

91

No

Release

91

No

[`layout.css.fit-content-function.enabled`](#layout.css.fit-content-function.enabled)

Set to `true` to enable.

### [Scroll-driven animations](#scroll-driven_animations)

Previously called "scroll-linked animations", a [scroll-driven animation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) depends on the scroll position of a scrollbar instead of time or some other dimension. The [`scroll-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-name) and [`scroll-timeline-axis`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-axis) properties (and the [`scroll-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline) shorthand property) allow you to specify that a particular scrollbar in a particular named container can be used as the source for a scroll-driven animation. The scroll timeline can then be associated with an [animation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations) by setting the [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) property to the name value defined using `scroll-timeline-name`.

When using the [`scroll-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline) shorthand property, the order of the property values must be [`scroll-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-name) followed by [`scroll-timeline-axis`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-axis). The longhand and shorthand properties are both available behind the preference. You can alternatively use the [`scroll()`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll) functional notation with [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) to indicate that a scrollbar axis in an ancestor element will be used for the timeline.

For more information, see [Firefox bug 1807685](https://bugzil.la/1807685), [Firefox bug 1804573](https://bugzil.la/1804573), [Firefox bug 1809005](https://bugzil.la/1809005), [Firefox bug 1676791](https://bugzil.la/1676791), [Firefox bug 1754897](https://bugzil.la/1754897), [Firefox bug 1817303](https://bugzil.la/1817303), and [Firefox bug 1737918](https://bugzil.la/1737918).

The [`timeline-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-scope), [`animation-range-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range-start) and [`animation-range-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range-end) properties (and the [`animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) shorthand property) are not yet supported. For more information, see [Firefox bug 1676779](https://bugzil.la/1676779).

Release channel

Version added

Enabled by default?

Nightly

136

Yes

Developer Edition

110

No

Beta

110

No

Release

110

No

[`layout.css.scroll-driven-animations.enabled`](#layout.css.scroll-driven-animations.enabled)

Set to `true` to enable.

### [@scope at-rule](#scope_at-rule)

The [@scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) [at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_syntax/At-rule) allows you to select specific child elements without having to overly increase the specificity of CSS selectors ([Firefox bug 1886441](https://bugzil.la/1886441)).

Release channel

Version added

Enabled by default?

Nightly

137

Yes

Developer Edition

128

No

Beta

128

No

Release

128

No

[`layout.css.at-scope.enabled`](#layout.css.at-scope.enabled)

Set to `true` to enable.

### [prefers-reduced-transparency media feature](#prefers-reduced-transparency_media_feature)

The CSS [`prefers-reduced-transparency`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency) media feature lets you detect if a user has enabled the setting to minimize the amount of transparent or translucent layer effects on their device. See ([Firefox bug 1736914](https://bugzil.la/1736914)) for more details.

Release channel

Version added

Enabled by default?

Nightly

113

No

Developer Edition

113

No

Beta

113

No

Release

113

No

[`layout.css.prefers-reduced-transparency.enabled`](#layout.css.prefers-reduced-transparency.enabled)

Set to `true` to enable.

### [inverted-colors media feature](#inverted-colors_media_feature)

The CSS [`inverted-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors) media feature lets you detect if a user agent or the underlying operating system is inverting colors. See ([Firefox bug 1794628](https://bugzil.la/1794628)) for more details.

Release channel

Version added

Enabled by default?

Nightly

114

No

Developer Edition

114

No

Beta

114

No

Release

114

No

[`layout.css.inverted-colors.enabled`](#layout.css.inverted-colors.enabled)

Set to `true` to enable.

### [Named view progress timelines property](#named_view_progress_timelines_property)

The CSS [`view-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline-name) property lets you give a name to particular element, identifying that its ancestor scroller element is the source of a view progress timeline. The name can then be assigned to the `animation-timeline`, which then animates the associated element as it moves through the visible area of its ancestor scroller. See ([Firefox bug 1737920](https://bugzil.la/1737920)) for more details.

Release channel

Version added

Enabled by default?

Nightly

114

No

Developer Edition

114

No

Beta

114

No

Release

114

No

[`layout.css.scroll-driven-animations.enabled`](#layout.css.scroll-driven-animations.enabled_2)

Set to `true` to enable.

### [Anonymous view progress timelines function](#anonymous_view_progress_timelines_function)

The CSS [`view()`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/view) function lets you specify that the `animation-timeline` for an element is a view progress timeline, which will animate the element as it moves through the visible area of its ancestor scroller. The function defines the axis of the parent element that supplies the timeline, along with the inset within the visible area at which the animation starts and begins. See ([Firefox bug 1808410](https://bugzil.la/1808410)) for more details.

Release channel

Version added

Enabled by default?

Nightly

114

No

Developer Edition

114

No

Beta

114

No

Release

114

No

[`layout.css.scroll-driven-animations.enabled`](#layout.css.scroll-driven-animations.enabled_3)

Set to `true` to enable.

### [Vendor-prefixed transform properties](#vendor-prefixed_transform_properties)

The `-moz-` prefixed [CSS transform](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms) properties can be disabled by setting the `layout.css.prefixes.transforms` preference to `false`. The intent is to disable these once the standard CSS zoom properties are well supported. ([Firefox bug 1886134](https://bugzil.la/1886134), [Firefox bug 1855763](https://bugzil.la/1855763)).

Specifically, this preference will disable the following prefixed properties:

*   `-moz-backface-visibility`
*   `-moz-perspective`
*   `-moz-perspective-origin`
*   `-moz-transform`
*   `-moz-transform-origin`
*   `-moz-transform-style`

Release channel

Version added

Enabled by default?

Nightly

120

Yes

Developer Edition

120

Yes

Beta

120

Yes

Release

120

Yes

[`layout.css.prefixes.transforms`](#layout.css.prefixes.transforms)

Set to `true` to enable.

### [`shape()` function](#shape_function)

The CSS [`shape()`](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/shape) function is a [`<basic-shape>`](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape) data type that enables you to define a shape in the [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path) and [`offset-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path) properties using one or more "shape commands". These commands are very similar to the [SVG path commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#path_commands). The `shape()` function is similar in some respects to the [`path()`](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/path) function, but unlike `path()`, which uses the [SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path) syntax, `shape()` uses standard CSS syntax. This enables you to easily create and edit shapes and also allows the use of CSS math functions. For more details, see [Firefox bug 1823463](https://bugzil.la/1823463) for the `shape()` function support in `clip-path`, [Firefox bug 1884424](https://bugzil.la/1884424) for the function's support in `offset-path`, and [Firefox bug 1884425](https://bugzil.la/1884425) for its interpolation support.

Release channel

Version added

Enabled by default?

Nightly

126

Yes

Developer Edition

126

No

Beta

126

No

Release

126

No

[`layout.css.basic-shape-shape.enabled`](#layout.css.basic-shape-shape.enabled)

Set to `true` to enable.

### [Symmetrical `letter-spacing`](#symmetrical_letter-spacing)

The CSS [`letter-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) property now splits the specified letter spacing evenly on both sides of each character. This is unlike the current behavior where spacing is added primarily to one side. This approach can improve text spacing, especially in mixed-directional text [Firefox bug 1891446](https://bugzil.la/1891446).

Release channel

Version added

Enabled by default?

Nightly

128

Yes

Developer Edition

128

Yes

Beta

127

No

Release

127

No

[`layout.css.letter-spacing.model`](#layout.css.letter-spacing.model)

Set to `true` to enable.

### [`calc()` color channel support in relative colors](#calc_color_channel_support_in_relative_colors)

The CSS [`calc()`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) function can now parse color channels in [relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors#using_math_functions), allowing you to correctly calculate changes to colors in different color spaces or while using different functional notations [Firefox bug 1889561](https://bugzil.la/1889561).

Release channel

Version added

Enabled by default?

Nightly

127

Yes

Developer Edition

127

No

Beta

127

No

Release

127

No

[`layout.css.relative-color-syntax.enabled`](#layout.css.relative-color-syntax.enabled)

Set to `true` to enable.

### [CSS Anchor Positioning](#css_anchor_positioning)

The [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) module defines a number of features that allow elements to be defined as anchor elements, and for other elements to be positioned relative to anchor elements. This allows, for example, tooltips to be displayed alongside associated content as it scrolls through the viewport, moving as needed when it would overflow the viewport, and disappearing when the anchor moves offscreen. The set of features are being progressively rolled out behind a preference ([Firefox bug 1838746](https://bugzil.la/1838746)).

The parts that have been implemented include [`CSSPositionTryRule`](https://developer.mozilla.org/en-US/docs/Web/API/CSSPositionTryRule) and [`CSSPositionTryDescriptors`](https://developer.mozilla.org/en-US/docs/Web/API/CSSPositionTryDescriptors) (Firefox 131).

Release channel

Version added

Enabled by default?

Nightly

131

No

Developer Edition

131

No

Beta

131

No

Release

131

No

[`layout.css.anchor-positioning.enabled`](#layout.css.anchor-positioning.enabled)

Set to `true` to enable.

### [Allow pseudo-elements after element-backed pseudo-elements](#allow_pseudo-elements_after_element-backed_pseudo-elements)

Work has started on allowing [pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements) such as [`::first-letter`](https://developer.mozilla.org/en-US/docs/Web/CSS/::first-letter) and [`::before`](https://developer.mozilla.org/en-US/docs/Web/CSS/::before) to be appended to [element-backed pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements#element-backed_pseudo-elements) such as [`::details-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content) and [`::file-selector-button`](https://developer.mozilla.org/en-US/docs/Web/CSS/::file-selector-button).

This will allow users to, for example, style the first letter of the [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) element by using the CSS selector `::details-content::first-letter` or add content before an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) of [`type="file"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) using the CSS selector `::file-selector-button::before`.

Currently, only support for `::details-content::first-letter` can be parsed using `@supports(::details-content::first-letter)`. The `::file-selector-button` pseudo-element is not yet marked as an element-based pseudo-element, so there is no way to test this. ([Firefox bug 1953557](https://bugzil.la/1953557), [Firefox bug 1941406](https://bugzil.la/1941406)).

Release channel

Version added

Enabled by default?

Nightly

138

No

Developer Edition

138

No

Beta

138

No

Release

138

No

### [`:active-view-transition` pseudo-class](#active-view-transition_pseudo-class)

The CSS [`:active-view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/:active-view-transition) pseudo-class enables you to style content while a [view transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) is taking place in a single-page app (SPA). ([Firefox bug 1956140](https://bugzil.la/1956140)).

Release channel

Version added

Enabled by default?

Nightly

141

Yes

Developer Edition

141

No

Beta

141

No

Release

141

No

[`dom.viewTransitions.enabled`](#dom.viewtransitions.enabled)

Set to `true` to enable.

### [`match-element` value for `view-transition-name` property](#match-element_value_for_view-transition-name_property)

The [`match-element`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name#match-element) value of the CSS [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name) property [automatically](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name#specifying_view-transition-name_values_automatically) assigns a unique internal `view-transition-name` to each selected element, rather than having to name them individually. ([Firefox bug 1956141](https://bugzil.la/1956141)).

Release channel

Version added

Enabled by default?

Nightly

142

Yes

Developer Edition

142

No

Beta

142

No

Release

142

No

[`dom.viewTransitions.enabled`](#dom.viewtransitions.enabled_2)

Set to `true` to enable.

### [`anchor-size()` function](#anchor-size_function)

The CSS [`anchor-size()`](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-size) function enables setting anchor-positioned element's size, position, and margins relative to the dimensions of anchor elements. ([Firefox bug 1972610](https://bugzil.la/1972610)).

Release channel

Version added

Enabled by default?

Nightly

142

No

Developer Edition

142

No

Beta

142

No

Release

142

No

[`layout.css.anchor-positioning.enabled`](#layout.css.anchor-positioning.enabled_2)

Set to `true` to enable.

### [`:heading` and `:heading()` pseudo-classes](#heading_and_heading_pseudo-classes)

The [`:heading`](https://developer.mozilla.org/en-US/docs/Web/CSS/:heading) pseudo-class allows you to style all [heading elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) (`<h1>`\-`<h6>`) at once, rather than targeting them individually. The [`:heading()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:heading_function) functional pseudo-class allows you to style heading elements that match the [`<An+B>`](https://developer.mozilla.org/en-US/docs/Web/CSS/:heading_function#functional_notation) notation. ([Firefox bug 1974386](https://bugzil.la/1974386)).

Release channel

Version added

Enabled by default?

Nightly

142

No

Developer Edition

142

No

Beta

142

No

Release

142

No

[`layout.css.heading-selector.enabled`](#layout.css.heading-selector.enabled)

Set to `true` to enable.

### [`text-autospace` property](#text-autospace_property)

The **`text-autospace`** CSS property allows you to specify the space applied between Chinese/Japanese/Korean (CJK) and non-CJK characters. Currently these values are only parsed and there is no effect on the output. ([Firefox bug 1869577](https://bugzil.la/1869577)).

Release channel

Version added

Enabled by default?

Nightly

143

No

Developer Edition

143

No

Beta

143

No

Release

143

No

[`layout.css.text-autospace.enabled`](#layout.css.text-autospace.enabled)

Set to `true` to enable.

## [SVG](#svg)

**No experimental features in this release cycle.**

## [JavaScript](#javascript)

### [Atomics.waitAsync()](#atomics.waitasync)

The [`Atomics.waitAsync()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/waitAsync) static method waits asynchronously on a shared memory location and returns an object representing the result of the operation. It is non-blocking and usable on the main thread. ([Firefox bug 1467846](https://bugzil.la/1467846)).

Release channel

Version added

Enabled by default?

Nightly

140

No

Developer Edition

140

No

Beta

140

No

Release

140

No

[`javascript.options.atomics_wait_async`](#javascript.options.atomics_wait_async)

Set to `true` to enable.

## [APIs](#apis)

### [CloseWatcher Interface](#closewatcher_interface)

Built-in web components with "open" and "close" semantics, such as modal dialogs and popovers, can be closed using device-native mechanisms. For example, on Android you can close a dialog using the back button. The [`CloseWatcher`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher) interface allows developers to implement UI components, such as custom sidebars, that can similarly be closed using native mechanisms. ([Firefox bug 1888729](https://bugzil.la/1888729)).

Release channel

Version added

Enabled by default?

Nightly

140

Yes (Desktop). No (Android).

Developer Edition

132

No

Beta

132

No

Release

132

No

[`dom.closewatcher.enabled`](#dom.closewatcher.enabled)

Set to `true` to enable.

### [Trusted Types API](#trusted_types_api)

The [Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) provides mechanisms to ensure that functions that can potentially be used as vectors for XSS attacks are only able to be called with data that has been validated or sanitized.

**Note:** At the time of writing not enough of the API has been implemented for it to be effectively testable. This note will be removed once it is ready.

This subset of the API has been implemented:

*   [`TrustedTypePolicyFactory`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicyFactory):
    *   [`getAttributeType()`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicyFactory/getAttributeType "getAttributeType()") and [`getPropertyType()`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicyFactory/getPropertyType "getPropertyType()") ([Firefox bug 1917783](https://bugzil.la/1917783), [Firefox bug 1917784](https://bugzil.la/1917784)).
*   The [`write()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write "write()") and [`writeln()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/writeln "writeln()") methods of the [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) interface now accept [`TrustedHTML`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedHTML) objects as parameters, in addition to strings. ([Firefox bug 1906301](https://bugzil.la/1906301)).
*   The [`text`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/text "text"), [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText "innerText"), and [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent "textContent") properties of the [`HTMLScriptElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement) interface now accept [`TrustedScript`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedScript) objects a value, while [`src`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/src "src") accepts [`TrustedScriptURL`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedScriptURL) values. ([Firefox bug 1905706](https://bugzil.la/1905706)).
*   The [`Window.setInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval) and [`Window.setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) methods can be called with a [`TrustedScript`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedScript). ([Firefox bug 1931290](https://bugzil.la/1931290)).
*   The global [`trustedTypes`](https://developer.mozilla.org/en-US/docs/Web/API/Window/trustedTypes) property is available for accessing the Trusted Types API.
*   The properties [`Element.innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) and [`ShadowRoot.innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/innerHTML) can be called with [trusted types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API).

Release channel

Version added

Enabled by default?

Nightly

133

No

Developer Edition

133

No

Beta

133

No

Release

133

No

[`dom.security.trusted_types.enabled`](#dom.security.trusted_types.enabled)

Set to `true` to enable.

### [HTML Sanitizer API](#html_sanitizer_api)

The [HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API) allow developers to take untrusted strings of HTML and sanitize them for safe insertion into a document's DOM.

Release channel

Version added

Enabled by default?

Nightly

138

No

Developer Edition

138

No

Beta

138

No

Release

138

No

[`dom.security.sanitizer.enabled`](#dom.security.sanitizer.enabled)

Set to `true` to enable.

### [Removal of `beforescriptexecute` and `afterscriptexecute` events](#removal_of_beforescriptexecute_and_afterscriptexecute_events)

The non-standard events [`beforescriptexecute`](https://developer.mozilla.org/en-US/docs/Web/API/Document/beforescriptexecute_event) and [`afterscriptexecute`](https://developer.mozilla.org/en-US/docs/Web/API/Document/afterscriptexecute_event) on the [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) interface, and [`afterscriptexecute`](https://developer.mozilla.org/en-US/docs/Web/API/Element/afterscriptexecute_event) and [`beforescriptexecute`](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforescriptexecute_event) on the [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) interface are on the path to removal. They have been disabled in Nightly. ([Firefox bug 1954685](https://bugzil.la/1954685)).

Release channel

Version added

Enabled by default?

Nightly

139

No

Developer Edition

139

Yes

Beta

139

Yes

Release

139

Yes

[`dom.events.script_execute.enable`](#dom.events.script_execute.enable)

Set to `true` to enable.

### [PerformanceEventTiming.interactionId](#performanceeventtiming.interactionid)

[`PerformanceEventTiming.interactionId`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming/interactionId) can be used to measure latency timing for events triggered by a particular user interaction. ([Firefox bug 1934683](https://bugzil.la/1934683)).

Release channel

Version added

Enabled by default?

Nightly

138

No

Developer Edition

138

No

Beta

138

No

Release

138

No

[`dom.performance.event_timing.enable_interactionid`](#dom.performance.event_timing.enable_interactionid)

Set to `true` to enable.

### [Notification actions and maxActions properties](#notification_actions_and_maxactions_properties)

The [`actions`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/actions "actions") read-only property and the [`maxActions`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/maxActions_static) static read-only property of the [`Notification`](https://developer.mozilla.org/en-US/docs/Web/API/Notification) interface are supported in Nightly on desktop. These contain the notification actions set with [`ServiceWorkerRegistration.showNotification()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification), and the maximum number of actions that can be set, respectively. ([Firefox bug 1225110](https://bugzil.la/1225110), [Firefox bug 1963263](https://bugzil.la/1963263)).

Release channel

Version added

Enabled by default?

Nightly

138

Yes (desktop only)

Developer Edition

138

No

Beta

138

No

Release

138

No

[`dom.webnotifications.actions.enabled`](#dom.webnotifications.actions.enabled)

Set to `true` to enable.

### [Graphics: Canvas, WebGL, and WebGPU](#graphics_canvas_webgl_and_webgpu)

#### WebGL: Draft extensions

When this preference is enabled, any WebGL extensions currently in "draft" status which are being tested are enabled for use. Currently, there are no WebGL extensions being tested by Firefox.

#### WebGPU API

The [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) provides low-level support for performing computation and graphics rendering using the [Graphics Processing Unit](https://en.wikipedia.org/wiki/Graphics_Processing_Unit) (GPU) of the user's device or computer. From version 142 this is enabled in on Windows in all contexts except service workers. For other platforms it is enabled in nightly. See [Firefox bug 1602129](https://bugzil.la/1602129) for our progress on this API.

Release channel

Version added

Enabled by default?

Nightly

141

Yes

Developer Edition

141

No (Yes on Windows, not including service workers)

Beta

141

No (Yes on Windows, not including service workers)

Release

141

No (Yes on Windows, not including service workers)

[`dom.webgpu.enabled`](#dom.webgpu.enabled)

Set to `true` to enable (enabled in Nightly and on Windows in all releases)

[`dom.webgpu.service-workers.enabled`](#dom.webgpu.service-workers.enabled)

Set to `true` to enable (enabled in Nightly)

### [Reporting API support for CSP Violations](#reporting_api_support_for_csp_violations)

The [Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API) now has support for reporting [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) violations.

[`Report`](https://developer.mozilla.org/en-US/docs/Web/API/Report) instances returned by the [`ReportingObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ReportingObserver) interface can now have a `type` value of `"csp-violation"` and a `body` property that contains an instance of the [`CSPViolationReportBody`](https://developer.mozilla.org/en-US/docs/Web/API/CSPViolationReportBody) interface. This allows CSP violations to be reported within a web page.

CSP violation reports can also be sent to remote endpoints that are specified by name in the CSP [`report-to`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to) directive — endpoints names and corresponding URLs must first be defined in the [`Reporting-Endpoints`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints) or [`Report-To`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Report-To) HTTP response headers. The report is a serialization of the [`Report`](https://developer.mozilla.org/en-US/docs/Web/API/Report) object described above, with a `body` property that is a serialization of an [`CSPViolationReportBody`](https://developer.mozilla.org/en-US/docs/Web/API/CSPViolationReportBody) instance.

This violation report replaces a similar CSP-specific mechanism for sending violation reports, which uses the CSP [`report-uri`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri) directive to set the URL of the reporting endpoint, and has a [CSP-specific JSON violation report format](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri#violation_report_syntax). ([Firefox bug 1391243](https://bugzil.la/1391243)).

Release channel

Version added

Enabled by default?

Nightly

130

No

Developer Edition

130

No

Beta

130

No

Release

130

No

[`dom.reporting.enabled`](#dom.reporting.enabled)

Set to `true` to enable.

### [WebRTC and media](#webrtc_and_media)

The following experimental features include those found in the [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API), the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), the [Media Source Extensions API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API), the [Encrypted Media Extensions API](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API), and the [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API).

#### Asynchronous SourceBuffer add and remove

This adds the promise-based methods [`appendBufferAsync()`](https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBufferAsync "appendBufferAsync()") and [`removeAsync()`](https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/removeAsync "removeAsync()") for adding and removing media source buffers to the [`SourceBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer) interface. See [Firefox bug 1280613](https://bugzil.la/1280613) and [Firefox bug 778617](https://bugzil.la/778617) for more information.

Release channel

Version added

Enabled by default?

Nightly

62

No

Developer Edition

62

No

Beta

62

No

Release

62

No

[`media.mediasource.experimental.enabled`](#media.mediasource.experimental.enabled)

Set to `true` to enable.

#### AVIF compliance strictness

The `image.avif.compliance_strictness` preference can be used to control the _strictness_ applied when processing [AVIF](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#avif_image) images. This allows Firefox users to display images that render on some other browsers, even if they are not strictly compliant.

Release channel

Version added

Default value

Nightly

92

1

Developer Edition

92

1

Beta

92

1

Release

92

1

[`image.avif.compliance_strictness`](#image.avif.compliance_strictness)

Numeric value indicating a _strictness_ level. Permitted values are:

*   `0`: Permissive. Accept images with specification violations in both recommendations ("should" language) and requirements ("shall" language), provided they can be safely or unambiguously interpreted.
*   `1` **(default)**: Mixed. Reject violations of requirements ("shall"), but allow violations of recommendations ("should").
*   `2`: Strict. Reject any violations of specified requirements or recommendations.

#### JPEG XL support

Firefox supports [JPEG XL](https://jpeg.org/jpegxl/) images if this feature is enabled. See [Firefox bug 1539075](https://bugzil.la/1539075) for more details.

Note that, as shown below, the feature is only available on Nightly builds (irrespective of whether the preference is set).

Release channel

Version added

Enabled by default?

Nightly

90

No

Developer Edition

—

—

Beta

—

—

Release

—

—

[`image.jxl.enabled`](#image.jxl.enabled)

Set to `true` to enable.

### [WebVR API](#webvr_api)

#### WebVR API (Disabled)

The deprecated [WebVR API](https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API) is on the path for removal. It is disabled by default on all builds [Firefox bug 1750902](https://bugzil.la/1750902).

Release channel

Version removed

Enabled by default?

Nightly

98

No

Developer Edition

98

No

Beta

98

No

Release

98

No

[`dom.vr.enabled`](#dom.vr.enabled)

Set to `true` to enable.

#### HTMLMediaElement properties: audioTracks and videoTracks

Enabling this feature adds the [`HTMLMediaElement.audioTracks`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/audioTracks) and [`HTMLMediaElement.videoTracks`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/videoTracks) properties to all HTML media elements. However, because Firefox doesn't currently support multiple audio and video tracks, the most common use cases for these properties don't work, so they're both disabled by default. See [Firefox bug 1057233](https://bugzil.la/1057233) for more details.

Release channel

Version added

Enabled by default?

Nightly

33

No

Developer Edition

33

No

Beta

33

No

Release

33

No

[`media.track.enabled`](#media.track.enabled)

Set to `true` to enable.

#### GeometryUtils methods: convertPointFromNode(), convertRectFromNode(), and convertQuadFromNode()

The `GeometryUtils` methods `convertPointFromNode()`, `convertRectFromNode()`, and `convertQuadFromNode()` map the given point, rectangle, or quadruple from the [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node) on which they're called to another node. (See [Firefox bug 918189](https://bugzil.la/918189) for more details.)

Release channel

Version added

Enabled by default?

Nightly

31

Yes

Developer Edition

31

No

Beta

31

No

Release

31

No

[`layout.css.convertFromNode.enable`](#layout.css.convertfromnode.enable)

Set to `true` to enable.

#### GeometryUtils method: getBoxQuads()

The `GeometryUtils` method `getBoxQuads()` returns the CSS boxes for a [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node) relative to any other node or viewport. (See [Firefox bug 917755](https://bugzil.la/917755) for more details.)

Release channel

Version added

Enabled by default?

Nightly

31

Yes

Developer Edition

31

No

Beta

31

No

Release

31

No

[`layout.css.getBoxQuads.enabled`](#layout.css.getboxquads.enabled)

Set to `true` to enable.

### [Payment Request API](#payment_request_api)

#### Primary payment handling

The [Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API) provides support for handling web-based payments within web content or apps. Due to a bug that came up during testing of the user interface, we have decided to postpone shipping this API while discussions over potential changes to the API are held. Work is ongoing. (See [Firefox bug 1318984](https://bugzil.la/1318984) for more details.)

Release channel

Version added

Enabled by default?

Nightly

55

No

Developer Edition

55

No

Beta

55

No

Release

55

No

[`dom.payments.request.enabled`](#dom.payments.request.enabled)

Set to `true` to enable.

[`dom.payments.request.supportedRegions`](#dom.payments.request.supportedregions)

Country codes as a comma-separated allowlist of regions (e.g., `US,CA`).

### [WebShare API](#webshare_api)

The [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) allows sharing of files, URLs and other data from a site. This feature is enabled on Android in all builds, but behind a preference on Desktop (unless specified below).

Release channel

Version changed

Enabled by default?

Nightly

71

No (default). Yes (Windows from version 92)

Developer Edition

71

No

Beta

71

No

Release

71

No (Desktop). Yes (Android).

[`dom.webshare.enabled`](#dom.webshare.enabled)

Set to `true` to enable.

### [Screen Orientation API](#screen_orientation_api)

#### ScreenOrientation.lock()

The [`ScreenOrientation.lock()`](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock) method allows a device to be locked to a particular orientation, if supported by the device and allowed by browser pre-lock requirements. Typically locking the orientation is only allowed on mobile devices when the document is being displayed full screen. See [Firefox bug 1697647](https://bugzil.la/1697647) for more details.

Release channel

Version changed

Enabled by default?

Nightly

111

Yes

Developer Edition

97

No

Beta

97

No

Release

97

No

[`dom.screenorientation.allow-lock`](#dom.screenorientation.allow-lock)

Set to `true` to enable.

### [Notifications API](#notifications_api)

Notifications have the [`requireInteraction`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requireInteraction) property set to true by default on Windows systems and in the Nightly release ([Firefox bug 1794475](https://bugzil.la/1794475)).

Release channel

Version changed

Enabled by default?

Nightly

117

Yes

Developer Edition

117

No

Beta

117

No

Release

117

Windows only

[`dom.webnotifications.requireinteraction.enabled`](#dom.webnotifications.requireinteraction.enabled)

Set to `true` to enable.

### [View Transition API](#view_transition_api)

The [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) provides a mechanism for easily creating animated transitions between different website views. This is especially useful for [SPAs (single-page applications)](https://developer.mozilla.org/en-US/docs/Glossary/SPA). ([Firefox bug 1950759](https://bugzil.la/1950759)).

Release channel

Version changed

Enabled by default?

Nightly

139

Yes

Developer Edition

139

No

Beta

139

No

Release

139

No

[`dom.viewTransitions.enabled`](#dom.viewtransitions.enabled_3)

Set to `true` to enable.

## [Security and privacy](#security_and_privacy)

### [Insecure page labeling](#insecure_page_labeling)

The two `security.insecure_connection_text_*` preferences add a "Not secure" text label in the address bar next to the traditional lock icon when a page is loaded insecurely (that is, using [HTTP](https://developer.mozilla.org/en-US/docs/Glossary/HTTP) rather than [HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)). The `browser.urlbar.trimHttps` preference trims the `https:` prefix from address bar URLs. See [Firefox bug 1853418](https://bugzil.la/1853418) for more details.

Release channel

Version added

Enabled by default?

Nightly

121

Yes

Developer Edition

60

No

Beta

60

No

Release

60

No

[`security.insecure_connection_text.enabled`](#security.insecure_connection_text.enabled)

Set to `true` to enable the text label for normal browsing mode.

[`security.insecure_connection_text.pbmode.enabled`](#security.insecure_connection_text.pbmode.enabled)

Set to `true` to enable the text label for private browsing mode.

[`browser.urlbar.trimHttps`](#browser.urlbar.trimhttps)

Set to `true` to trim the `https:` prefix from address bar URLs.

### [Permissions Policy / Feature policy](#permissions_policy_feature_policy)

[Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy) allows web developers to selectively enable, disable, and modify the behavior of certain features and APIs in the browser. It is similar to CSP but controls features instead of security behavior. This is implemented in Firefox as **Feature Policy**, the name used in an earlier version of the specification.

Note that supported policies can be set through the [`allow`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow) attribute on `<iframe>` elements even if the user preference is not set.

Release channel

Version added

Enabled by default?

Nightly

65

No

Developer Edition

65

No

Beta

65

No

Release

65

No

Set to `true` to enable.

### [Privacy Preserving Attribution API (PPA)](#privacy_preserving_attribution_api_ppa)

[PPA API](https://support.mozilla.org/en-US/kb/privacy-preserving-attribution) provides an alternative to user tracking for ad attribution using the new `navigator.privateAttribution` object with `saveImpression()` and `measureConversion()` methods. Read more about PPA [in the original explainer](https://github.com/mozilla/explainers/tree/main/archive/ppa-experiment) and the [proposed spec](https://w3c.github.io/ppa/). This experiment can be enabled for websites via [origin trial](https://wiki.mozilla.org/Origin_Trials) or in the browser by setting the preference to `1`. ([Firefox bug 1900929](https://bugzil.la/1900929)).

Release channel

Version added

Enabled by default?

Nightly

128

No

Developer Edition

128

No

Beta

128

No

Release

128

No

[`dom.origin-trials.private-attribution.state`](#dom.origin-trials.private-attribution.state)

Set to `true` to enable.

## [HTTP](#http)

### [Integrity policy for script resources](#integrity_policy_for_script_resources)

The [`Integrity-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy) and [`Integrity-Policy-Report-Only`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy-Report-Only) HTTP headers are now supported for script resources. These allow websites to either enforce [subresource integrity guarantees](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) for scripts or only report violations of the policy, respectively. Note that Firefox ignores reporting endpoints, and logs violations to the developer console. When `Integrity-Policy` is used, the browser blocks the loading of scripts that either lack the [`integrity`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script#integrity) attribute or have an integrity hash that doesn't match the script resource on the server. The browser will also stop requests in [`no-cors` mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode#no-cors) from ever being made, such as those from a [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script) element without the [`crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin) attribute. ([Firefox bug 1976656](https://bugzil.la/1976656)).

Release channel

Version added

Enabled by default?

Nightly

142

Yes

Developer Edition

142

No

Beta

142

No

Release

142

No

[`security.integrity_policy.enabled`](#security.integrity_policy.enabled)

Set to `true` to enable.

### [Integrity policy for stylesheet resources](#integrity_policy_for_stylesheet_resources)

The [`Integrity-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy) and [`Integrity-Policy-Report-Only`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy-Report-Only) HTTP headers are now supported for style resources. These allow websites to either enforce [subresource integrity guarantees](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) for styles or only report violations of the policy, respectively. Note that Firefox ignores reporting endpoints, and logs violations to the developer console. When `Integrity-Policy` is used, the browser blocks the loading of styles referenced in a [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link) element with [`rel="stylesheet"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#stylesheet) that either lack the [`integrity`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script#integrity) attribute or have an integrity hash that doesn't match the resource on the server. ([Firefox bug 1976656](https://bugzil.la/1976656)).

Release channel

Version added

Enabled by default?

Nightly

142

No

Developer Edition

142

No

Beta

142

No

Release

142

No

[`security.integrity_policy.stylesheet.enabled`](#security.integrity_policy.stylesheet.enabled)

Set to `true` to enable.

The HTTP [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) header in [default requests and image requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation/List_of_default_Accept_values) can be configured via a preference to indicate support for the `image/jxl` MIME type.

Release channel

Version added

Enabled by default?

Nightly

128

No

Developer Edition

128

No

Beta

128

No

Release

128

No

[`image.jxl.enabled`](#image.jxl.enabled_2)

Set to `true` to enable.

### [SameSite=Lax by default](#samesitelax_by_default)

[`SameSite` cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value) have a default value of `Lax`. With this setting, cookies are only sent when a user is navigating to the origin site, not for cross-site subrequests to load images or frames into a third party site and so on. For more details see [Firefox bug 1617609](https://bugzil.la/1617609).

Release channel

Version added

Enabled by default?

Nightly

69

No

Developer Edition

69

No

Beta

69

No

Release

69

No

[`network.cookie.sameSite.laxByDefault`](#network.cookie.samesite.laxbydefault)

Set to `true` to enable.

The [`Access-Control-Allow-Headers`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Headers) is a response header to a [CORS preflight request](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request), that indicates which request headers may be included in the final request. The response directive can contain a wildcard (`*`), which indicates that the final request may include all headers except the `Authorization` header.

By default, Firefox includes the `Authorization` header in the final request after receiving a response with `Access-Control-Allow-Headers: *`. Set the preference to `false` to ensure Firefox does not include the `Authorization` header. For more details see [Firefox bug 1687364](https://bugzil.la/1687364).

Release channel

Version added

Enabled by default?

Nightly

115

Yes

Developer Edition

115

Yes

Beta

115

Yes

Release

115

Yes

[`network.cors_preflight.authorization_covered_by_wildcard`](#network.cors_preflight.authorization_covered_by_wildcard)

Set to `true` to enable.

## [Developer tools](#developer_tools)

Mozilla's developer tools are constantly evolving. We experiment with new ideas, add new features, and test them on the Nightly and Developer Edition channels before letting them go through to beta and release. The features below are the current crop of experimental developer tool features.

**No experimental features in this release cycle.**

## [See also](#see_also)

*   [Firefox developer release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases)
*   [Firefox Nightly](https://www.firefox.com/en-US/channel/desktop/)
*   [Firefox Developer Edition](https://www.firefox.com/en-US/channel/desktop/developer/)