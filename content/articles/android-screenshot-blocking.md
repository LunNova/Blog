+++
title = "Android's screenshot blocking is user hostile; a portent of things to come?"
date = 2024-04-11
updated = 2025-06-24

[taxonomies]
tags = ["griping", "android", "security"]
+++

This post might not be of much value. It's mostly me being grumpy, feel free to skip over it.

Android allows app developers to mark activities as `FLAG_SECURE`. This blocks you from taking screenshots when that activity is on screen.

I'm holding my phone and I can see what's on the screen but I can't take a screenshot using a physical button press.  
This isn't protecting me from someone snooping on my bank by taking screenshots using another app, if it was about preventing other apps from taking sensitive screenshots the physical button combination should still work.

The analog hole still exists. My phone screen emits photons, I can pick up another phone and take a picture.

So here I am digging out another device to report a bug to my bank because they used a feature that shouldn't exist to stop me taking a screenshot of their app.

My phone doesn't feel like a device I own. It feels like I'm using Google and Samsung's device, and sometimes they deign to let me do something with it.
If I wanted to install a custom ROM which fixes this I can't because then I won't be able to use banking apps at all, thanks to safetynet.

I worry about the future of desktop computers.  
Sure, TPMs and attestation can be used well[^1]. But if the industry decides to wield them like on mobile, we could lose the freedom we've long enjoyed on our PCs. Valorant's anti-cheat relies on attestation and secure boot already - preventing development of custom drivers which I rely on heavily on the Linux side of things[^2] - and now I expect other games to follow suit.

Imagine not being able to take a screenshot of your own desktop because some app decided it's "too sensitive". Or being unable to run your favorite software because it hasn't been "approved" by your operating system's gatekeepers.

My desktop still feels like a device I own. But for how long? Will we soon be reduced to mere licensees of our own hardware, begging for permission to do basic tasks?

I hate tech sometimes. I feel like I can infer the future we're about to leap into, and it's not a good one.

:(

----

2025 Update: I've become aware of the same issue with call recordings. Apps and Android conspire to prevent recording calls, whether through your cell carrier or an E2E encrypted messaging app.  
It's a sham. We add friction but the analogue hole continues to exist.  
There are purpose built devices that connect as a bluetooth headset and record both sides like the "PR200 Call Recorder".
Gotta buy some special device if I want to record something on my "personal" phone without failing Google's attestation.

---

[^1]: Some of my friends get really excited about TPMs and attestation and have done cool things with them, and simple FDE with LUKS+TPM is a solid example of how TPMs can be useful.
[^2]: I'm looking at you, amd "A solid tenth of the amdgpu mailing list is randomly moving fences around playing whackamole and hoping they'll finally get it not to hang" gpu and the [DRM scheduler](https://vt.social/@lina/113079863228537747). [Patches patches patches patches](https://github.com/LunNova/nixos-configs/tree/6bafa2543690cf843345e8c60e94886036daf2d2/hosts/hisame/kernel). That's not even getting into how my entire system is capable of being built from source because it's NixOS, and I frequently patch random packages when necessary. If we use attestation to insist that these components haven't been tampered with then how am I supposed to develop on a live system?!
