+++
title = "UPNP on a NixOS router"
date = 2022-10-29
description = "UPNP on a NixOS router"

[taxonomies]
tags = ["nixos", "for_future_lun", "linux", "homelab"]
+++

NixOS has UPNP server/daemon and client packages and modules so it's pretty easy to set this up.

### miniupnpd - UPNP Server

If you're using the standard NixOS firewall and NAT options configure it like this:

```nix
  services.miniupnpd = {
    enable = true;
    externalInterface = "eno2"; # WAN
    internalIPs = [ "eno1" ]; # LAN
  };
```

If you're using something fancy like `nftables` you may need to do some more work, I haven't tried it yet.

For more options see [search.nixos.org's miniupnpd results](https://search.nixos.org/options?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=miniupnpd).

### miniupnpc - UPNP Client

This one is a dependency of other packages so you don't need to enable it directly.

Services which depend on it typically have their own configuration option to use it, either declarative or in some sort of stateful config file.

See [search.nixos.org's upnp results](https://search.nixos.org/options?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=upnp) for some example UPNP clients.

#### Why did you write this tiny article?

This tiny article is here so future me will remember this, and maybe it will show up in search results. Modern search engines seem to have some trouble making the jump from `upnp` to `miniupnpd` so I didn't find this until I used the NixOS options search.
