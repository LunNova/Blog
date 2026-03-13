+++
title = "202506 Snippets"
date = 2025-06-30
description = "Linkpost for June 2025. X11 has absolute scaling if you're brave! We can weed with lasers! nuke the seabed to fix the climate‽"
aliases = ["articles/202506-snippets-links"]

[taxonomies]
tags = ["snippets"]
+++

> This is the hottest summer of my life  
> This is the coldest summer of the rest of your life

## Posts

[X11 CRTC data provides enough information to scale to real sizes, assuming your EDID data is accurate](https://flak.tedunangst.com/post/forbidden-secrets-of-ancient-X11-scaling-technology-revealed) — flak.tedunangst.com  

[The end of lead](https://worksinprogress.co/issue/the-end-of-lead/) — worksinprogress.co, Issue 19  
"Lead has been all but eliminated in most of the developed world. Doing the same for the rest of the world might not be difficult."

[Can you fool the perfect predictor?](https://gracekind.net/newcombs) — gracekind.net  
Reverse engineering recommended, widely reported as a frustrating page.

### Visions of the future

[Laser weeding works! Begone, pesticides with off-target impacts.](https://scijournals.onlinelibrary.wiley.com/doi/10.1002/ps.8912) — Sosnoskie et al., 2025, Pest Management Science  
[phys.org article on the study.](https://phys.org/news/2025-06-lasers-common-herbicides-zapping-east.html)

[Nuclear Explosions for Large Scale Carbon Sequestration](https://arxiv.org/pdf/2501.06623v1) — Andy Haverly, Rochester Institute of Technology  
Is it too soon to plan for this?

[Engineering Earth (Video)](https://www.youtube.com/watch?v=rN5f72lhJz8)  
Various futuristic large scale engineering projects involving our home, with animations.

### AI

An interesting set of exchanges about Anthropic's Claude 4 model card misalignment scenarios between Evan Hubinger and nostalgebraist that [started on tumblr](https://nostalgebraist.tumblr.com/post/787119374288011264/welcome-to-summitbridge) and [ended up on lesswrong](https://www.lesswrong.com/posts/HE3Styo9vpk7m8zi4/evhub-s-shortform?commentId=uAdgsqWftrZcgb7Es#uAdgsqWftrZcgb7Es).


[Actually stopping AI scrapers from taking down my server](https://jade.ellis.link/blog/2025/05/18/actually-stopping-forgejo-ai-scraping) — jade.ellis.link  
Another case of misbehaving scrapers. Related homegrown article: [Crawlers, please stop …](../crawlers-please-stop-destroying-the-commons).

## Programming

[binary-size-profiler is a non language specific tool for visualizing what's taking up space in a binary](https://github.com/jrmuizel/binary-size-profiler) ­— github/jrmuizel/binary-size-profiler

[rerun is a multi-modal data stream visualization tool](https://github.com/rerun-io/rerun) — rerun.io  
[Using rerun for gamedev](https://youtu.be/dVk_kZ9VSDA) at the 2023 Rust Gamedev Meetup 

[flux aims to bring refinement type checking to rust](https://flux-rs.github.io/flux/tutorial/01-refinements.html) — github/flux-rs  
flux implements additional checks only and does not allow you to take advantage of what you've proved for optimization purposes or to prune impossible pattern matching arms.
