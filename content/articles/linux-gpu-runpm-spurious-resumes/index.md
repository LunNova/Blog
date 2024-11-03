+++
title = "Linux GPU Runtime Power Management Spurious Resumes"
description = "It's not easy keeping your secondary GPUs suspended on a modern Linux system"

date = 2024-11-02
[taxonomies]
tags = ["amdgpu", "linux"]
+++

Linux GPU drivers power up their GPUs on many in-practice unavoidable operations.

* Opening a GPU device node under /dev/dri/, even if you do nothing with it
  * Happens every time a vulkan app calls vkEnumeratePhysicalDevices, regardless of which GPU it goes on to select
  * Happens even if you explicitly set a GPU to use with `MESA_VK_DEVICE_SELECT` because it still enumerates all devices
  * Happens for all GPUs for most apps which directly depend on `libdrm`
  * It's not clear how to fix this.
* Reading a sysfs sensor, including hwmon power usage
  * Happens if you have anything displaying your current GPU power usage unless it knows to check the power management state before reading the wattage
  * AMD may fix this in the future. A patch set was put forward to prevent waking GPUs when reading from sysfs. [\[PATCH v1 0/9\] drm/amd/pm runtime pm changes](https://lore.kernel.org/amd-gfx/20240925075607.23929-10-pierre-eric.pelloux-prayer@amd.com/T/#m93044c0ff680c60ec7c82589b025d356fa6f9ccf). At the time of posting the latest kernel is v6.11 and it still has this flaw.

This means it's very difficult to avoid your inactive GPUs frequently resuming and suspending.

The best workaround I've found so far is launching apps in a tiny container with `bubblewrap` and only exposing the GPU you want them to use in /dev/dri, but this is quite cumbersome.

I haven't yet thought of a proper fix for the vulkan device enumeration GPU wakeup issue.