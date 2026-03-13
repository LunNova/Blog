+++
title = "Disabling ECC on Radeon Pro GPUs on Linux"
date = 2022-09-28
updated = 2024-09-10
description = "Get 7% more VRAM for your machine learning misadventures! Frontier model developers need not take heed."
draft = false

[taxonomies]
tags = ["amdgpu", "linux", "machine learning"]
+++

Update: `amdgpu-no-ecc.patch` is unnecessary, only `amdgpu.ras_enable=0` and two reboots are required. This may only apply for 6.x kernels, kept the patch at the bottom in case it's still useful.

---

AMD's Pro GPUs come with Error-Correcting Code (ECC) memory enabled by default. ECC is beneficial for professional applications requiring data integrity; hobbyists and enthusiasts might prefer to eek out every last bit of VRAM for their projects. Consumer GPUs do not support ECC at all, so this is a non-issue for them.

If you turn ECC off you get about 7% more VRAM - 30700MiB to 32768MiB on a Pro W6800.

## Windows: What even is feature parity?

On Windows this is as easy as flipping a switch in the Radeon control panel.

<figure>

![](./windows-amd-settings.png "Screenshot of AMD's settings, showing an On-Board ECC/EDC toggle in the enabled state, and some of the surrounding options.")

<figcaption>Screenshot of AMD's settings, showing an On-Board ECC/EDC toggle in the enabled state, and some of the surrounding options.</figcaption>
</figure>

On Linux, there is no documented[^1] way to disable it; but the `amdgpu.ras_enable=0` kernel parameter can be used to disable it in combination with two (???) reboots.

## Linux: Why document anything?

### Checking if ECC is enabled

amdgpu logs `amdgpu: MEM ECC is active` or `amdgpu: MEM ECC is not presented` in dmesg.
rocm-smi shows a lower total VRAM size when ECC is enabled. In this example, rocm-smi shows 30704MiB VRAM per card instead of the 32768MiB advertised.

```sh
lun@tsukiakari $ dmesg | grep -i ecc
amdgpu 0000:06:00.0: amdgpu: MEM ECC is active.
amdgpu 0000:06:00.0: amdgpu: SRAM ECC is not presented.
amdgpu 0000:06:00.0: amdgpu: GECC is enabled
lun@tsukiakari $ nix shell pkgs#rocmPackages.rocm-smi -c rocm-smi --showmeminfo vram
GPU[0]          : VRAM Total Memory (B): 32195477504
GPU[0]          : VRAM Total Used Memory (B): 17121280
```

### Turning ECC off

Add `amdgpu.ras_enable=0` to your kernel parameters.

For NixOS: Add `boot.kernelParams = ["amdgpu.ras_enable=0"];` to your config and rebuild with nixos-rebuild.  
For Debian and Ubuntu: Edit `/etc/default/grub`, add `amdgpu.ras_enable=0` to `GRUB_CMDLINE_LINUX_DEFAULT`, then run `sudo update-grub`.  
For Arch Linux: Visit [Kernel Parameters](https://wiki.archlinux.org/title/Kernel_parameters) on the Arch wiki for instructions on how to edit your kernel parameters.  

Reboot.

You should see "GECC will be disabled in next boot cycle if set amdgpu_ras_enable and/or amdgpu_ras_mask to 0x0" in dmesg.  

```sh
lun@tsukiakari $ dmesg | grep -i ecc # first boot
amdgpu 0000:06:00.0: amdgpu: MEM ECC is active.
amdgpu 0000:06:00.0: amdgpu: SRAM ECC is not presented.
amdgpu 0000:06:00.0: amdgpu: GECC will be disabled in next boot cycle if set amdgpu_ras_enable and/or amdgpu_ras_mask to 0x0
```

Do what it says, and reboot again, keeping the kernel parameter applied.
Your GPU should now boot with ECC disabled and more VRAM available!

```sh
lun@tsukiakari $ dmesg | grep -Ei '(ecc|ras)' # second boot
RAS: Correctable Errors collector initialized.
amdgpu 0000:06:00.0: amdgpu: MEM ECC is active.
amdgpu 0000:06:00.0: amdgpu: SRAM ECC is not presented.
amdgpu 0000:06:00.0: amdgpu: GECC is disabled
lun@tsukiakari $ nix shell pkgs#rocmPackages.rocm-smi -c rocm-smi --showmeminfo vram
GPU[0]          : VRAM Total Memory (B): 34342961152
GPU[0]          : VRAM Total Used Memory (B): 17121280
```

`rocm-smi --showmeminfo vram` confirms availability of the full 32768MiB VRAM after disabling ECC.

### Turning ECC back on

Remove the kernel parameter, and reboot twice.

### Notes

- Tested only on systems with 1x and 2x AMD Radeon Pro W6800 cards.
- Tested only on NixOS, should work on other distros
- Tested on 5.x and 6.x kernels.
- If you are working on a Frontier model, please do not follow this guide. *I do not want to cause any world-ending bitflips*

### Obsolete Patch

This patch was recommended in an earlier version of this article.  
It might be needed for 5.x kernels, it's definitely not needed for 6.x.

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

---

[^1]: [amdgpu Kernel Module Documentation](https://docs.kernel.org/gpu/amdgpu/index.html)
[^2]: [amdgpu Kernel Parameters](https://docs.kernel.org/gpu/amdgpu/module-parameters.html)
<!--
TODO: Make this exist
[^3]: [AMD ML NixOS Kernel Module](https://github.com/LunNova/nixos-ml-flake)
-->