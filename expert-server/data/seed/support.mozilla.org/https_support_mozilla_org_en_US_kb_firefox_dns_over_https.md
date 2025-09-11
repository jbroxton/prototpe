# https://support.mozilla.org/en-US/kb/firefox-dns-over-https

[![](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/products/2020-04-14-08-36-13-8dda6f.png)](https://support.mozilla.org/en-US/products/firefox "Firefox")

Firefox Firefox ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/pencil.e33c563f24c4f989.svg) **Last updated:** 6/5/25 ![](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/thumbs-up.2cbd5d41625a84a7.svg)62% of users voted this helpful

This article describes DNS over HTTPS and how to enable, edit settings, or disable this feature.

## Table of Contents

*   [1 About DNS over HTTPS](#w_about-dns-over-https)
*   [2 Benefits](#w_benefits)
*   [3 Risks](#w_risks)
*   [4 About our rollout of DNS over HTTPS](#w_about-our-rollout-of-dns-over-https)
*   [5 Opt-out](#w_opt-out)
*   [6 Enable, disable and configure DNS over HTTPS](#w_enable-disable-and-configure-dns-over-https)
*   [7 Configure Networks to Disable DoH](#w_configure-networks-to-disable-doh)
*   [8 Encrypted Client Hello (ECH)](#w_encrypted-client-hello-ech)

## About DNS over HTTPS

When you type a web address or domain name into your address bar (example: [www.mozilla.org](https://www.mozilla.org/)), your browser sends a request over the Internet to look up the IP address for that website. Traditionally, this request is sent to servers over a plain text connection. This connection is not encrypted, making it easy for third-parties to see what website you’re about to access.

[DNS over HTTPS](https://wikipedia.org/wiki/DNS_over_HTTPS) (DoH) works differently. It sends the domain name you typed to a DoH-compatible DNS server using an encrypted HTTPS connection instead of a plain text one. This prevents third-parties from seeing what websites you are trying to access.

## Benefits

DoH improves privacy by hiding domain name lookups from someone lurking on public Wi-Fi, your ISP, or anyone else on your local network. DoH, when enabled, ensures that your ISP cannot collect and sell personal information related to your browsing behavior.

## Risks

*   Some individuals and organizations rely on DNS to block malware, enable parental controls, or filter your browser’s access to websites. When enabled, DoH bypasses your local DNS resolver and defeats these special policies. When enabling DoH by default for users, Firefox allows users (via settings) and organizations (via enterprise policies and a canary domain lookup) to disable DoH when it interferes with a preferred policy.
*   When DoH is enabled, Firefox by default directs DoH queries to DNS servers that are operated by a trusted partner, which has the ability to see users' queries. Mozilla has a strong [Trusted Recursive Resolver (TRR) policy](https://wiki.mozilla.org/Security/DOH-resolver-policy) in place that forbids our partners from collecting personal identifying information. To mitigate this risk, our partners are contractually bound to adhere to this policy.
*   DoH could be slower than traditional DNS queries, but in testing, we found that the [impact is minimal and in many cases DoH is faster](https://blog.mozilla.org/futurereleases/2019/04/02/dns-over-https-doh-update-recent-testing-results-and-next-steps/).

## About our rollout of DNS over HTTPS

We completed our rollout of DoH by default to all United States Firefox desktop users in 2019 and to all Canadian Firefox desktop users in 2021. We began our rollout by default to Russia and Ukraine Firefox desktop users in March 2022. We are currently working toward rolling out DoH in more countries. As we do so, DoH is enabled for users in “fallback” mode. For example, if the domain name lookups that are using DoH fail for some reason, Firefox will fall back and use the default DNS configured by the operating system (OS) instead of displaying an error.

## Opt-out

You can opt out of using DoH or choose a custom DoH provider in the **DNS over HTTPS** Firefox settings.

![dnsoverhtttps](https://assets-prod.sumo.prod.webservices.mozgcp.net/media/uploads/gallery/images/2025-06-05-12-56-08-52c6dd.png)

In addition, Firefox will check for certain functions that might be affected if DoH is enabled, including:

*   Are parental controls enabled?
*   Is the default DNS server filtering potentially malicious content?
*   Is the device managed by an organization that might have a special DNS configuration?

If any of these tests determine that DoH might interfere with the function, DoH will not be enabled. These tests will run every time the device connects to a different network.

## Enable, disable and configure DNS over HTTPS

See the [Configure DNS over HTTPS protection levels in Firefox](https://support.mozilla.org/en-US/kb/dns-over-https) article.

## Configure Networks to Disable DoH

*   [Configure networks to disable DNS over HTTPS](https://support.mozilla.org/en-US/kb/configuring-networks-disable-dns-over-https)
*   [DNS over HTTPS (DoH) FAQs](https://support.mozilla.org/en-US/kb/dns-over-https-doh-faqs)

## Encrypted Client Hello (ECH)

With [Firefox version](https://support.mozilla.org/en-US/kb/find-what-version-firefox-you-are-using) 118, we rolled out a significant security feature: the Encrypted Client Hello (ECH). Its primary role is to reinforce the security of the initial connection _handshake_ made during online interactions. ECH, in conjunction with DNS over HTTPS (DoH), takes browsing security up a notch:

*   **DoH as a prerequisite:** In Firefox's implementation, ECH relies on DoH to fetch the necessary encryption keys for the _handshake_. Without DoH activated, ECH cannot operate.
*   **Synergized protection:** DoH works by encrypting DNS queries, effectively safeguarding the conversion of website names to IP addresses. On the other hand, ECH focuses on encrypting the initial exchanges between the user and the website. Together, they present a comprehensive defense against many online threats.
*   **Enhanced protection:** With both ECH and DoH enabled, users gain an enhanced dual-layer of privacy, diminishing potential vulnerabilities and amplifying online discretion.

Ensure DoH is enabled in Firefox to fully benefit from the security enhancements provided by ECH. For a detailed understanding, see [Understand Encrypted Client Hello (ECH)](https://support.mozilla.org/en-US/kb/understand-encrypted-client-hello) and [Encrypted Client Hello (ECH) - Frequently asked questions](https://support.mozilla.org/en-US/kb/faq-encrypted-client-hello).

These fine people helped write this article:

[AliceWyman](https://support.mozilla.org/en-US/user/AliceWyman/), [Michele Rodaro](https://support.mozilla.org/en-US/user/michro/), [Mozinet](https://support.mozilla.org/en-US/user/Mozinet/), [Wesley Branton](https://support.mozilla.org/en-US/user/ComputerWhiz/), [Joni](https://support.mozilla.org/en-US/user/heyjoni/), [Paul](https://support.mozilla.org/en-US/user/plwt/), [Marcelo Ghelman](https://support.mozilla.org/en-US/user/marcelo.ghelman/), [Lamont Gardenhire](https://support.mozilla.org/en-US/user/Lamont287/), [Angela Lazar](https://support.mozilla.org/en-US/user/anlazar/), [Fabi](https://support.mozilla.org/en-US/user/Fabi.L/), [Bithiah](https://support.mozilla.org/en-US/user/VintageMind/), [Denys](https://support.mozilla.org/en-US/user/denyshon/), [Lucas Siebert](https://support.mozilla.org/en-US/user/lsiebert/), [Flavius Floare](https://support.mozilla.org/en-US/user/ffloare/)

![Illustration of hands](https://assets-prod.sumo.prod.webservices.mozgcp.net/static/volunteer.a3be8d331849774b.png)

### Volunteer

Grow and share your expertise with others. Answer questions and improve our knowledge base.

**[Learn More](https://support.mozilla.org/en-US/contribute)**