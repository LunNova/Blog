+++
title = "Why is my tmpfs / full?"
date = 2022-05-26
description = "Afternoon debugging session with a full tmpfs root"

[taxonomies]
tags = ["linux"]
+++

The / tmpfs[^impermanence] on [my desktop](https://github.com/LunNova/nixos-configs/blob/dev/hosts/hisame/default.nix) filled up, and I couldn't work out why.

```
$ df -i -h /; df -h /
Filesystem     Inodes IUsed IFree IUse% Mounted on
tmpfs            7.9M  160K  7.7M    2% /
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           2.0G  1.9G  189M  91% /
$  du -h -x / -d 0
26M     /
```

How can it have 1.9G used if there's only 26M there? The `-x` option for `du` tells it not to visit other partitions so that should be everything on `/`.

A quick search suggested that I probably had some large deleted files open and to check `lsof`, but there wasn't anything there either. There weren't many other suggestions and I was stuck here for a while.

While looking at `mount`'s output I noticed something suspicious:

```
tmpfs on /var/lib/containers/storage/overlay type tmpfs (rw,relatime,size=2097152k,mode=755)
```

That has the same mount options as the `/` tmpfs. It seems that somehow podman put `/var/lib/containers/storage/overlay` on the `/` tmpfs, even though I bind mounted `/var/lib/containers` on persistent storage.


[^impermanence]: This NixOS system uses a tmpfs / in the style of [nix-community/impermanence](https://github.com/nix-community/impermanence) to reduce statefulness.

## Quick debugging tip: bind mount your / somewhere else

Here's how to *really* see what's on your root fs. Bind mount it somewhere else so other mounts can't get in the way of finding files on it.

```
# mount -o bind / /mnt/actuallyroottho
# du -h -x /mnt/actuallyroottho -d 1
...
1.9G    /mnt/actuallyroottho/var
...
```