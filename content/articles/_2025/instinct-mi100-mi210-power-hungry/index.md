+++
title = "AMD Instinct MI100 and MI210 don't support power saving"
date = 2025-11-24
tags = ["amdgpu"]
description = "Shocking lack of power management on modern cards"
+++

AMD's Instinct MI100 and MI210 GPUs don't properly support power saving features. It's kinda shocking running into hardware released this decade that can't conserve power when idle.

If you're considering used Instinct GPUs for OpenCL or ROCm usecases first consider alternatives that won't burn power 24/7.

The AMDGPU kernel module should support runtime power management which suspends the card to the D3cold state, fully powering them off. It does for consumer and workstation cards.  
Sadly, for both the MI100 and MI210 attempting to make use of this with the `amdgpu.runpm` feature will hang the card on resume with the following output in dmesg:

```console
[ 1075.338832] amdgpu 0000:c8:00.0: amdgpu: reserve 0x400000 from 0x87fe800000 for PSP TMR
[ 1075.408586] amdgpu 0000:c8:00.0: amdgpu: RAP: optional rap ta ucode is not available
[ 1075.408601] amdgpu 0000:c8:00.0: amdgpu: SMU is resuming...
[ 1075.408610] amdgpu 0000:c8:00.0: amdgpu: SMC is not ready
[ 1075.408646] amdgpu 0000:c8:00.0: amdgpu: SMC engine is not correctly up!
[ 1075.408670] [drm:amdgpu_device_ip_resume_phase2 [amdgpu]] *ERROR*
resume of IP block <smu> failed -5
[ 1075.409439] amdgpu 0000:c8:00.0: amdgpu: amdgpu_device_ip_resume failed (-5).
```

The best you can do is lower core clocks, but memory will always be at full throttle consuming around 50W at idle.

AMD are aware of the efficiency issue but seem to be treating it as a known deficiency without progress on a fix. See [amdgpu#183](https://github.com/ROCm/amdgpu/issues/183) [ROCm#5315](https://github.com/ROCm/ROCm/issues/5315) for upstream issues.  
The reminds me of the GPU reset bugs that have prevented people from using VFIO passthrough with AMD GPUs and not seen much love.

If this software bug doesn't get fixed these cards will end up as ewaste sooner for no good reason, instead of being resold and reused. They're still quite capable but it would make no sense to run them as space heaters for intermittent use.
