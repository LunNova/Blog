+++
title = "Migrating primary drive on NixOS"
date = 2022-09-10
description = "Low risk migration between primary drives on NixOS"

[taxonomies]
tags = ["linux", "nixos", "nix"]
+++

My boot SSD started slowing down, so I bought another.

Here are the steps I took to migrate to the new boot SSD without needing a rescue system/boot USB.
I also took this opportunity to move my persist partition to btrfs, as I ran into some pathological bad fragmentation case with ext4 and my `/nix/store` directory entry on the previous drive.

I use a `tmpfs` `/` and store persistent data on a `/persist` partition. If you use a more standard setup you will have to adapt some of the paths in this article.

### Add a specialization which uses the new partitions

```nix
{
    specialisation.new-partitions.configuration.fileSystems = {
      "/boot" = lib.mkForce {
        device = "/dev/disk/by-partlabel/${name}_esp_2";
        fsType = "vfat";
        neededForBoot = true;
        options = [ "discard" "noatime" ];
      };
      "/persist" = lib.mkForce {
        device = "/dev/disk/by-partlabel/${name}_persist_2";
        fsType = "btrfs";
        neededForBoot = true;
        options = btrfsOpts ++ [ "subvol=@persist" "nodev" "nosuid" ];
      };
    };
}
```

From [this commit in LunNova/nixos-configs](https://github.com/LunNova/nixos-configs/commit/dfa4e66420c294e4247620a5b346ad8f84e000d5)

This specialization overrides our `/boot` and `/persist` filesystems to use the new partitions we will create.
Run `nixos-rebuild switch` after making this change.

### Install the new drive

I shut down the PC, added the new NVMe drive, and booted up again. I didn't select the new specialisation yet.

### Partition the new drive

I created an EFI partition and BTRFS partition with a `@persist` subvolume on the new drive.

[Here's a small partitioning script I used](https://github.com/LunNova/nixos-configs/blob/006b4d0510a79f1a960378ba67497a48e5be0dea/scripts/install/partition.sh). Doing this manually is fine, make sure to use partlabels matching the ones you picked earlier!

### Copy everything on our persist partition to the new drive

I mounted the new drive and ran `rsync`.

```bash
sudo mount -t btrfs -o defaults,ssd,nosuid,nodev,compress=zstd,noatime /dev/nvme1n1p2 /mnt/temp/
sudo rsync -ah -A -X --info=progress2 /persist/ /mnt/temp/@persist/ 
```

This step might take a long time.

### Mount the new EFI partition and install a bootloader

Next, I mounted the new boot partition at `/boot` and set it up.

```bash
sudo umount /boot
sudo mount /dev/disk/by-partlabel/hisame_esp_2 /boot
sudo NIXOS_INSTALL_BOOTLOADER=1 /run/current-system/bin/switch-to-configuration boot
```

The command reinstalls the bootloader for the active generation.

### Reboot and select the specialization

I then rebooted and selected the new specialization called `new-partitions` from the boot menu, and my system booted from the new drive.

I checked with `lsblk -f` that the new partitions were actually in use.

### Remove the old partitions from your config and remove the specialization

Since everything looks fine, I can now remove the specialization and make the new partitions the default.

[Here's an example commit from LunNova/nixos-configs](https://github.com/LunNova/nixos-configs/commit/e1587c0b80769a54f43eda064d1957bc91ae58b0)

### Job's done!

That should be everything. You may need to update your boot order in your UEFI to ensure the new drive is first, this is left as an exercise for the reader.
