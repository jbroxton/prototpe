# https://support.mozilla.org/en-US/kb/https-only-prefs

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 2 weeks, 5 days ago ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)64% of users voted this helpful

HTTPS-Only Mode in Firefox forces all connections to websites to use a secure encrypted connection called HTTPS. Most websites already support HTTPS; some support both HTTP and HTTPS. Enabling this mode guarantees that all of your connections to websites are upgraded to use HTTPS and hence secure. Learn more about the benefits and how to enable HTTPS-Only Mode.

## Table of Contents

*   [1 What is the difference between HTTP and HTTPS?](#w_what-is-the-difference-between-http-and-https)
*   [2 About HTTPS-Only Mode](#w_about-https-only-mode)
*   [3 Enable/Disable HTTPS-Only Mode](#w_enabledisable-https-only-mode)
*   [4 “Secure Site Not Available” page](#w_secure-site-not-available-page)
*   [5 Turn off HTTPS-Only Mode for certain sites](#w_turn-off-https-only-mode-for-certain-sites)
*   [6 Add exceptions for HTTP websites when you’re in HTTPS-Only Mode](#w_add-exceptions-for-http-websites-when-youre-in-https-only-mode)

## What is the difference between HTTP and HTTPS?

[HTTP](https://wikipedia.org/wiki/Hypertext_Transfer_Protocol) stands for Hypertext Transfer Protocol. It is the fundamental protocol for the web and encodes basic interactions between browsers and web servers. The problem with the regular HTTP protocol is that the data transferring from server to browser is not encrypted, meaning data can be viewed, stolen or altered. [HTTPS](https://wikipedia.org/wiki/HTTPS) protocols fix this by using a Transport Layer Security (TLS) certificate. This creates a secure encrypted connection between the server and the browser, which protects sensitive information.

## About HTTPS-Only Mode

When you use HTTPS-Only Mode, this ensures all of your connections are encrypted and secure. So you have peace of mind that no one can snoop on the content of the pages you visit or hack into your connection to a website to steal your passwords, credit card information or other personal information. This is especially useful when you are using a public Wi-Fi, where you can’t be sure of the integrity of your internet connection.

For example, when HTTPS-Only Mode is active and a site is visited such as `http://example.com`, Firefox will silently upgrade to `https://example.com`:

![ConnectionUpgradeExample](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/placeholder.688345f843bb37ed.gif)

## Enable/Disable HTTPS-Only Mode

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  Select from the left menu.
3.  Scroll down to _HTTPS-Only Mode_.
4.  Use the radio button to select whether to enable or disable HTTPS-Only Mode, or select to only enable it for [private windows](https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history).
    
    ![Fx90HTTPS-OnlyModeSettings](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-07-26-15-12-54-a011a8.png)![Fx135settings-HTTPSOnlyMode](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-02-18-03-59-18-6bed2f.png)![Fx136settings-HTTPSOnlyMode](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-02-18-04-00-22-679da9.png)
    

To learn more about upgrades to secure connections, see [Firefox connection upgrades - HTTP to HTTPS](https://support.mozilla.org/en-US/kb/https-upgrades).

## “Secure Site Not Available” page

Some websites only support HTTP and the connection cannot be upgraded. If HTTPS-Only Mode is enabled and an HTTPS version of a site is not available, you will see a _Secure Site Not Available_ page.

![Fx134HTTPS-OnlyModeAlert](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-01-14-13-09-42-78162a.png)

*   Click Continue to HTTP Site to accept the risk, and visit an HTTP version of the site. HTTPS-Only Mode will be turned off temporarily for that site.
*   Click Go Back if you want to avoid any unencrypted connections.

## Turn off HTTPS-Only Mode for certain sites

If HTTPS-Only Mode is enabled, and you frequently visit a website that does not support HTTPS or does not seem to be rendering certain elements of the page correctly, you can turn off HTTPS-Only Mode for that site.

1.  Click the padlock ![Fx89Padlock](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-04-33-33-7bdc86.png) in the address bar.
2.  Use the dropdown under _Automatically upgrade this site to a secure connection_ and select .
    
    ![Fx134HTTPS-OnlySite-OFF](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-01-14-14-01-52-ced9f1.png)
    

1.  Click the padlock ![Fx89Padlock](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-06-04-33-33-7bdc86.png) in the address bar.
2.  Use the dropdown under _HTTPS-Only Mode_ and select .
    
    ![Fx115HTTPS-OnlySite-OFF](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-01-17-01-54-35-4ea582.png)
    

## Add exceptions for HTTP websites when you’re in HTTPS-Only Mode

If a website isn’t displaying correctly, and it’s one you trust and want to visit, you can turn off HTTPS-Only Mode for that site. Exceptions allow you to visit an HTTP version of a website while you’re browsing in HTTPS-Only Mode. Exceptions can be applied temporarily for a single browsing session, or permanently. To add an exception for a website:

1.  In the Menu bar at the top of the screen, click and select (select on older macOS versions).Click the menu button ![Fx89menuButton](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-05-15-11-18-38-e5b736.png) and select .
2.  Select from the left menu.
3.  Scroll down to _HTTPS-Only Mode_.
4.  Select **Enable HTTPS-Only Mode in all windows**.
5.  Click to open the _Exceptions_ dialog.
    
    ![Fx90HTTPS-OnlyModeExceptions](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2021-07-26-15-14-03-e391da.png)
    
6.  Type in the exact address of the HTTP website for which you want to turn off HTTPS-Only Mode.
7.  Select to permanently turn off HTTPS-Only Mode for that website, or select to turn it off for your current browsing session.
8.  Click Save Changes.

These fine people helped write this article:

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**