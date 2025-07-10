+++
title = "FSF makes claim that Anubis WAF is malware"
date = 2025-07-08
description = "Area foundation runs into crawler problem, negs least bad general solution."
tags = ["rant"]
+++

*Personal opinion. Not speaking for any org, project, friend, employer or associates.*

> If we made our website use Anubis, we would be pressuring users into running malware

[^fsf_claim]

The Free Software Foundation has claimed that [Anubis](https://anubis.techaro.lol/) — a web application firewall which supports proof of work challenges — runs malware on visitors' machines.

Anubis is a response to a real issue that's causing outages and huge hosting bills for small service providers.  
See [crawlers must stop destroying the commons](/articles/crawlers-please-stop-destroying-the-commons/)'s footnotes for  many specific instances of badly behaved crawlers.  

Giving a proof of work JS challenge with a blatant message that it's running to a suspicious client is the lesser of many evils here and should not be decried as malware. The competing alternatives tend to fail hard closed, or worse serve an unsolvable challenge.[^cf_unsolvable]  
I much prefer having to burn some compute for access to a webpage over being stuck unable to access it at all because the site is down from crawler load or because Cloudflare's opaque challenge system thinks I'm sus.

The FSF has had strong historic stances against the idea of treating software as inherently wrong, or criminal, based on specific illegitimate usecases of it.

> This isn't the first time that law enforcement has worked to shut down a Tor relay -- in fact, it's common for those who run relays to be harassed by police.
>
> The stated justification is usually that anonymity software can be used by criminals, but by that argument, roads should also be illegal because some people drive drunk.

[^fsf_analogy]

Surely the same nuance applies when proof of work is used to protect overloaded websites[^anubis_load], in the form of a visible challenge screen. Must we bar all usage of it because it is often used to mine cryptocurrency?

It is disappointing but unsurprising to see the FSF make claims that disagree with the core of their historic arguments in favor of anonymity software and DRM removal tools.

The Free Software Foundation's mission of promoting computer user freedom benefits from having Anubis around. It protects many software forges[^anubis_users] relied on by free software providers such as the freedesktop gitlab.  
I'm sure the FSF would not prefer that freedesktop set up cloudflare, a proprietary HTTPS decrypting proxy service!

FSF, please retract the claim that Anubis is malware. You don't have to use it; calling legitimate anti-denial of service measures malware is going too far.

---

[^fsf_claim]: "The Anubis JavaScript program's calculations are the same kind of calculations done by crypto-currency mining programs. A program which does calculations that a user does not want done is a form of malware. Proprietary software is often malware, and people often run it not because they want to, but because they have been pressured into it. If we made our website use Anubis, we would be pressuring users into running malware. Even though it is free software, it is part of a scheme that is far too similar to proprietary software to be acceptable." [Our small team vs millions of bots](https://www.fsf.org/blogs/sysadmin/our-small-team-vs-millions-of-bots) [Archived](https://archive.is/zk1K2)
[^cf_unsolvable]: [Impassable Cloudflare challenges are ruining my browsing experience](https://news.ycombinator.com/item?id=42577076) - "I travel often. Sometimes I use a VPN, sometimes I don't. I use a heavily customized Firefox config on Linux. Cloudflare challenges have made large portions of the web unusable for me." ~blakeashleyjr on Hacker News
[^fsf_analogy]: Banning roads due to drunk driving analogy [argued by Zak Rogoff on the FSF blog.](https://www.fsf.org/blogs/community/tor-relay-reinstated-in-the-kilton-library-a-win-for-free-software-based-anonymity)
[^anubis_load]: Anubis has a pre-release version with a feature that allows dynamically serving challenges only when the host is overloaded, or in tandem with other rules. This allows only challenging visitors when the site is struggling. [github:TecharoHQ/Anubis release v1.21.0-pre1](https://github.com/TecharoHQ/anubis/releases/tag/v1.21.0-pre1)
[^anubis_users]: Anubis protects free software infrastructure including The Linux Foundation's git.kernel.org and lore.kernel.org, gitlab.freedesktop.org, gitlab.gnome.org, FreeBSD's svnweb.freebsd.org, FFmpeg's trac.ffmpeg.org, the Arch Linux wiki, git.devuan.org, hydra.nixos.org, Codeberg.org, gitlab.postmarketos.org, ReactOS infrastructure, and Sourceware.org (home to GCC and glibc development). [Full list of known Anubis users](https://anubis.techaro.lol/docs/user/known-instances)

---

<div id="bsky-comments"></div>

<script type="module" defer>
import BskyComments from '/bsky-comments.js';

new BskyComments(
    'https://bsky.app/profile/did:plc:j3hvz7sryv6ese4nuug2djn7/post/3ltikv7zewc2l',
    document.getElementById('bsky-comments')
).render();
</script>
