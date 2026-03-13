+++
title = "<link rel=alternate>"
date = 2025-07-07
description = "Alternate representations of pages are neat; sadly not surfaced by browsers"
tags = ["semantic-web"]
draft = true
+++

This page has a few `<link rel=alternate>`[^html5_spec] tags. Did your browser tell you about them?

When a `type` field is present on a `rel=alternate` `link` this signals that the current document is available in another format. `type`'s a media type[^media_type], like `text/markdown` or `application/pdf`.

Some browsers used to indicate[^rss_button] when a page had a feed referenced by an alternate with `type=application/rss+xml` or `type=application/atom+xml`.

I've been experimenting with alternates on this site as part of a fixation on [[semantic web]] metadata.

TODO: `<aside>`?

---

[^html5_spec]: [4.8.4.1 Link type "alternate"](https://www.w3.org/TR/2014/REC-html5-20141028/links.html#rel-alternate) defines three main cases for `rel=alternate` is intended to be used. Alternate languages, alternate media types, and a special case for feeds.
[^media_type]: [Media types](https://www.iana.org/assignments/media-types/media-types.xhtml) are a registry managedby IANA, mapping short names to a specific format. Media types were formerly known as MIME (Multipurpose Internet Mail Extensions), and initially used to identify the format of email attachments.
[^rss_button]: The removal of the RSS button IMO is part of a wider shift towards reliance on centralized social media to aggregate content over visiting smaller creators and platforms directly. [Browsers should bring it back](https://openrss.org/blog/browsers-should-bring-back-the-rss-button) via openrss.org.