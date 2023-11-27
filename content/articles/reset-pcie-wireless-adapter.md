+++
title = "Resetting a PCIe Wireless Adapter"
date = 2023-11-27
description = "(Maybe) Reset a PCIe wireless adapter on Linux without a reboot"

[taxonomies]
tags = ["linux"]
+++

Sometimes the ath11k PCIe wireless adapter in my Thinkpad X13s breaks. I don't know why. The easiest fix is rebooting but that isn't very convenient.

Here's a workaround which is more general and should work for any PCIe wireless card that can be reset by removing and probing the device.

```sh
#!/usr/bin/env bash
set -xeu
# Find wifi remove file
remove="$(echo /sys/class/net/wlp*/device/remove)"
# Remove the wireless adapter, log if can't, keep going anyway in case rescanning works
echo 1 > "$remove" || >&2 echo "$0 can't write to $remove. Wifi card not found or not running as root"
# Wait a bit
sleep 4
# Rescan PCI bus
echo 1 > /sys/bus/pci/rescan
# Restart networking services (in my case various things with NetworkManager in the name)
systemctl restart '*etwork*.service'
systemctl status '*etwork*.service'
```
