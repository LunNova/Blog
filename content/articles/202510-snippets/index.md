+++
title = "202510 Snippets"
date = 2025-10-20
description = "Linkpost for October 2025. Learning JJ, some fun posts and a nix cache presence check snippet."

[taxonomies]
tags = ["snippets"]
+++

## Fun

- [How I, a non-developer, read the tutorial you, a developer, wrote for me, a beginner](https://anniemueller.com/posts/how-i-a-non-developer-read-the-tutorial-you-a-developer-wrote-for-me-a-beginner)
- It took 5 years but a tiny tweak to xdg-desktop-portal's docs to [make it clear that OpenFile works for dirs, and OpenDirectory on a dir opens the dir containing the target dir](https://github.com/flatpak/xdg-desktop-portal/issues/683) got merged. Woohoo! It's amusing when something lands after so long.
- [Building a Bimetallic Tea Monitoring Mechanism](https://www.youtube.com/watch?v=oJzy1vk2zyc)
  - I love the project but if you're copying them I'd avoid leaded (free-maching) brass for any components. Just because they don't stay in the tea doesn't mean it's a good idea to use them in something you'll be handling while drinking and need to wash.

## Development

### Nix cache presence from flake ref

Check if some flake refs are in a binary cache:

```
$ echo github:nixos/nixpkgs/{release-25.05,master}#ollama-rocm | xargs -n1 sh -c 'nix eval --raw "$1"; echo' -- | xargs -n1 nix path-info --store https://cache.nixos.org
/nix/store/kds9g0m2fhknx051gblg1d5lz52clf23-ollama-0.11.10
/nix/store/hd4lwgnfag8x8b8kir69lw2qhq8vhx2n-ollama-0.12.5
$ echo github:nixos/nixpkgs/staging#ollama-rocm | xargs -n1 sh -c 'nix eval --raw "$1"; echo' -- | xargs -n1 nix path-info --store https://cache.nixos.org
don't know how to build these paths:
  /nix/store/w1xxhfd5y0v5jbm19gzqlb4xa63bb1ym-ollama-0.12.5
error: path '/nix/store/w1xxhfd5y0v5jbm19gzqlb4xa63bb1ym-ollama-0.12.5' does not exist in the store
```

I couldn't work out how to do this without two separate steps so it's a little janky. 1. get out path 2. check if that path exists.

`nix eval` needs to use a writeable store to instantiate the drv in, `nix path-info` needs to be against the remote cache. `--readonly-mode` which stores evaluated drvs in memory instead of to the store isn't available for the flake command UI, only for `nix-instantiate`.

### learning jj-vcs

- [stupid jj tricks](https://andre.arko.net/2025/09/28/stupid-jj-tricks/)
- [steve's jj tutorial](https://steveklabnik.github.io/jujutsu-tutorial/)

#### Mistakes

Oops, I picked up all these bookmarks I don't want from a remote  
…this is annoying to clean up  
…ok got it we can pass a template that uses the name only and skips the remote part

```shell
$ jj bookmark list --remote upstream -T 'concat(self.name(), "\n")' \
    | grep -v -E '^(master|nixos-unstable|staging|staging-next)$' \
    | xargs jj bookmark forget --include-remotes
Forgot 29 local bookmarks.
Forgot 29 remote bookmarks.
```
