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

Sample:

```nix
{
	# I want ROCm support for just llama-cpp and blender
	environment.systemPackages = [
		pkgs.pkgsRocm.blender
		pkgs.pkgsRocm.llama-cpp
		# … other packages accessed normally
	];
}
```

# One line run commands

nix run llama-cpp CLI:

```
nix run github:nixos/nixpkgs/nixos-unstable#pkgsRocm.llama-cpp -- -hf ggml-org/functiongemma-270m-it-GGUF -c 2048 -fa 1 -p "hello" -ngl 99
```

nix run vLLM serve:

```
nix run github:nixos/nixpkgs/nixos-unstable#pkgsRocm.vllm -- serve Qwen/Qwen3-VL-4B-Instruct --max-model-len 4096 --gpu-memory-utilization 0.95 --limit-mm-per-prompt '{"image": 0, "video": 0}'
```

nix run blender:

```
nix run github:nixos/nixpkgs/nixos-unstable#pkgsRocm.blender
```

# ROCm ISA specific build

ROCm packages can be built for a single ISA to reduce their size.

This is only recommended if you're very storage constrained or already rebuilding ROCm packages to apply an overlay, as single ISA builds are still very expensive[^kpack-split].

```nix
let pkgs = import nixpkgs {
 inherit system;
 overlays = [
   (final: prev: {
    rocmPackages = prev.rocmPackages.overrideScope (
     fs: ps: {
       # gfx1030 = RX 6xxx, W6800
       clr = ps.clr.override { localGpuTargets = [ "gfx1030" ];};
     }
    );
   })
 ];
};
# `pkgs.pkgsRocm.llama-cpp` is now only built for gfx1030
```

[^kpack-split]: See [NixOS/nixpkgs#486613 rocmPackages: plan interface changes for per-ISA runtime binding (kpack) support](https://github.com/NixOS/nixpkgs/issues/486613) for a proposal which may make this possible without expensive rebuilds
