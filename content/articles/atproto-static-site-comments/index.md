+++
title = "atproto as a static site's comment section"
date = 2025-07-13
description = "Publish on your own site, discuss on bluesky"
tags = ["atproto"]
embed_image = "/articles/atproto-static-site-comments/embed3.png"
+++

skip to [§comment-section](#comment-section) to see it in action.

![@ATProtocol Logo overlayed on a blurred comment section that looks similar to the bluesky social media site.](./hero.png)

Accepting comments is cool, swapping from a very cacheable and easy to keep alive static site to something interactive can be a pain.  
Embedding a live comment section into a static site has become fairly popular in the last decade;[^embed_history] these solutions don't typically integrate well with social media that viewers are familiar with.    
I was inspired to implement comment embedding on lunnova.dev after seeing gracekind.net's comment section.[^gracekind]

[atproto](https://atproto.com/) is the decentralized[^ish] protocol behind bluesky.

## why atproto?
Core reason: **I like interacting on bsky**. Some less personal justifications:

- there's a free API I can call without worrying about traffic to it from my small site being a problem
- bsky's built-in moderation tools for disconnecting replies allow pruning bad comments
- atproto data is extremely scrapeable and exportable
  - if the platform dies out, is superceded, or public APIs become hard to find we can scrape old comments to make them a permanent archive

## how atproto?

We'll be focusing on a very minimal interaction with an atproto AppView today. An AppView is responsible for redistributing content to clients.  
For today's project we will make one call to the `public.api.bsky.app` AppView, `getPostThread`. 

We could call an alternative AppView that supports the `app.bsky` RPCs like the one associated with futur.blue's zeppelin.social. If you do, I urge you to fund the AppView you're relying on to ensure that it's sustainable.

## invoking app.bsky.feed.getPostThread

The bsky AppView's [app.bsky.feed.getPostThread docs](https://docs.bsky.app/docs/api/app-bsky-feed-get-post-thread) show that we need a uri, and optionally a depth.

Let's try it out by writing a minimal example that can display a recent [tangled.sh update post.](https://bsky.app/profile/tangled.sh/post/3lptwcb47kc2u) without replies.

### Simplified JSX fetch & markup example

Fetch:

```js
$ let resp = await fetch("https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at%3A%2F%2Ftangled.sh%2Fapp.bsky.feed.post%2F3lptwcb47kc2u&depth=0");
$ let thread = await resp.json(); thread
{"thread": { "post": {
  "author": {
    "handle": "tangled.sh", "displayName": "Tangled",
    "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:wshs7t2adsemcrrd4snkeqli/bafkreieng4ts4h6g7prbdiaseag3lmsewxwzbxmexy2qqd5uebq5pe567e@jpeg"
  },
  "record": {
    "text": "gm tanglers, we have got an assortment of updates for y'all! first up: \n\nnative support for stacked PRs with #jj-vcs!\n\nwhat this means:\n- you can break down that mega PR into smaller ones\n- reviewers can review/comment/merge each one individually\n- ✨nobody is blocked✨"
  },
}}}
```

JSX:

```html
<><div>
    <img src={thread.post.author.avatar.replace("/avatar/", "/avatar_thumbnail/")} alt={thread.post.author.displayName}/>
    <div>
      <div>{thread.post.author.displayName}</div>
      <div>@{thread.post.author.handle}</div>
    </div>
  </div>
  <div>
    {thread.post.record.text}
  </div>
</>
```

Resulting elements:

<p><div style="background-color: #161e27;padding: 1em 1em 0.5em 1em;border-radius: 8px;font-size: 15px;line-height: 1.5;max-width: 600px;margin: 0 auto;">
<div style="display: flex; align-items: center;">
<img 
src="https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:wshs7t2adsemcrrd4snkeqli/bafkreieng4ts4h6g7prbdiaseag3lmsewxwzbxmexy2qqd5uebq5pe567e@jpeg" 
alt="Tangled"
style="width: 32px;height: 32px;border-radius: 50%;margin-right: 8px;"
/>
<div><div style="color: #e4e9ed; font-weight: 600;">Tangled</div>
<div style="color: #8b98a5; font-size: 14px;">@tangled.sh</div></div></div>
<div style="color: #e4e9ed; white-space: pre-wrap;">gm tanglers, we have got an assortment of updates for y'all! first up:<br>
native support for stacked PRs with #jj-vcs!
what this means:
- you can break down that mega PR into smaller ones
- reviewers can review/comment/merge each one individually
- ✨nobody is blocked✨</div>
</div></p>

For our full implementation we need to render replies, facets (@mentions, liks) and embeds.  
The rest of the owl can be found at [github:LunNova/x](https://github.com/LunNova/x/tree/main/atproto-comments)/atproto-comments.

## integrating this into your site

1. Make [atproto-comments.js](https://github.com/LunNova/x/tree/main/atproto-comments) and its associated css file available on your site
1. Publish your post normally.
2. Start a thread on bluesky about your post.
3. Add the comment section with a reference to that post[^at_uri]

```html
<div id="comment-section"></div>
<script type="module" defer>
import Comments from '/atproto-comments.js';
new Comments(
    document.getElementById('comment-section'),
    "/comments.css",
    'https://public.api.bsky.app/',
    'at://did:plc:j3hvz7sryv6ese4nuug2djn7/post/3ltikv7zewc2l'
).render();
</script>

```

If you find `atproto-comments` useful, let me know. This project is intended mostly as a fire and forget finished project; I encourage copying it to your own site and changing it to fit your site as needed. PRs welcome if you find something generally applicable to fix.

You might be able to comment on this post on the fediverse [@ fed.brid.gy/bsky/lunnova.dev](https://fed.brid.gy/bsky/lunnova.dev) thanks to bridgy fed.  
You'll need to follow `@bsky.brid.gy@bsky.brid.gy` to activate bridging your replies back to atproto for them to show up here.

---

[^embed_history]: A mix of solutions have become popular ranging from commercial projects like disqus, to [repurposing github comments](https://utteranc.es/), to purpose built self hostable embeddable comment sections like [statique](https://github.com/LeeHolmes/statique/) or [uncomment](https://github.com/nielssp/uncomment)
[^gracekind]: gracekind.net's [blog section](https://gracekind.net/blog/) has a bsky comments section on all posts as of 202506. See [Why Aren't Human-Bot Conversations More Engaging?](https://gracekind.net/blog/humanbotconversations/#comments-section) for an example
[^ish]: atproto is theoretically quite decentralized. In practice the majority of people who may see your content are using a Bluesky PBC web app that connects to services owned by the same company, but in cases of bsky PBC service outages people on their own infra have been able to keep posting and interacting through the outages. Hoping to avoid a bunch of nitpicking about how decentralized it is by putting this ref note in; I may be sowing my own demise here.
[^at_uri]: You can find the permanent at:// URI from the bsky webapp by looking at the uri field in the response to the getPostThread call the webapp makes when you view the post. It should start `at://did:`. If you're doing this often, [at://wormhole](https://at.wormhole.mosphere.at/) by @alice.mosphere.at makes this more convenient. Pick the pdsls option on its dropdown then copy the URI.

---

<div id="comment-section"></div>
<script type="module" defer>
import Comments from '/atproto-comments.js';
new Comments(
    document.getElementById('comment-section'), // where to inject the comments
    "/comments.css", // comments specific CSS
    'https://public.api.bsky.app/', // AppView base URL for API call
    'at://did:plc:j3hvz7sryv6ese4nuug2djn7/app.bsky.feed.post/3ltugqwgia22c' // URI of the root of the thread to load
).render();
</script>
