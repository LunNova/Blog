+++
title = "Checking your current kernel config on NixOS"
date = 2022-06-19
description = "Some one-liners to show your current kernel config"

[taxonomies]
tags = ["linux", "nixos"]
+++

The examples in this article assume you have a recent version of Nix (>=2.5) and the experimental nix command features are enabled.

# Build the kernel config file derivation


```fish
$ bat (nix build --print-out-paths --no-link pkgs#linuxPackages_latest.kernel.configfile)
#
# Automatically generated file; DO NOT EDIT.
# Linux/x86_64 5.18.0 Kernel Configuration
#
CONFIG_CC_VERSION_TEXT="gcc (GCC) 11.3.0"
CONFIG_CC_IS_GCC=y
CONFIG_GCC_VERSION=110300
CONFIG_CLANG_VERSION=0
CONFIG_AS_IS_GNU=y
CONFIG_AS_VERSION=23800
# ... another few thousand lines of options
```

For the kernel for a NixOS configuration in a flake, `.#nixosConfigurations.(hostname).config.boot.kernelPackages.kernel.configfile` is the correct path.

I'm not sure what the right path is for non-flake NixOS, and haven't got that set up to check.

# Behind the scenes

<details open>
<summary>
How did I find these?
</summary>
Glad you asked. Here some commands I ran while ~~flailing around~~ looking for it before writing this article.

```fish
# It's a derivation, where's it defined? There's a proper way of checking that...

nix-repl> :e pkgs#linuxPackages_latest.kernel
error: package 'pkgs#linuxPackages_latest.kernel' has no source location information

# Eh, that would've been too easy. This is why I usually just rg my local nixpkgs :)
# Looks like it's here: https://github.com/NixOS/nixpkgs/blob/master/pkgs/os-specific/linux/kernel/generic.nix#L195

$ nix eval --apply builtins.attrNames pkgs#linuxPackages_latest.kernel.config
[ "CONFIG_FW_LOADER" "CONFIG_MODULES" "getValue" "isDisabled" "isEnabled" "isModule" "isNo" "isSet" "isYes" ]

# Doesn't look like the right thing

$ nix eval --apply builtins.attrNames pkgs#linuxPackages_latest.kernel.structuredConfig

error: flake 'flake:pkgs' does not provide attribute 'packages.x86_64-linux.linuxPackages_latest.kernel.structuredConfig', 'legacyPackages.x86_64-linux.linuxPackages_latest.kernel.structuredConfig' or 'linuxPackages_latest.kernel.structuredConfig'

# Oops, should've been under configfile

$ nix eval --apply builtins.attrNames pkgs#linuxPackages_latest.kernel.configFile.structuredConfig
error: flake 'flake:pkgs' does not provide attribute 'packages.x86_64-linux.linuxPackages_latest.kernel.configFile.structuredConfig', 'legacyPackages.x86_64-linux.linuxPackages_latest.kernel.configFile.structuredConfig' or 'linuxPackages_latest.kernel.configFile.structuredConfig'
       Did you mean configfile?

# Oops combo, that's not capitalized

$ nix eval --apply builtins.attrNames pkgs#linuxPackages_latest.kernel.configfile.structuredConfig
[ "8139TOO_8129" "8139TOO_PIO" "9P_FSCACHE" "9P_FS_POSIX_ACL" "ACCESSIBILITY" "ACPI_HOTPLUG_CPU" ... SNIP ... ]

# Nice, looks like those are the config options

$ nix eval pkgs#linuxPackages_latest.kernel.configfile.structuredConfig | sed 's/;/;\n/g' | nixpkgs-fmt
{
  # SNIP ...
  ZSMALLOC = {
    freeform = null;
    optional = false;
    tristate = "m";
  };
  ZSWAP = {
    freeform = null;
    optional = true;
    tristate = "y";
  };
}

# I guess looking at the nix attrs for the config isn't so useful, it's verbose, let's just use the output of the derivation

$ nix build --print-out-paths --no-link nix pkgs#linuxPackages_latest.kernel.configfile
```

</details>

## boot.kernelPackages is interesting

`boot.kernelPackages` uses the `apply` argument to `mkOption`. This isn't documented in the manual, and I hadn't ran into it before.

[lib/options.nix](https://github.com/NixOS/nixpkgs/blob/master/lib/options.nix):  
```nix
    # Function that converts the option value to something else.
    apply ? null
```

[nixos/modules/system/boot/kernel.nix](https://github.com/NixOS/nixpkgs/blob/master/nixos/modules/system/boot/kernel.nix):
```nix
{
  boot.kernelPackages = mkOption {
    default = pkgs.linuxPackages;
    type = types.raw;
    apply = kernelPackages: kernelPackages.extend (self: super: {
      kernel = super.kernel.override (originalArgs: {
        inherit randstructSeed;
        kernelPatches = (originalArgs.kernelPatches or []) ++ kernelPatches;
        features = lib.recursiveUpdate super.kernel.features features;
      });
    });
  };
}
```

This means that if you set both `boot.kernelPackages` and `boot.kernelPatches`, the final value of `boot.kernelPackages` worked out by the module system will be different from the value you set it to, even if you use `mkForce`!

```nix
{
  boot.kernelPackages = lib.mkForce pkgs.linuxPackages_latest;

  # The final value of boot.kernelPackages has these patches 'applied', it's not just
  # linuxPackages_latest
  boot.kernelPatches = [
    {
      name = "enable-amd-sme-sev";
      patch = null;
      extraStructuredConfig = with lib.kernel; {
        AMD_MEM_ENCRYPT = yes;
        AMD_MEM_ENCRYPT_ACTIVE_BY_DEFAULT = yes;
      };
    }
  ];
}
```