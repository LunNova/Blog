+++
title = "Disabling ECC on a Radeon Pro GPU on Linux"
date = 2022-09-28
updated = 2024-09-06
description = "Get 7% more VRAM for your machine learning misadventures!"
draft = false

[taxonomies]
tags = ["amdgpu", "linux", "ecc"]
+++

AMD's Pro GPUs come with Error-Correcting Code (ECC) memory enabled by default. ECC is beneficial for professional applications requiring data integrity; hobbyists and enthusiasts might prefer to eek out every last bit of VRAM for their projects. Consumer GPUs do not support ECC at all, so this is a non-issue for them.

If you turn ECC off you get about 7% more VRAM - 30700MiB to 32768MiB on a Pro W6800.  
On Windows this is as easy as flipping a switch in the Radeon control panel.

![](./windows-amd-settings.png "Screenshot of AMD's settings, showing an On-Board ECC/EDC toggle in the enabled state, and some of the surrounding options.")

On Linux, there is no documented[^1] way to disable it; there is a way to do it by patching the kernel and rebooting with a kernel parameter.

### Turning it off

Boot once with a patched kernel which returns false from `amdgpu_atomfirmware_mem_ecc_supported`

TODO: You *might* just need to reboot twice with the kernel param below and be able to skip this patch, but I don't think so. Should confirm this!

<details>

<summary>amdgpu-no-ecc.patch</summary>

```diff
diff --git a/drivers/gpu/drm/amd/amdgpu/amdgpu_atomfirmware.c b/drivers/gpu/drm/amd/amdgpu/amdgpu_atomfirmware.c
index a06e72f474f..61314fcb161 100644
--- a/drivers/gpu/drm/amd/amdgpu/amdgpu_atomfirmware.c
+++ b/drivers/gpu/drm/amd/amdgpu/amdgpu_atomfirmware.c
@@ -615,14 +615,15 @@
 /*
  * Return true if vbios enabled ecc by default, if umc info table is available
  * or false if ecc is not enabled or umc info table is not available
  */
 bool amdgpu_atomfirmware_mem_ecc_supported(struct amdgpu_device *adev)
 {
+	return false;
 	struct amdgpu_mode_info *mode_info = &adev->mode_info;
 	int index;
 	u16 data_offset, size;
 	union umc_info *umc_info;
 	u8 frev, crev;
 	bool ecc_default_enabled = false;
 	u8 umc_config;
 	u32 umc_config1;
```

</details>

You should see "GECC will be disabled in next boot cycle if set amdgpu_ras_enable and/or amdgpu_ras_mask to 0x0" in dmesg.  
Do what it says, and boot again with `amdgpu.ras_enable=0` added as a kernel parameter.

Your GPU should now boot with ECC disabled and more VRAM available!

```
$ dmesg | grep -i ecc
amdgpu 0000:06:00.0: amdgpu: MEM ECC is not presented.
amdgpu 0000:06:00.0: amdgpu: SRAM ECC is not presented.
amdgpu 0000:06:00.0: amdgpu: GECC is disabled
```

### Turning it back on

Revert the patch, remove the param, and reboot.  
You may have to reboot twice.

### Notes

- Tested only on systems with 1x and 2x AMD Radeon Pro W6800 cards.
- Tested only on NixOS
- Tested on 5.x and 6.x kernels.

[^1]: [amdgpu Kernel Module Documentation](https://docs.kernel.org/gpu/amdgpu/index.html)
[^2]: [amdgpu Kernel Parameters](https://docs.kernel.org/gpu/amdgpu/module-parameters.html)
<!--
TODO: Make this exist
[^3]: [AMD ML NixOS Kernel Module](https://github.com/LunNova/nixos-ml-flake)
-->