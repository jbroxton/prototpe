# https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json

## [List of manifest.json keys](#list_of_manifest.json_keys)

These are the `manifest.json` keys; these keys are available in Manifest V2 and above unless otherwise noted:

*   [action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action) (Manifest V3 and above)
*   [author](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author)
*   [background](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)
*   [browser\_action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_action) (Manifest V2 only)
*   [browser\_specific\_settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings)
*   [chrome\_settings\_overrides](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_settings_overrides)
*   [chrome\_url\_overrides](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)
*   [commands](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands)
*   [content\_scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts)
*   [content\_security\_policy](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy)
*   [declarative\_net\_request](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/declarative_net_request)
*   [default\_locale](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/default_locale)
*   [description](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/description)
*   [developer](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/developer)
*   [devtools\_page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page)
*   [dictionaries](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/dictionaries)
*   [externally\_connectable](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable) (Not supported in Firefox)
*   [homepage\_url](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/homepage_url)
*   [host\_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions) (Manifest V3 and above)
*   [icons](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)
*   [incognito](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/incognito)
*   [manifest\_version](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/manifest_version)
*   [name](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/name)
*   [offline\_enabled](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/offline_enabled) (Not supported in Firefox)
*   [omnibox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/omnibox)
*   [optional\_host\_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/optional_host_permissions) (Manifest V3 and above)
*   [optional\_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/optional_permissions)
*   [options\_page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_page)
*   [options\_ui](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)
*   [page\_action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/page_action) (Manifest V2 only in Chrome)
*   [permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions)
*   [protocol\_handlers](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/protocol_handlers) (Firefox only)
*   [short\_name](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/short_name)
*   [sidebar\_action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/sidebar_action)
*   [storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/storage) (Not supported in Firefox)
*   [theme](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme)
*   [theme\_experiment](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme_experiment) (Firefox only) (experimental)
*   [user\_scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/user_scripts) (Manifest V2 only)
*   [version](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version)
*   [version\_name](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version_name)
*   [web\_accessible\_resources](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources)

### [Notes about manifest.json keys](#notes_about_manifest.json_keys)

*   `"manifest_version"`, `"version"`, and `"name"` are the only mandatory keys.
*   `"default_locale"` must be present if the `_locales` directory is present, and must be absent otherwise.
*   `"browser_specific_settings"` is not supported in Google Chrome.

### [Accessing manifest.json keys at runtime](#accessing_manifest.json_keys_at_runtime)

You can access your extension's manifest from the extension's JavaScript using the [`runtime.getManifest()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getManifest) function:

    browser.runtime.getManifest().version;
    

## [Example](#example)

The block below shows the basic syntax for some common manifest keys.

**Note:** This is not intended to be used as a copy-paste-ready example. Selecting the keys you'll need depends on the extension you are developing.

For complete example extensions, see [Example extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Examples).

    {
      "browser_specific_settings": {
        "gecko": {
          "id": "@addon-example",
          "strict_min_version": "42.0"
        }
      },
    
      "background": {
        "scripts": ["jquery.js", "my-background.js"]
      },
    
      "browser_action": {
        "default_icon": {
          "19": "button/geo-19.png",
          "38": "button/geo-38.png"
        },
        "default_title": "Whereami?",
        "default_popup": "popup/geo.html"
      },
    
      "commands": {
        "toggle-feature": {
          "suggested_key": {
            "default": "Ctrl+Shift+Y",
            "linux": "Ctrl+Shift+U"
          },
          "description": "Send a 'toggle-feature' event"
        }
      },
    
      "content_security_policy": "script-src 'self' https://example.com; object-src 'self'",
    
      "content_scripts": [
        {
          "exclude_matches": ["*://developer.mozilla.org/*"],
          "matches": ["*://*.mozilla.org/*"],
          "js": ["borderify.js"]
        }
      ],
    
      "default_locale": "en",
    
      "description": "…",
    
      "icons": {
        "48": "icon.png",
        "96": "icon@2x.png"
      },
    
      "manifest_version": 2,
    
      "name": "…",
    
      "page_action": {
        "default_icon": {
          "19": "button/geo-19.png",
          "38": "button/geo-38.png"
        },
        "default_title": "Whereami?",
        "default_popup": "popup/geo.html"
      },
    
      "permissions": ["webNavigation"],
    
      "version": "0.1",
    
      "user_scripts": {
        "api_script": "apiscript.js"
      },
    
      "web_accessible_resources": ["images/my-image.png"]
    }
    

## [Browser compatibility](#browser_compatibility)

## [See also](#see_also)

[`permissions`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions) JavaScript API