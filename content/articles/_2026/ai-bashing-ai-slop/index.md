+++
title = "AI generated posts about AI failures"
description = "reddit is unusable"
date = 2026-02-16
tags = ["rant"]
+++

*Personal opinion. Not speaking for any org, project, friend, employer or associates.*

<figure>

![](./reddit-sysadmin-post.png)

<figcaption>AI generated /r/sysadmin post about a failed "ai transformation"</figcaption>
</figure>

There seems to be some new law of the internet recently. I keep being sent or stumbling onto posts about AI — and especially ones downplaying AI hype — that are themselves AI generated and highly shared.

A friend linked [The Singularity will Occur on a Tuesday](https://campedersen.com/singularity) from campedersen.com after finding it on [news.ycombinator.com](https://news.ycombinator.com/item?id=46962996), where it received over 1000 votes.

Kind of a fun post! Does some silly modelling about when the singularity will occur. But it's very verbose, and the writing tastes[^pangram] like it was uttered by a language model and not even given an editing pass by the site owner.  
I don't need to read Claude making this 3× as long. Keeping the modelling and trimming it way down would have been better! at least the concept is funny. don't regret skimming it.

Browsing /r/sysadmin on the same day. Click into a post titled "our 'ai transformation' cost seven figures and delivered a chatgpt wrapper". Suspicious from the title already, the short quote style seeming very langle mangle coded… oh dear. Yep. AI output with signature last sentence short hook.  
Maybe I'm just grumpy and wrong. What does pangramlabs think? [100% AI](./pangram-reddit-sysadmin-post.png). great. ≈2000 upvotes, 99% upvoted. Wow. People really love the AI creative writing that tells them what they want to hear: that AI is going to flop.

Swap to /r/analysis, see another post that smells of AI about how AI has been making up their analytics data. Doesn't to me read like AI tidy up of human input, reads like an AI asked to write the whole story. What does pangram think? [100% AI again](./pangram-reddit-analysis-post.png).  
≈2000 upvotes, 96% upvoted. At least that post got taken down.

What takeaway do we have from people being en masse enthralled by AI generated tales about how bad AI is?  
I don't know.  
I feel like I should have some concrete conclusion here but all that's falling out is being grumpy that reddit is unusable.

---

**Update:** later this day I was sent *¡another!* anti-AI piece that is itself in [all likelihood AI generated](pangram-theregister-post.png), somehow [published in El Reg.](https://www.theregister.com/2026/02/16/semantic_ablation_ai_writing/). Classic "… are not just X we are Y" patterns that frontier models won't hit these days. Old-school slop! Unsure if some sort of experiment on their readerbase.  
[Hacker News commenters seem mostly unaware that the post is AI output](https://news.ycombinator.com/item?id=47049088), despite the presence of some easily recognized AI knowers like simonw.  
I've emailed The Register's editor to inquire about the provenance of the article and will update here if I get anything interesting back (or am mistaken)

New takeaway: *the entire internet is unusable*

---

[^pangram]: pangram labs [thinks large blocks are ai](./pangram-singularity-article.png) generated, although it misses the middle section with the diagram which I pasted with no attempt to preserve the formatting. pangram labs' detector is known for being easy to bypass but if it says something's AI that's very likely true. I am aware of exactly one successful human written detected as AI case [from vgel.me](https://x.com/voooooogel/status/2003614491230298125) deliberately writing in Claude's style. [Pangram is the only AI detector with a usable false positive rate as of the start of 2026](https://www.pangram.com/blog/third-party-pangram-evals), at the expense of often missing AI text.

---

<div id="comment-section"></div>
<script type="module" defer>
import Comments from '/atproto-comments.js';
new Comments(
    document.getElementById('comment-section'), // where to inject the comments
    "/comments.css", // comments specific CSS
    'https://public.api.bsky.app/', // AppView base URL for API call
    'at://did:plc:j3hvz7sryv6ese4nuug2djn7/app.bsky.feed.post/3mf2t7mmhms23' // URI of the root of the thread to load
).render();
</script>
