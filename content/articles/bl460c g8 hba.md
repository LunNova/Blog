+++
title = "HBA mode on the Smart Array Controller for the BL460c G8"
date = 2021-09-19

[taxonomies]
tags = ["bladesystem", "homelab", "linux"]
+++

## Enabling HBA mode

The BL460c G8 comes with a HP Smart Array Controller preinstalled, and it doesn't have an obvious supported way to enable passthrough/HBA mode.

You can enable it with hpssacli like so:

```bash
#00-hbamode.sh

#HPE Smart Storage Administrator (HPE SSA) CLI for Linux 64-bit
#https://support.hpe.com/hpsc/swd/public/detail?swItemId=MTX_04bffb688a73438598fef81ddd
wget https://downloads.hpe.com/pub/softlib2/software1/pubsw-linux/p1857046646/v114618/hpssacli-2.40-13.0.x86_64.rpm
sudo apt -y install rpm
sudo rpm -i --nodeps hpssacli-2.40-13.0.x86_64.rpm
# if HBA mode successfully set, shut down - need to reboot after hba mode set or commissioning will be wrong
(sudo hpssacli ctrl slot=0 modify hbamode=on && sudo init 0) || true
```

This script was used as a commissioning script in my Ubuntu MaaS test setup to ensure each blade was set up in HBA mode.

## Booting from local drives with HBA mode on

Unfortunately you immediately run into a new problem: The blade can't boot from the local drives in HBA mode, so if you're not netbooting you're stuck.

Enter kexec-loader, which sells itself as a drop-in replacement for GRUB which should solve our problem.

> From: http://www.solemnwarning.net/kexec-loader/
> 
>  kexec-loader is a Linux based bootloader that uses kexec to start the kernel of your choice. It fits on a 1.44MB floppy, supports most block devices supported by Linux and is easy to use. kexec-loader supports reading GRUB configuration files, this allows kexec-loader to be used as a drop-in replacement for GRUB by merely setting the GRUB installation path.
> 
> kexec-loader is aimed at people who wish to boot Linux or any other kernel supported by multiboot off a device which the BIOS does not support. For example, you may wish to use it to boot from a CD-ROM drive or USB Hard Disk that the BIOS can not boot from for whatever reason. 

This also doesn't work, kexec-loader doesn't have the module required to support the HP Smart Array controller and adding it is non-trivial.

The idea of kexec-loader is solid, and we can copy it except worse in most ways except for actually working with the bl460c G8.

The debian installer has the required modules. Take the debian installer, make it run this script at startup.

```bash
#!/usr/bin/env bash
# This script boots the first linux it finds in a grub config on any available mount point
# using kexec

set -euvo pipefail

parts=$(sudo blkid | grep -v /dev/loop | sort | cut -d: -f 1)
grub_paths="/boot/grub/grub.cfg /grub/grub.cfg /boot/grub.cfg"
echo $parts

for device in $parts; do
  mntpnt="/bootmount/$device"
  sudo mkdir -p "$mntpnt"
  sudo mount -o ro "$device" "$mntpnt" || true
  for grub_path in $grub_paths; do
    path="${mntpnt}${grub_path}"
    if [ -f "$path" ]; then
      echo "Found grub cfg at $path"
      menu=$(grep '^\s*menuentry\s\s*["'\'']' < "$path" | head -n 1 | sed 's/^\s*//g' || true)
      linux=$(grep '^\s*linux' < "$path" | head -n 1 | sed 's/^\s*linux\s*//' | sed 's/\s*$//' || true)
      initrd=$(grep '^\s*initrd' < "$path" | head -n 1 | sed 's/^\s*initrd\s*//' | sed 's/\s*$//' || true)
      
      kernel=$(echo "$linux" | awk -F '[\t ]' '{print $1}')
      command=$(echo "$linux" | awk -F '[\t ]' '{s = ""; for (i = 2; i <= NF; i++) s = s $i " "; print s}')
      
      echo "config: $menu $linux"
      echo "kernel: $kernel"
      echo "kernel command: $command"
      echo "initrd: $initrd"
      sudo kexec -l "$mntpnt/$kernel" --initrd="$mntpnt/$initrd" --command-line="$command"
      sudo kexec -e
      exit 1
    fi
  done
done
```
