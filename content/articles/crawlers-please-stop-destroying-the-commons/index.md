+++
title = "Crawler operators, please stop destroying the commons"
date = 2025-04-19
description = "Goodwill for crawling/scraping has rapidly been depleted"

[extra]
icon = "/articles/crawlers-please-stop-destroying-the-commons/rip-git-forges.png"

[taxonomies]
tags = ["rant"]
+++


<figure>

![](./rip-git-forges.png)

<figcaption>

Badly edited "Silent Protector" meme showing Techaro [Anubis](https://github.com/TecharoHQ/anubis) defending the Gitea and Forgejo logos from an influx of logos associated with scraping. Anubis mascot by [CELPHASE](https://bsky.app/profile/celphase.bsky.social).

</figcaption>
</figure>

Wanted to grab a lot of data for your project or research? We had a tool for that called public datasets[^CC].

"Hello I would like to `GET /myFirstReactProject/commits/c33fe277` 50 times from different IPs just in case it changed in the last 5 femtoseconds"

They have played us for absolute fools.


Stop writing new poorly made crawlers and taking down people's services[^AmznBot] through excessive crawling.  
We do not need thousands of barely tested web crawlers grabbing the same pages; each a new opportunity for poorly thought out or broken pacing to hit sites with denial of service levels of traffic.  
Please please please just[^Just] use common crawl data.

We're rapidly heading towards the point where everyone is rightfully running anti-bot tech[^Anubis] to keep their services up because we couldn't do the sensible thing and use the massive open crawl dataset that's a community project, instead we all had to have our own Special Sauce at each company because I guess that's more impressive than "yeah I downloaded common crawl".

There used to be goodwill towards crawlers, an understanding that we needed them to find content.  
Oops, burned all the goodwill.

Nobody benefits from this new equilibrium.

---

[^CC]: [Common Crawl](https://commoncrawl.org/) is a nonprofit 501(c)(3) organization that crawls the web and freely provides its archives and datasets to the public. Common Crawl's web archive consists of petabytes of data collected since 2008.

[^AmznBot]: [Amazon's AI crawler is making my git server unstable](https://xeiaso.net/notes/2025/amazon-crawler/)

[^Just]: "If your solution to some problem relies on “If everyone would just…” then you do not have a solution. [Everyone is not going to just](https://squareallworthy.tumblr.com/post/163790039847/everyone-will-not-just). At no time in the history of the universe has everyone just, and they’re not going to start now."

[^Anubis]: [Anubis](https://github.com/TecharoHQ/anubis) weighs the soul of your connection using a sha256 proof-of-work challenge in order to protect upstream resources from scraper bots.
