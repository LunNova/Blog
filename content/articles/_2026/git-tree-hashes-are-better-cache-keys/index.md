+++
title = "Git tree hashes make better cache keys"
date = 2026-03-13
description = "Commit hashes change on reword or reordering, tree hashes are more efficient"
tags = ["git", "nix"]
+++

It's common practice for tools to cache by commit.

Tree hashes are a fundamental but oft-untaught part of git. Many of you might have a passing familiarity with cases where the [*empty* tree hash](https://stackoverflow.com/questions/9765453/is-gits-semi-secret-empty-tree-object-reliable-and-why-is-there-not-a-symbolic) is useful.

Tree hashes are associated with a particular *content* of a repo.
Each folder has its own tree hash, and they nest.

If you want to cache the evaluation or build outputs of something that varies over the repo contents and you use the commit hash:

```mmd
graph TD
    subgraph "Before reword"
        A1["add tests<br/>commit: b9cfea tree: 8a3f91"]
        B1["fix path<br/>commit: e7cf3a tree: 2b1c07"]
        C1["rpath fix<br/>commit: 235ea6 tree: f4e882"]
        D1["bake LLVM<br/>commit: 478191 tree: c73f15"]
        A1 --> B1 --> C1 --> D1
    end
    subgraph "After rewording commit 2"
        A2["add tests<br/>commit: b9cfea tree: 8a3f91"]
        B2["fix /opt/rocm path<br/>commit: fa83b1 tree: 2b1c07"]
        C2["rpath fix<br/>commit: 91de44 tree: f4e882"]
        D2["bake LLVM<br/>commit: 3f7721 tree: c73f15"]
        A2 --> B2 --> C2 --> D2
    end

    style B2 fill:#d94444,color:#fff
    style C2 fill:#d94444,color:#fff
    style D2 fill:#d94444,color:#fff
```

You have to eat missing cache entries for all unchanged commits!

If we use tree hashes, squashing, rewording, or reordering can't invalidate caches for unchanged content. Reordering two commits changes their intermediate tree hashes but once both have landed the tree is identical; everything subsequent is a cache hit again.

We can even use the tree hash of a subdir, like `lib/` if only changes in that folder need us to recompute.

```console
$ git rev-parse HEAD^{tree}
6bfefc1b09b11351ab4b7bfa6f3a765f463aa6aa

$ git rev-parse HEAD:./ # might be easier to remember
6bfefc1b09b11351ab4b7bfa6f3a765f463aa6aa

$ git show HEAD^{tree}
tree HEAD^{tree}

.editorconfig
.envrc
content/
flake.lock
flake.nix
og-template/
static/
templates/

$ git rev-parse HEAD:content
f7ec97a728eaf53d6489b8e579938b66af3022c4

$ git show HEAD:content
tree HEAD:content

_index.html
articles/
oss-contributions.md
qrh/
siteroll.md

$ git rev-parse 7716e72^{tree}
6d1d979c892cc766282f140a8e49d974702161d5

$ git rev-parse 7716e72:content
b56eec0376e65a6e34d5a9af2adab5bce799b193
```

[github:LunNova/nix-eval-diff](https://github.com/LunNova/nix-eval-diff) takes a commit range like `origin/staging…HEAD` and evaluates each commit in the range, showing changed/added/removed packages & flagging if a commit fails eval. This protects me from reordering commits in a way that leaves some non-evaluating ones which is bad practice & lets me notice if a commit has more rebuilds than expected which might indicate I messed up the split.


```c
5f83595ff1ea (+0    -0    ~79  ) rocmPackages.llvm: use clang config file instead of deprecated GCC_INSTALL_PREFIX
691e49259092 (+0    -0    ~92  ) rocmPackages: 7.1.1 -> 7.2.0
331070f87dcc (+0    -0    ~82  ) rocmPackages.llvm: revert loop unrolling pessimisation
3376d1efb517 (+0    -0    ~0   ) rocmPackages.miopen: add updateScript for DVC S3 kdb files
3bc0e6a4c5fc (+0    -0    ~0   ) rocmPackages: sha256 = -> hash =
```


nix-eval-diff is much faster with tree hashing as it can confidently only eval on actual changed content in an extremely cheap git-native way, including when I squash intermediate commits or reorder.
