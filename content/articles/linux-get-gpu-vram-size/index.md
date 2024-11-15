+++
title = "How to find GPU VRAM size programmatically on Linux"
description = "Demonstrates three ways to find GPU VRAM size on Linux"
date = 2024-11-10

[taxonomies]
tags = ["linux", "performance"]
+++

Linux does not have a straightforward good way to find a GPU's VRAM size that's documented. Here's what I've found, and sample rust code.

# Identifying GPUs

GPUs are typically found under `/sys/class/drm/card*`. Only GPUs with DRM support will be found here, but on a modern Linux system this should be any GPU thanks to the `simpledrm` driver which attaches to legacy cards.

The `device` link under the DRM card points at the PCI device sysfs folder.

```bash
$ readlink -m /sys/class/drm/card1/device
/sys/devices/pci0000:00/0000:00:08.1/0000:6b:00.0
```

## AMD-specific mem_info_vram_total

The [`mem_info_vram_total`](https://docs.kernel.org/gpu/amdgpu/driver-misc.html#mem-info-vram-total) file under the device provides the VRAM size in bytes.

```bash
$ cat /sys/class/drm/card1/device/mem_info_vram_total 
34342961152
```

Hopefully other drivers support this some day.

## GPU BAR Size

GPUs are typically PCIe devices with a BAR for VRAM. On many systems, especially modern ones, the largest PCIe BAR is a mapping of the GPU's entire VRAM.  
On other systems, the largest BAR is smaller than VRAM, especially older systems or iGPUs / unified memory systems.

lspci provides a human readable view of mapped PCIe memory. In this example an AST2500 VGA controller with 32MB of VRAM's region 0 shows up with the expected 32MB size.

```bash
$ lspci -vvs 84:00.0
84:00.0 VGA compatible controller: ASPEED Technology, Inc. ASPEED Graphics Family (rev 41) (prog-if 00 [VGA controller])
        DeviceName:  Onboard VGA
        Subsystem: Gigabyte Technology Co., Ltd Device 1000
        Control: I/O+ Mem+ BusMaster- SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
        Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=medium >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
        Interrupt: pin A routed to IRQ 384
        NUMA node: 2
        Region 0: Memory at a6000000 (32-bit, prefetchable) [size=32M]
        Region 1: Memory at a8000000 (32-bit, non-prefetchable) [size=128K]
        Region 2: I/O ports at c000 [size=128]
        Expansion ROM at 000c0000 [virtual] [disabled] [size=128K]
        Capabilities: <access denied>
        Kernel driver in use: ast
        Kernel modules: ast
```

You can access the same info programmatically by reading the lines in the device's `resource` file.

```bash
# start end flags
$ cat /sys/bus/pci/devices/0000:84:00.0/resource
0x00000000a6000000 0x00000000a7ffffff 0x0000000000042200
0x00000000a8000000 0x00000000a801ffff 0x0000000000040200
0x000000000000c000 0x000000000000c07f 0x0000000000040101
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x00000000000c0000 0x00000000000dffff 0x0000000000000212
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000
0x0000000000000000 0x0000000000000000 0x0000000000000000

```

## Vulkan VRAM Capacity

Vulkan provides APIs to enumerate devices, get the PCI bus path and the total memory capacity. By combining these we can use vulkan to find the VRAM capacity of any PCIe GPU which you have vulkan drivers for.  
This is a very heavy approach that will open device nodes and potentially allocate resources on all GPUs, [forcing them out of low power states](../linux-gpu-runpm-spurious-resumes/). I don't recommend it unless your app is already using vulkan.

1. Enumerate physical devices
2. Use [VkPhysicalDevicePCIBusInfoPropertiesEXT](https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDevicePCIBusInfoPropertiesEXT.html) to get the PCI bus path for each device
3. Use [VkPhysicalDeviceMemoryProperties](https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDeviceMemoryProperties.html) to get VRAM size

# Rust Examples

## Recommended Approach (vram_total with BAR fallback)

```rs
/// path should be the path to a GPU PCIe device eg /sys/class/drm/card1/device
fn extract_memory(path: &Path) -> Option<u64> {
    // Try AMD method first (vram_total)
    let mem_path = path.join("mem_info_vram_total");
    if let Ok(mem_str) = fs::read_to_string(mem_path) {
        if let Ok(memory) = mem_str.trim().parse::<u64>() {
            return Some(memory);
        }
    }

    // Fall back to largest PCI memory region
    let pci_bus_path = path.file_name()?.to_str()?;
    if let Some(regions) = PCI_MEMORY_REGIONS.get(pci_bus_path) {
        return regions
            .iter()
            .map(|region| region.size)
            .max();
    }

    None
}

static PCI_MEMORY_REGIONS: LazyLock<HashMap<String, Vec<MemoryRegion>>> = LazyLock::new(|| {
    get_pci_memory_regions()
        .map(|regions| {
            regions.into_iter().collect::<HashMap<_, _>>()
        })
        .unwrap_or_else(|e| {
            eprintln!("Failed to get PCI memory regions: {}", e);
            HashMap::new()
        })
});

fn get_pci_memory_regions() -> io::Result<Vec<(String, Vec<MemoryRegion>)>> {
    let mut results = Vec::new();
    
    for device_path in get_pci_devices()? {
        let device_name = device_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();
            
        let resource_path = device_path.join("resource");
        if let Ok(regions) = read_resource_file(&resource_path) {
            if !regions.is_empty() {
                results.push((device_name, regions));
            }
        }
    }
    
    Ok(results)
}

fn parse_hex(s: &str) -> Option<u64> {
    // Remove "0x" prefix if present and parse as hex
    let s = s.trim().trim_start_matches("0x");
    u64::from_str_radix(s, 16).ok()
}
fn read_resource_file(path: &Path) -> io::Result<Vec<MemoryRegion>> {
    let content = fs::read_to_string(path)?;
    let regions: Vec<MemoryRegion> = content
        .lines()
        .enumerate()
        .filter_map(|(i, line)| {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let start = parse_hex(parts[0])?;
                let end = parse_hex(parts[1])?;
                let flags = parse_hex(parts[2])?;
                
                if start == 0 && end == 0 {
                    return None;
                }

                Some(MemoryRegion {
                    start,
                    end,
                    flags,
                    size: end - start + 1,
                    is_prefetchable: (flags & 0x2000) != 0,
                    is_64bit: (flags & 0x0004) != 0,
                })
            } else {
                None
            }
        })
        .collect();

    Ok(regions)
}
```

This isn't proper production-ready code with robust error handling. That's left as an exercise for the reader.

## Vulkan Approach

This approach uses the `ash` crate's vulkan bindings.

```rs
fn enumerate_vulkan_gpus() -> Result<Vec<GPUInfo>, Box<dyn std::error::Error>> {
    let entry = unsafe { Entry::load()? };

    let instance = unsafe {
        entry.create_instance(
            &vk::InstanceCreateInfo::default().application_info(
                &vk::ApplicationInfo::default()
                    .engine_name(CStr::from_bytes_with_nul(b"GPUInfo\0").unwrap())
                    .engine_version(1)
                    .application_name(CStr::from_bytes_with_nul(b"GPUInfoApp\0").unwrap())
                    .application_version(1)
                    .api_version(vk::make_api_version(0, 1, 2, 0)),
            ),
            // FIXME: This doesn't work but ignoring the extension and asking anyway does??
            //.enabled_extension_names(&[(&CStr::from_bytes_with_nul_unchecked(b"VK_EXT_pci_bus_info\0")).as_ptr()]),
            None,
        )
    }?;

    let physical_devices = unsafe { instance.enumerate_physical_devices()? };

    let mut gpus = Vec::new();

    for &physical_device in &physical_devices {
        let mut properties = vk::PhysicalDeviceProperties2::default();
        let mut pci_bus_info = VkPhysicalDevicePCIBusInfoPropertiesEXT {
            s_type: vk::StructureType::PHYSICAL_DEVICE_PCI_BUS_INFO_PROPERTIES_EXT,
            p_next: std::ptr::null_mut(),
            pci_domain: 0,
            pci_bus: 0,
            pci_device: 0,
            pci_function: 0,
        };

        properties.p_next = &mut pci_bus_info as *mut _ as *mut c_void;

        unsafe {
            instance.get_physical_device_properties2(physical_device, &mut properties);
        }

        let memory_properties =
            unsafe { instance.get_physical_device_memory_properties(physical_device) };

        let name = unsafe { CStr::from_ptr(properties.properties.device_name.as_ptr()) }
            .to_string_lossy()
            .into_owned();

        let vendor = get_vendor_name(properties.properties.vendor_id);

        let total_memory = memory_properties
            .memory_heaps
            .iter()
            .take(memory_properties.memory_heap_count as usize)
            .filter(|heap| heap.flags.contains(vk::MemoryHeapFlags::DEVICE_LOCAL))
            .map(|heap| heap.size)
            .sum();

        // Extract PCI bus ID using VK_EXT_pci_bus_info
        let pci_bus_path = format!(
            "{:04x}:{:02x}:{:02x}.{:x}",
            pci_bus_info.pci_domain,
            pci_bus_info.pci_bus,
            pci_bus_info.pci_device,
            pci_bus_info.pci_function
        );

        gpus.push(GPUInfo {
            name,
            memory: Some(total_memory),
            vendor,
            pci_bus_path,
        });
    }

    Ok(gpus)
}
```

# Software Versions

```bash
$ uname -a
Linux hoshitsuki-nixos 6.11.6 #1-NixOS SMP PREEMPT_DYNAMIC Fri Nov  1 01:02:44 UTC 2024 x86_64 GNU/Linux
$ lspci --version
lspci version 3.13.0
```
