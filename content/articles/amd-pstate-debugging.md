+++
title = "Debugging amd_pstate"
date = 2024-09-24
description = "Guide to get AMD P-state support working on Linux systems, with troubleshooting tips and a NixOS config sample"

[taxonomies]
tags = ["linux"]
+++

amd_pstate is a kernel module which implements support for AMD Ryzen P-states, offering more fine grained power management than ACPI C-states allow.

The amd_pstate kernel module has undergone changes since it was first implemented, and much of the documentation available is outdated.  
If you have a system that you believe should have `amd_pstate` support but it isn't working you can try the following.

```bash
# if this prints `CpuDriver:  amd_pstate` then amd_pstate is loaded
$ powerprofilesctl | grep Cpu | uniq
# try to load amd_pstate and the amd_pstate_ut test module in multiple ways
$ sudo modprobe amd_pstate dyndbg==pmf amd_pstate=guided amd_pstate.shared_mem=1 -v; sudo modprobe amd_pstate_ut -v
$ sudo dmesg | grep amd_pstate
amd_pstate:amd_pstate_init: amd_pstate: the _CPC object is not present in SBIOS
```

In this example we got an error saying the _CPC object is missing. Enable `AMD CBS > NBIOS Common Options > SMU Common Options > CPPC > CPPC CTRL` in your UEFI settings to fix it. If that option is not available, you may need to update your UEFI.

If instead the command above successfully loads amd_pstate, you may need to add a kernel param like `amd_pstate=guided`, or add the module name from above that worked to your list of modules to load. That's `/etc/modules` on most distros.

If everything is working correctly you should see something like this:

```bash
$ powerprofilesctl | grep Cpu | uniq
  CpuDriver:  amd_pstate
$ sudo dmesg | grep amd_pstate
[265365.656660] amd_pstate_ut: 1  amd_pstate_ut_acpi_cpc_valid   success!
[265365.656664] amd_pstate_ut: 2  amd_pstate_ut_check_enabled  success!
[265365.656807] amd_pstate_ut: 3  amd_pstate_ut_check_perf   success!
[265365.656811] amd_pstate_ut: 4  amd_pstate_ut_check_freq   success!
```

On earlier kernels without `amd_pstate_ut` you'll see a different success message.
My machine with a 7950x fails test 4 but amd_pstate otherwise seems to work.

```bash
[265365.656809] amd_pstate_ut: amd_pstate_ut_check_freq cpu0 cpudata_min_freq=400000 policy_min=3010000, they should be equal!
[265365.656811] amd_pstate_ut: 4  amd_pstate_ut_check_freq   fail!
```

## NixOS Config for amd_pstate

This snippet should turn on amd_pstate or get debug output about why it failed to load in dmesg.  
If your kernel config is missing a required module it'll error.

```nix
boot = {
  # _ut is for the debug warnings / self test
  kernelModules = [ "amd_pstate" "amd_pstate_ut" ];
  kernelParams = [
    # mode selection required after cpufreq: amd-pstate: add amd-pstate driver parameter for mode selection
    "amd_pstate=guided"

    # sometimes necessary to stop acpi cpufreq loading first, should only be uncommented if you encounter that issue
    # should only apply for <6.1 kernels
    # "initcall_blacklist=acpi_cpufreq_init"
  ];
};

system.requiredKernelConfig = with config.lib.kernelConfig; [
  (isYes "X86_AMD_PSTATE")
  (isYes "X86_FEATURE_CPPC")
  (isEnabled "X86_AMD_PSTATE_UT")
];
```

## Abridged amd_pstate history

| Kernel Version | Change |
|----------------|--------|
| [5.17](https://github.com/torvalds/linux/blame/v5.17/drivers/cpufreq/amd-pstate.c) | Initial introduction of amd_pstate driver. shared_mem parameter required for support on most processors. |
| [6.1](https://github.com/torvalds/linux/blame/v6.1/drivers/cpufreq/amd-pstate.c) | Introduction of amd_pstate driver parameter for mode selection (disabled/passive), split of amd_pstate_ut as a separate module, removal of shared_mem parameter |
| [6.3](https://github.com/torvalds/linux/blame/v6.3/drivers/cpufreq/amd-pstate.c) | Addition of active mode (which corresponds to the amd_pstate_epp cpufreq driver) and guided mode |
| [6.5](https://github.com/torvalds/linux/blame/v6.5/drivers/cpufreq/amd-pstate.c) | X86_AMD_PSTATE_DEFAULT_MODE Kconfig option added, and defaulted to 'active' |
