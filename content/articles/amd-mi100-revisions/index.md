+++
title = "AMD Instinct MI100 Revision Notes"
date = 2024-11-01
description = "Notes on AMD Instinct MI100 revisions from 2020 and 2021."

[taxonomies]
tags = ["amdgpu", "linux", "machine learning"]
+++

The AMD Instinct MI100 "Arcturus" GPU has had multiple revisions with different part numbers. Very little information is available online about them.

### MI100 D34315 Rev 01, certified 2020:

```
P/N: D34315
VBIOS P/N: 113-D3431500-101, 113-D3431500-100
rocm-smi "Device Rev": 0x01
# amdvbflash -biosfileinfo gpu1.rom
AMDVBFLASH version 4.79 EXTERNAL, Copyright (c) 2020 Advanced Micro Devices, Inc.

    Product Name is :    MI100 D34315 A2 XL 300W 32GB 1200m 
    Device ID is    :    738C
    Bios Version    :    000.000.000.000.016113
    Bios P/N is     :    113-D3431500-101
    Bios SSID       :    0C34
    Bios SVID       :    1002
    Bios Date is    :    11/24/20 22:21
```

[RRA Certification](https://www.rra.go.kr/ko/license/A_b_popup.do?app_no=202017210000229765) - 2020-08-20

### MI100 D34324, Also Rev 01 ??, certified 2021

```
P/N: D34324
VBIOS P/N: 113-D3432400-100
rocm-smi "Device Rev": 0x01
# amdvbflash -biosfileinfo gpu0.rom
AMDVBFLASH version 4.79 EXTERNAL, Copyright (c) 2020 Advanced Micro Devices, Inc.

    Product Name is :    MI100 D34324 A2 XL 300W 32GB 1200m 
    Device ID is    :    738C
    Bios Version    :    000.000.000.000.017958
    Bios P/N is     :    113-D3432400-100
    Bios SSID       :    0C34
    Bios SVID       :    1002
    Bios Date is    :    12/07/21 23:20 
```

[RRA certification](https://www.rra.go.kr/ko/license/A_b_popup.do?app_no=202117210000694635) - 2021-12-20

## Hardware Differences

My D34324 MI100s have some visible differences to their board layout near `INJECTION_SW`. A TPS2121 power mux has been removed and nearby some 0 ohm linking resistors have been added. I don't know what this power mux is for.  
As there were visible hardware changes, I have not tried cross flashing. It might work, but I'm not tempted enough to find out since I have not noticed any issues unique to the D34315 cards.

<figure>

![](2020-D34315.png)

<figcaption>
2020 (D34315) board's INJECTION_SW area.
</figcaption>
</figure>

<figure>

![](2021-D34324.png)

<figcaption>
2021 (D34324) board's INJECTION_SW area. Some signs of SMD rework (flux residue) and 0ohm links instead of a power mux.
</figcaption>
</figure>


## System Management Command Output

Output from various system management commands on my test system.

```
# amdvbflash -i
AMDVBFLASH version 4.79 EXTERNAL, Copyright (c) 2020 Advanced Micro Devices, Inc.
adapter seg  bn dn dID       asic           flash      romsize test    bios p/n    
======= ==== == == ==== =============== ============== ======= ==== ================
   0    0000 05 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3432400-100
   1    0000 45 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3431500-101
   2    0000 48 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3431500-101
   3    0000 8B 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3432400-100
   4    0000 C5 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3431500-101
   5    0000 C8 00 738C MI100(Slave)    GD25Q80C        100000 pass 113-D3431500-101
```

rocm-smi info:

```
$ nix run .#rocmPackages.rocm-smi -- --showhw --alldevices -i -v


====================================== ROCm System Management Interface ======================================
=========================================== Concise Hardware Info ============================================
GPU  NODE  DID     GUID   GFX VER  GFX RAS  SDMA RAS  UMC RAS  VBIOS             BUS           PARTITION ID  
0    8     0x738c  45705  gfx9008  ENABLED  ENABLED   ENABLED  113-D3432400-100  0000:05:00.0  0             
1    9     0x738c  17080  gfx9008  ENABLED  ENABLED   ENABLED  113-D3431500-101  0000:45:00.0  0             
2    10    0x738c  55164  gfx9008  ENABLED  ENABLED   ENABLED  113-D3431500-101  0000:48:00.0  0             
3    11    0x738c  30316  gfx9008  ENABLED  ENABLED   ENABLED  113-D3432400-100  0000:8B:00.0  0             
4    12    0x738c  58073  gfx9008  ENABLED  ENABLED   ENABLED  113-D3431500-101  0000:C5:00.0  0             
5    13    0x738c  30493  gfx9008  ENABLED  ENABLED   ENABLED  113-D3431500-101  0000:C8:00.0  0             
==============================================================================================================
============================================ End of ROCm SMI Log =============================================
=========================================== ID ===========================================
GPU[0]          : Device Name:          0x1002
GPU[0]          : Device ID:            0x738c
GPU[0]          : Device Rev:           0x01
GPU[0]          : Subsystem ID:         0x1002
GPU[0]          : GUID:                 45705
GPU[1]          : Device Name:          0x1002
GPU[1]          : Device ID:            0x738c
GPU[1]          : Device Rev:           0x01
GPU[1]          : Subsystem ID:         0x1002
GPU[1]          : GUID:                 17080
GPU[2]          : Device Name:          0x1002
GPU[2]          : Device ID:            0x738c
GPU[2]          : Device Rev:           0x01
GPU[2]          : Subsystem ID:         0x1002
GPU[2]          : GUID:                 55164
GPU[3]          : Device Name:          0x1002
GPU[3]          : Device ID:            0x738c
GPU[3]          : Device Rev:           0x01
GPU[3]          : Subsystem ID:         0x1002
GPU[3]          : GUID:                 30316
GPU[4]          : Device Name:          0x1002
GPU[4]          : Device ID:            0x738c
GPU[4]          : Device Rev:           0x01
GPU[4]          : Subsystem ID:         0x1002
GPU[4]          : GUID:                 58073
GPU[5]          : Device Name:          0x1002
GPU[5]          : Device ID:            0x738c
GPU[5]          : Device Rev:           0x01
GPU[5]          : Subsystem ID:         0x1002
GPU[5]          : GUID:                 30493
==========================================================================================
========================================= VBIOS ==========================================
GPU[0]          : VBIOS version: 113-D3432400-100
GPU[1]          : VBIOS version: 113-D3431500-101
GPU[2]          : VBIOS version: 113-D3431500-101
GPU[3]          : VBIOS version: 113-D3432400-100
GPU[4]          : VBIOS version: 113-D3431500-101
GPU[5]          : VBIOS version: 113-D3431500-101
==========================================================================================
```

dmesg while amdgpu enables the first two GPUs.

```
$ uname -a
Linux tsukiakari-nixos 6.11.4 #1-NixOS SMP PREEMPT_DYNAMIC Thu Oct 17 13:27:02 UTC 2024 x86_64 GNU/Linux
# dmesg | grep amdgpu | head -n115
[   22.170939] amdgpu 0000:05:00.0: enabling device (0000 -> 0003)
[   22.185546] amdgpu 0000:05:00.0: amdgpu: Fetched VBIOS from ROM BAR
[   22.185552] amdgpu: ATOM BIOS: 113-D3432400-100
[   22.194004] amdgpu 0000:05:00.0: amdgpu: Trusted Memory Zone (TMZ) feature not supported
[   22.194134] amdgpu 0000:05:00.0: amdgpu: MEM ECC is active.
[   22.194136] amdgpu 0000:05:00.0: amdgpu: SRAM ECC is active.
[   22.194154] amdgpu 0000:05:00.0: amdgpu: RAS INFO: ras initialized successfully, hardware ability[67f7f] ras_mask[67f7f]
[   22.194258] amdgpu 0000:05:00.0: amdgpu: VRAM: 32752M 0x0000008000000000 - 0x00000087FEFFFFFF (32752M used)
[   22.194262] amdgpu 0000:05:00.0: amdgpu: GART: 512M 0x0000000000000000 - 0x000000001FFFFFFF
[   22.194534] [drm] amdgpu: 32752M of VRAM memory ready
[   22.194537] [drm] amdgpu: 257869M of GTT memory ready.
[   22.253202] amdgpu 0000:05:00.0: amdgpu: reserve 0x400000 from 0x87fe800000 for PSP TMR
[   22.320931] amdgpu 0000:05:00.0: amdgpu: RAP: optional rap ta ucode is not available
[   22.320988] amdgpu 0000:05:00.0: amdgpu: use vbios provided pptable
[   22.320991] amdgpu 0000:05:00.0: amdgpu: smc_dpm_info table revision(format.content): 4.6
[   22.320994] amdgpu 0000:05:00.0: amdgpu: PMFW based fan control disabled
[   22.323882] amdgpu 0000:05:00.0: amdgpu: SMU is initialized successfully!
[   22.552146] amdgpu: HMM registered 32752MB device memory
[   22.555235] kfd kfd: amdgpu: Allocated 3969056 bytes on gart
[   22.555279] kfd kfd: amdgpu: Total number of KFD nodes to be created: 1
[   22.555715] amdgpu: Virtual CRAT table created for GPU
[   22.556830] amdgpu: Topology: Add dGPU node [0x738c:0x1002]
[   22.556834] kfd kfd: amdgpu: added device 1002:738c
[   22.556859] amdgpu 0000:05:00.0: amdgpu: SE 8, SH per SE 1, CU per SH 16, active_cu_number 120
[   22.556866] amdgpu 0000:05:00.0: amdgpu: ring comp_1.0.0 uses VM inv eng 0 on hub 0
[   22.556869] amdgpu 0000:05:00.0: amdgpu: ring comp_1.1.0 uses VM inv eng 1 on hub 0
[   22.556872] amdgpu 0000:05:00.0: amdgpu: ring comp_1.2.0 uses VM inv eng 4 on hub 0
[   22.556874] amdgpu 0000:05:00.0: amdgpu: ring comp_1.3.0 uses VM inv eng 5 on hub 0
[   22.556877] amdgpu 0000:05:00.0: amdgpu: ring comp_1.0.1 uses VM inv eng 6 on hub 0
[   22.556879] amdgpu 0000:05:00.0: amdgpu: ring comp_1.1.1 uses VM inv eng 7 on hub 0
[   22.556881] amdgpu 0000:05:00.0: amdgpu: ring comp_1.2.1 uses VM inv eng 8 on hub 0
[   22.556883] amdgpu 0000:05:00.0: amdgpu: ring comp_1.3.1 uses VM inv eng 9 on hub 0
[   22.556886] amdgpu 0000:05:00.0: amdgpu: ring kiq_0.2.1.0 uses VM inv eng 10 on hub 0
[   22.556888] amdgpu 0000:05:00.0: amdgpu: ring sdma0 uses VM inv eng 0 on hub 8
[   22.556890] amdgpu 0000:05:00.0: amdgpu: ring sdma1 uses VM inv eng 1 on hub 8
[   22.556893] amdgpu 0000:05:00.0: amdgpu: ring sdma2 uses VM inv eng 4 on hub 8
[   22.556895] amdgpu 0000:05:00.0: amdgpu: ring sdma3 uses VM inv eng 5 on hub 8
[   22.556897] amdgpu 0000:05:00.0: amdgpu: ring sdma4 uses VM inv eng 6 on hub 8
[   22.556899] amdgpu 0000:05:00.0: amdgpu: ring sdma5 uses VM inv eng 0 on hub 12
[   22.556902] amdgpu 0000:05:00.0: amdgpu: ring sdma6 uses VM inv eng 1 on hub 12
[   22.556904] amdgpu 0000:05:00.0: amdgpu: ring sdma7 uses VM inv eng 4 on hub 12
[   22.556906] amdgpu 0000:05:00.0: amdgpu: ring vcn_dec_0 uses VM inv eng 5 on hub 12
[   22.556909] amdgpu 0000:05:00.0: amdgpu: ring vcn_enc_0.0 uses VM inv eng 6 on hub 12
[   22.556911] amdgpu 0000:05:00.0: amdgpu: ring vcn_enc_0.1 uses VM inv eng 7 on hub 12
[   22.556913] amdgpu 0000:05:00.0: amdgpu: ring vcn_dec_1 uses VM inv eng 8 on hub 12
[   22.556916] amdgpu 0000:05:00.0: amdgpu: ring vcn_enc_1.0 uses VM inv eng 9 on hub 12
[   22.556918] amdgpu 0000:05:00.0: amdgpu: ring vcn_enc_1.1 uses VM inv eng 10 on hub 12
[   22.556920] amdgpu 0000:05:00.0: amdgpu: ring jpeg_dec_0 uses VM inv eng 11 on hub 12
[   22.556923] amdgpu 0000:05:00.0: amdgpu: ring jpeg_dec_1 uses VM inv eng 12 on hub 12
[   22.570774] amdgpu 0000:05:00.0: amdgpu: overdrive feature is not supported
[   22.570892] amdgpu: Detected AMDGPU 6 Perf Events.
[   22.573492] amdgpu 0000:05:00.0: amdgpu: Runtime PM not available
[   22.573688] [drm] Initialized amdgpu 3.59.0 for 0000:05:00.0 on minor 1
[   22.637006] amdgpu 0000:45:00.0: enabling device (0000 -> 0003)
[   22.647678] amdgpu 0000:45:00.0: amdgpu: Fetched VBIOS from ROM BAR
[   22.647683] amdgpu: ATOM BIOS: 113-D3431500-101
[   22.649400] amdgpu 0000:45:00.0: amdgpu: Trusted Memory Zone (TMZ) feature not supported
[   22.649527] amdgpu 0000:45:00.0: amdgpu: MEM ECC is active.
[   22.649530] amdgpu 0000:45:00.0: amdgpu: SRAM ECC is active.
[   22.649553] amdgpu 0000:45:00.0: amdgpu: RAS INFO: ras initialized successfully, hardware ability[67f7f] ras_mask[67f7f]
[   22.649646] amdgpu 0000:45:00.0: amdgpu: VRAM: 32752M 0x0000008000000000 - 0x00000087FEFFFFFF (32752M used)
[   22.649650] amdgpu 0000:45:00.0: amdgpu: GART: 512M 0x0000000000000000 - 0x000000001FFFFFFF
[   22.649942] [drm] amdgpu: 32752M of VRAM memory ready
[   22.649945] [drm] amdgpu: 257869M of GTT memory ready.
[   22.708825] amdgpu 0000:45:00.0: amdgpu: reserve 0x400000 from 0x87fe800000 for PSP TMR
[   22.778034] amdgpu 0000:45:00.0: amdgpu: RAP: optional rap ta ucode is not available
[   22.778090] amdgpu 0000:45:00.0: amdgpu: use vbios provided pptable
[   22.778092] amdgpu 0000:45:00.0: amdgpu: smc_dpm_info table revision(format.content): 4.6
[   22.781029] amdgpu 0000:45:00.0: amdgpu: SMU is initialized successfully!
[   23.014695] amdgpu: HMM registered 32752MB device memory
[   23.017872] kfd kfd: amdgpu: Allocated 3969056 bytes on gart
[   23.017918] kfd kfd: amdgpu: Total number of KFD nodes to be created: 1
[   23.018425] amdgpu: Virtual CRAT table created for GPU
[   23.020488] amdgpu: Topology: Add dGPU node [0x738c:0x1002]
[   23.020493] kfd kfd: amdgpu: added device 1002:738c
[   23.020519] amdgpu 0000:45:00.0: amdgpu: SE 8, SH per SE 1, CU per SH 16, active_cu_number 120
[   23.020526] amdgpu 0000:45:00.0: amdgpu: ring comp_1.0.0 uses VM inv eng 0 on hub 0
[   23.020529] amdgpu 0000:45:00.0: amdgpu: ring comp_1.1.0 uses VM inv eng 1 on hub 0
[   23.020531] amdgpu 0000:45:00.0: amdgpu: ring comp_1.2.0 uses VM inv eng 4 on hub 0
[   23.020534] amdgpu 0000:45:00.0: amdgpu: ring comp_1.3.0 uses VM inv eng 5 on hub 0
[   23.020536] amdgpu 0000:45:00.0: amdgpu: ring comp_1.0.1 uses VM inv eng 6 on hub 0
[   23.020538] amdgpu 0000:45:00.0: amdgpu: ring comp_1.1.1 uses VM inv eng 7 on hub 0
[   23.020540] amdgpu 0000:45:00.0: amdgpu: ring comp_1.2.1 uses VM inv eng 8 on hub 0
[   23.020543] amdgpu 0000:45:00.0: amdgpu: ring comp_1.3.1 uses VM inv eng 9 on hub 0
[   23.020545] amdgpu 0000:45:00.0: amdgpu: ring kiq_0.2.1.0 uses VM inv eng 10 on hub 0
[   23.020547] amdgpu 0000:45:00.0: amdgpu: ring sdma0 uses VM inv eng 0 on hub 8
[   23.020550] amdgpu 0000:45:00.0: amdgpu: ring sdma1 uses VM inv eng 1 on hub 8
[   23.020552] amdgpu 0000:45:00.0: amdgpu: ring sdma2 uses VM inv eng 4 on hub 8
[   23.020554] amdgpu 0000:45:00.0: amdgpu: ring sdma3 uses VM inv eng 5 on hub 8
[   23.020556] amdgpu 0000:45:00.0: amdgpu: ring sdma4 uses VM inv eng 6 on hub 8
[   23.020559] amdgpu 0000:45:00.0: amdgpu: ring sdma5 uses VM inv eng 0 on hub 12
[   23.020561] amdgpu 0000:45:00.0: amdgpu: ring sdma6 uses VM inv eng 1 on hub 12
[   23.020563] amdgpu 0000:45:00.0: amdgpu: ring sdma7 uses VM inv eng 4 on hub 12
[   23.020566] amdgpu 0000:45:00.0: amdgpu: ring vcn_dec_0 uses VM inv eng 5 on hub 12
[   23.020568] amdgpu 0000:45:00.0: amdgpu: ring vcn_enc_0.0 uses VM inv eng 6 on hub 12
[   23.020570] amdgpu 0000:45:00.0: amdgpu: ring vcn_enc_0.1 uses VM inv eng 7 on hub 12
[   23.020573] amdgpu 0000:45:00.0: amdgpu: ring vcn_dec_1 uses VM inv eng 8 on hub 12
[   23.020575] amdgpu 0000:45:00.0: amdgpu: ring vcn_enc_1.0 uses VM inv eng 9 on hub 12
[   23.020578] amdgpu 0000:45:00.0: amdgpu: ring vcn_enc_1.1 uses VM inv eng 10 on hub 12
[   23.020580] amdgpu 0000:45:00.0: amdgpu: ring jpeg_dec_0 uses VM inv eng 11 on hub 12
[   23.020582] amdgpu 0000:45:00.0: amdgpu: ring jpeg_dec_1 uses VM inv eng 12 on hub 12
[   23.034372] amdgpu 0000:45:00.0: amdgpu: overdrive feature is not supported
[   23.034505] amdgpu: Detected AMDGPU 6 Perf Events.
[   23.037097] amdgpu 0000:45:00.0: amdgpu: Runtime PM not available
[   23.040319] [drm] Initialized amdgpu 3.59.0 for 0000:45:00.0 on minor 2
```