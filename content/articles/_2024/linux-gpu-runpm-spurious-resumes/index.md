+++
title = "Linux GPU Runtime Power Management Spurious Resumes"
description = "It's not easy keeping your secondary GPUs suspended on a modern Linux system"

date = 2024-11-02
updated = 2024-11-06
[taxonomies]
tags = ["amdgpu", "linux"]
+++

Discrete GPUs use a lot of power when idle. Some GPUs support suspending at runtime when they're not in use.  
Linux runtime power management is controlled by setting `power/control` to auto under a device, along with vendor specific options like the `amdgpu.runpm` kernel parameter.
In practice on a modern Linux system there are many hard to avoid parts of userspace that will cause GPUs to resume needlessly.

## Wasted GPU Resume Causes on a Linux + amdgpu system

* Opening a GPU device node under /dev/dri/, even if you do nothing with it
  * Happens every time a vulkan app calls vkEnumeratePhysicalDevices, regardless of which GPU it goes on to select
  * Happens even if you explicitly set a GPU to use with `MESA_VK_DEVICE_SELECT` because it still enumerates all devices
  * Happens for all GPUs for most apps which directly depend on `libdrm`
  * fwupdmgr does this on an interval
  * It's not clear how to fix this.
* Closing an unused GPU device node under /dev/dri/
  * If a long running program opens a GPU device node, waits an hour then exits the GPU resumes at both program start and end
* Reading a sysfs sensor, including hwmon power usage
  * Happens if you have anything displaying your current GPU power usage unless it knows to check the power management state before reading the wattage
  * powerprofilesctl causes this by reading power_dpm_force_performance_level
  * AMD may fix this in the future. A patch set was put forward to prevent waking GPUs when reading from sysfs. [\[PATCH v1 0/9\] drm/amd/pm runtime pm changes](https://lore.kernel.org/amd-gfx/20240925075607.23929-10-pierre-eric.pelloux-prayer@amd.com/T/#m93044c0ff680c60ec7c82589b025d356fa6f9ccf). At the time of posting the latest kernel is v6.11 and it still has this flaw.

This means it's very difficult to avoid your inactive GPUs frequently resuming and suspending.

The best workaround I've found so far is launching apps in a tiny container with `bubblewrap` and only exposing the GPU you want them to use in /dev/dri, but this is quite cumbersome.

I haven't yet thought of a proper fix for the vulkan device enumeration GPU wakeup issue.

## Logging AMDGPU resume causes

Apply [log-psp-resume.patch](./log-psp-resume.patch) to your kernel to get the responsible process name, PID and a kernel stack trace whenever an AMD GPU resumes.

```diff
--- a/drivers/gpu/drm/amd/amdgpu/amdgpu_psp.c
+++ b/drivers/gpu/drm/amd/amdgpu/amdgpu_psp.c
@@ -528,5 +528,6 @@
 	struct psp_context *psp = &adev->psp;
 
-	dev_info(adev->dev, "PSP is resuming...\n");
+	if (current && current->comm) dev_warn(adev->dev, "PSP is resuming... Caused by %s[%d]\n", current->comm, task_tgid_nr(current)); else dev_warn(adev->dev, "PSP is resuming...\n");
+	dump_stack();
 
 	if (psp->mem_train_ctx.enable_mem_training) {
```

Sample dmesg output after running `powerprofilesctl` which caused a GPU resume:

```
amdgpu 0000:48:00.0: amdgpu: PSP is resuming... Caused by power-profiles-[109386]
CPU: 24 UID: 0 PID: 109386 Comm: power-profiles- Tainted: G        W          6.11.6 #1-NixOS
Tainted: [W]=WARN
Hardware name: GIGABYTE G292-Z20-00/MZ22-G20-00, BIOS M17 07/11/2024
Call Trace:
 <TASK>
 dump_stack_lvl+0x64/0x90
 psp_resume+0x4c/0x270 [amdgpu]
 amdgpu_device_fw_loading+0x7c/0x160 [amdgpu]
 amdgpu_device_resume+0x9a/0x2f0 [amdgpu]
 amdgpu_pmops_runtime_resume+0x64/0x1a0 [amdgpu]
 ? __pfx_pci_pm_runtime_resume+0x10/0x10
 __rpm_callback+0x44/0x170
 ? __pfx_pci_pm_runtime_resume+0x10/0x10
 rpm_callback+0x59/0x70
 ? __pfx_pci_pm_runtime_resume+0x10/0x10
 rpm_resume+0x4d1/0x6d0
 ? srso_alias_return_thunk+0x5/0xfbef5
 __pm_runtime_resume+0x4b/0x80
 amdgpu_get_power_dpm_force_performance_level+0x4e/0x190 [amdgpu]
 dev_attr_show+0x1c/0x60
 sysfs_kf_seq_show+0xab/0x120
 seq_read_iter+0x131/0x490
 ? srso_alias_return_thunk+0x5/0xfbef5
 ? security_file_permission+0x36/0x60
 vfs_read+0x2b2/0x390
 ksys_read+0x6f/0xf0
 do_syscall_64+0xb7/0x210
 entry_SYSCALL_64_after_hwframe+0x77/0x7f
RIP: 0033:0x7f218b35076c
Code: ec 28 48 89 54 24 18 48 89 74 24 10 89 7c 24 08 e8 09 a4 f8 ff 48 8b 54 24 18 48 8b 74 24 10 41 89 c0 8b 7c 24 08 31 c0 0f 05 <48> 3d 00 f0 ff ff 77 54 44 89 c7 48 89 44 24 08 e8 5f a4 f8 ff 48
RSP: 002b:00007fff75b13040 EFLAGS: 00000246 ORIG_RAX: 0000000000000000
RAX: ffffffffffffffda RBX: 000000002bef4ee0 RCX: 00007f218b35076c
RDX: 0000000000001008 RSI: 000000002bef4ee0 RDI: 000000000000000a
RBP: 0000000000001008 R08: 0000000000000000 R09: 0000000000000000
R10: 0000000000000000 R11: 0000000000000246 R12: 000000000000000a
R13: 0000000000001008 R14: ffffffffffffffff R15: 0000000000000002
 </TASK>
```
