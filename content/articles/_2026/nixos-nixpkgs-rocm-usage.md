+++
title = "Using ROCm with NixOS or Nixpkgs"
description = "2026 guide to using ROCm on NixOS"
date = 2026-02-23
+++

# ROCm config toggle

```qrh
path = "linux/nixos-rocm-global"
title = "ROCm global config toggle"
tags = ["nixos", "linux", "rocm"]
```

Do:

- Access specific packages you want ROCm for via `pkgsRocm`, such as `pkgs.pkgsRocm.llama-cpp` and `pkgsRocm.blender`
- Enable `config.rocmSupport` for a nixpkgs used in a purpose specific environment that uses ROCm.

Don't:

- Enable `config.rocmSupport` globally for an entire NixOS config or home-manager config

Why:

Many packages have some support for machine learning. Enabling it for all of them is at present increasing the chance you hit a build failure and possibly a reliability or security hazard.  
ROCm's code quality isn't as good as browsers aim for. Firefox and thunderbird use ROCm via onnxruntime if enabled. They do sandbox in separate processes, but if you don't need it why risk it?  
ROCm packages often are large, and there's no sense wasting gigabytes on them if you don't need them.
