+++
title = "OSS Contributions Index"
description = "Curated index of Luna Nova's open source ecosystem contributions & endorsements across domains"
render = true
weight = 1
+++

Index of contributions to open source ecosystems that provide signal as to my background, perseverance and technical domains.  
Filtered roughly for impact & for domains with sustained engagement to keep the page a reasonable size.

# Machine Learning & GPGPU Compute

## General ML & GPGPU Compute upstream

- [triton-lang/triton#9628](https://github.com/triton-lang/triton/pull/9628) — [AMD] Add GCN5.1 / gfx906 target (merged)
- [triton-lang/triton#9629](https://github.com/triton-lang/triton/pull/9629) — [AMD] Fix two broken dot lit tests that missed `-COUNT-` (merged)
- [triton-lang/triton#9636](https://github.com/triton-lang/triton/pull/9636) — [**Blackwell**] Fix thrown away load due to wrong wait placement (merged)
- [triton-lang/triton#7959](https://github.com/triton-lang/triton/pull/7959) — [AMD] Search HIP_PATH, hipconfig, and ROCM_PATH for libamdhip64 (merged)
- [GPUOpen-LibrariesAndSDKs/HIPRT#48](https://github.com/GPUOpen-LibrariesAndSDKs/HIPRT/pull/48) — Remove encryption support and bundled easy-encrypt source/binaries (merged)
- [amd/blis#44](https://github.com/amd/blis/pull/44) — configure: follow reproducible-builds spec for SOURCE_DATE_EPOCH (merged via AMD-internal flow)
- [sofa-framework/sofa#5698](https://github.com/sofa-framework/sofa/pull/5698) — [SofaMatrix] Allow newer metis versions. Closed, [#5732](https://github.com/sofa-framework/sofa/pull/5732) merged based on it.

## ROCm upstream

- [ROCm/rocm-systems#3800](https://github.com/ROCm/rocm-systems/pull/3800) — [rocprof-trace-decoder] Fix missing test dependency (merged)
- [ROCm/rocm-systems#2850](https://github.com/ROCm/rocm-systems/pull/2850) — rocr-runtime: fix segfault when queue allocation fails
- [ROCm/rccl#1470](https://github.com/ROCm/rccl/pull/1470) — net_ib: fix out of bounds read in ncclIbGdrSupport on non-RDMA kernel
- [ROCm/rocMLIR#1708](https://github.com/ROCm/rocMLIR/pull/1708) — GridwiseGemmParams: fix compile error with LLVM libc++ due to missing const
- [ROCm/AMDMIGraphX#4300](https://github.com/ROCm/AMDMIGraphX/pull/4300) — support msgpack 6.x as msgpack-cxx
- [ROCm/aotriton#116](https://github.com/ROCm/aotriton/pull/116) — AOTRITON_INHERIT_SYSTEM_SITE_TRITON flag
- [ROCm/hipfort#260](https://github.com/ROCm/hipfort/pull/260) — unify cmake_minimum_required versions and allow 4.0
- [ROCm/ROCR-Runtime#274](https://github.com/ROCm/ROCR-Runtime/pull/274) — set underlying type of hsa_region_info_t to int. AMD dev opened [their own PR #289](https://github.com/ROCm/ROCR-Runtime/pull/289) based on it.
- [ROCm/llvm-project#183](https://github.com/ROCm/llvm-project/pull/183) — [hipcc] Remove extra definition of hipBinUtilPtr_ in derived platforms. Closed with ["cloned to our internal repo"](https://github.com/ROCm/llvm-project/pull/183#issuecomment-1772488506), attribution lost.

Awaiting merge…

- [ROCm/rocm-systems#2423](https://github.com/ROCm/rocm-systems/pull/2423) — fix(rdc): Fix CXXFLAGS clobbering and incompatibility with non-x64 architecture
- [ROCm/rocm-systems#2424](https://github.com/ROCm/rocm-systems/pull/2424) — fix(rdc): use pkg-config to find libcap
- [ROCm/ROCR-Runtime#273](https://github.com/ROCm/ROCR-Runtime/pull/273) — Fix multiple places with undefined behavior due to signed 1 << 31. [Imported to rocm-systems#253](https://github.com/ROCm/rocm-systems/pull/253).

# NixOS / Nixpkgs

- Nixpkgs Committer. [Commit nomination/grant discussion](https://github.com/NixOS/nixpkgs-committers/pull/58)
  > I’ve worked with @LunNova on finally enabling PIE by default, CMake 4 fixes, and LLVM packaging changes relating to ROCm. I’ve found her to be highly skilled, easy to collaborate with, good at diving into unfamiliar issues across diverse areas quickly, and to have good taste for maintainable solutions. I strongly endorse her for commit access. ~ emilazy, nixpkgs core team member

	> I nominate @LunNova for commit access. Luna is currently the most active maintainer on the ROCm (compute on AMD GPUs) package set which, since earlier this month, gets redistributed via cache.nixos.org! I have found her to be very capable when dealing with the enormous size of these packages and in her communication with upstream. Other notable contributions are the PIE enablement on packages built with GCC and the Go compiler.
  >  Luna has 94 merged PRs and close to 300 reviewed PRs. She started contributing in 2022, but really ramped up her contributions in 2025.
  >  I am confident that nixpkgs will benefit from granting LunNova commit privileges. I enjoy interacting with her! ~ mweinelt, nixos infra
- De facto ROCm team lead. Driven all major version bumps after 6.0.2 (which was handled by mschwaig.)

## ROCm packaging

De facto lead for ROCm package set in Nixpkgs.

Major version bumps:

- [#367695](https://github.com/NixOS/nixpkgs/pull/367695) — rocmPackages: 6.0.2 -> 6.3.3
- [#427944](https://github.com/NixOS/nixpkgs/pull/427944) — rocmPackages: 6.3.3 -> 6.4.3
- [#469378](https://github.com/NixOS/nixpkgs/pull/469378) — rocmPackages: 6.4.3 -> 7.0.2
- [#481349](https://github.com/NixOS/nixpkgs/pull/481349) — rocmPackages: 7.0.2 -> 7.1.1
- [#484792](https://github.com/NixOS/nixpkgs/pull/484792) — rocmPackages: 7.1.1 -> 7.2.0

Selected fixes:

- [#497818](https://github.com/NixOS/nixpkgs/pull/497818) — rocmPackages.llvm: fix infinite loop in LLVM legalizer for AVX512 v64i8 ↔ v32i16 vector shuffles. Diagnosed via gdb, backported three upstream LLVM patches ([fixes #497745](https://github.com/NixOS/nixpkgs/issues/497745))
- [#498395](https://github.com/NixOS/nixpkgs/pull/498395) — rocmPackages.{clr,migraphx,miopen,rocm-comgr}: fix runtime hiprtc failures. Multi-part fix: rpath for hiprtc, hardcoded /opt/rocm path in miopen, LLVM fallback for C++ stdlib, plus impure tests ([fixes #498371](https://github.com/NixOS/nixpkgs/issues/498371))
- [#497809](https://github.com/NixOS/nixpkgs/pull/497809) — rocmPackages.rocm-comgr: fix failure to find code object when xnack any variant should match
- [#451188](https://github.com/NixOS/nixpkgs/pull/451188) — rocmPackages.hipblaslt: massively reduce peak disk space usage
- [#449985](https://github.com/NixOS/nixpkgs/pull/449985) — rocmPackages.hipblaslt: stop inlining war and peace in asm comments
- [#444860](https://github.com/NixOS/nixpkgs/pull/444860) — rocmPackages: clean up, reduce closure sizes
- [#458711](https://github.com/NixOS/nixpkgs/pull/458711) — rocmPackages.rocblas: remove reference to tensile in librocblas, split outputs
- [#489098](https://github.com/NixOS/nixpkgs/pull/489098) — rocmPackages.rocm-runtime: backport CWSR/stack kernel discovery patch
- [#493411](https://github.com/NixOS/nixpkgs/pull/493411) — rocmPackages.clr: add $out/lib to libamdhip64.so's rpath
- [#446976](https://github.com/NixOS/nixpkgs/pull/446976) — pkgs/top-level/release.nix: add jobs for packages rebuilt by enableRocm
- [#447016](https://github.com/NixOS/nixpkgs/pull/447016) — linux/common-config: enable DMABUF_MOVE_NOTIFY and HSA_AMD_P2P

## ML frameworks

- [#457612](https://github.com/NixOS/nixpkgs/pull/457612) — python3Packages.torch: fix ROCm build
- [#436500](https://github.com/NixOS/nixpkgs/pull/436500) — python3Packages.triton: always support ROCm
- [#454399](https://github.com/NixOS/nixpkgs/pull/454399) — onnxruntime: add ROCm support
- [#459965](https://github.com/NixOS/nixpkgs/pull/459965) — onnxruntime: use --compile-no-warning-as-error for clang&ROCm
- [#443311](https://github.com/NixOS/nixpkgs/pull/443311) — llama-cpp: 6442 -> 6479
- [#405457](https://github.com/NixOS/nixpkgs/pull/405457) — ollama-rocm: fix evaluation error when rocmPackages are built for a specific arch
- [#495680](https://github.com/NixOS/nixpkgs/pull/495680) — python3Packages.vllm: fix rocm build
- [#499299](https://github.com/NixOS/nixpkgs/pull/499299) — openblas: swap to CMake build to resolve duplicate symbols on aarch64
- [#444054](https://github.com/NixOS/nixpkgs/pull/444054) — metis: 5.1.0 -> 5.2.1 + cmake4 patch; gklib: init
- [#468810](https://github.com/NixOS/nixpkgs/pull/468810) — amd-blis: backport fix for GCC 15 build error
- [#448964](https://github.com/NixOS/nixpkgs/pull/448964) — oneDNN_2: reintroduce and unbreak, rocmPackages.migraphx: use oneDNN_2
- [#436656](https://github.com/NixOS/nixpkgs/pull/436656) — python3Packages.llama-index*: unbreak
- [#457885](https://github.com/NixOS/nixpkgs/pull/457885) — whisper: set knownVulnerabilities due to dated vendored libraries

## Security hardening: PIE by default

Led the initiative to enable Position Independent Executables by default for GCC in nixpkgs, improving ASLR coverage across the distribution. Attempted and reverted similar effort for Go due to time constraints near release window.

- [#439314](https://github.com/NixOS/nixpkgs/pull/439314) — gcc: build with --enable-default-pie
- [#442510](https://github.com/NixOS/nixpkgs/pull/442510) — {cc-wrapper,bintools-wrapper}: drop pie hardening flag
- [#442965](https://github.com/NixOS/nixpkgs/pull/442965) — go: build PIE by default
- [#449771](https://github.com/NixOS/nixpkgs/pull/449771) — treewide: remove usages of obsolete pie hardening flag
- [#452791](https://github.com/NixOS/nixpkgs/pull/452791) — gcc: disable enableDefaultPie when !hasSharedLibraries
- [#461615](https://github.com/NixOS/nixpkgs/pull/461615) — go: revert default PIE changes

## Nix (package manager)

- [NixOS/nix#15417](https://github.com/NixOS/nix/pull/15417) — libstore: handle root path in RemoteFSAccessor::maybeLstat. Fixed `nix build --store ssh-ng://` crashing with "path '/nix/store/' is not in the Nix store" — a regression since nix 2.29 ([fixes NixOS/nix#15418](https://github.com/NixOS/nix/issues/15418))

## CMake 4 transition

Compat fixes across many packages for the CMake 4 transition in nixpkgs staging. Part of wider effort with many people helping out.

- [#445015](https://github.com/NixOS/nixpkgs/pull/445015) — yajl, libuvc: CMake 4 compat
- [#445579](https://github.com/NixOS/nixpkgs/pull/445579) — docker-tini, openhmd: CMake 4 fixes
- [#447855](https://github.com/NixOS/nixpkgs/pull/447855) — playwright-webkit: apply CMake 4 compat patch to overridden libjxl
- [#448902](https://github.com/NixOS/nixpkgs/pull/448902) — clblast: fix build with CMake 4
- [#444478](https://github.com/NixOS/nixpkgs/pull/444478) — magma: apply patch for CMake 4
- [#444483](https://github.com/NixOS/nixpkgs/pull/444483) — python3Packages.triton: relax build-system CMake 4 dep
- [#443947](https://github.com/NixOS/nixpkgs/pull/443947) — rocmPackages.rocm-device-libs: cmake 4 compat

## VR / XR

- [#173907](https://github.com/NixOS/nixpkgs/pull/173907) — monado: 21.0.0 -> unstable-2022-05-28
- [#173839](https://github.com/NixOS/nixpkgs/pull/173839) — libsurvive: 0.4 -> 1.0
- [#173947](https://github.com/NixOS/nixpkgs/pull/173947) — vkdisplayinfo: init at 0.1
- [#448501](https://github.com/NixOS/nixpkgs/pull/448501) — basalt-monado: update

## Other notable Nixpkgs changes

- [#155290](https://github.com/NixOS/nixpkgs/pull/155290) — input-remapper: init at unstable-2022-02-09 (and add NixOS module) - my first Nixpkgs PR and the start of my Nix journey c:
- [#176312](https://github.com/NixOS/nixpkgs/pull/176312) — edk2-uefi-shell: init at 202202
- [#458517](https://github.com/NixOS/nixpkgs/pull/458517) — opencl-cts: init — Full KhronosGroup conformance test suite for OpenCL to aid in validation of ROCm bumps (ROCm includes an OpenCL runtime!)
- [#263201](https://github.com/NixOS/nixpkgs/pull/263201) — build-fhsenv-bubblewrap: remove /usr/lib and /usr/lib32 from LD_LIBRARY_PATH


# Misc Upstream contributions

## Python

- [python/typeshed#7165](https://github.com/python/typeshed/pull/7165) — Add locale.gettext and related stubs (merged)

## Rust crates

- [benfred/remoteprocess#87](https://github.com/benfred/remoteprocess/pull/87) — Don't assume_init on uninitialized memory (merged)
- [benfred/remoteprocess#85](https://github.com/benfred/remoteprocess/pull/85) — Swap unmaintained memmap for memmap2 (merged)
- [GuillaumeGomez/sysinfo#1192](https://github.com/GuillaumeGomez/sysinfo/pull/1192) — Fix misaligned read (merged)
- [GuillaumeGomez/sysinfo#1014](https://github.com/GuillaumeGomez/sysinfo/pull/1014) — Fix more UB in windows/system refresh_processes_specifics (merged)
- [Hpmason/retour-rs#41](https://github.com/Hpmason/retour-rs/pull/41) — Replace udis with iced-x86 (merged)

## input-remapper

- [sezanzeb/input-remapper#264](https://github.com/sezanzeb/input-remapper/pull/264) — Use tempfiles instead of hardcoded /tmp (merged)
- [sezanzeb/input-remapper#265](https://github.com/sezanzeb/input-remapper/pull/265) — Use non-zero exit code if tests fail (merged)
- [sezanzeb/input-remapper#267](https://github.com/sezanzeb/input-remapper/pull/267) — Add github actions workflows (merged)

## Java ecosystem

- [javaparser/javaparser#272](https://github.com/javaparser/javaparser/pull/272) — Add TypedNode interface (merged)
- [projectlombok/lombok#1008](https://github.com/projectlombok/lombok/pull/1008) — Fix canEqual documentation (merged)

## Minecraft modding

Core developer of the [Feed the Beast Launcher](https://github.com/Slowpoke101/FTBLaunch) (2012-2013), the dominant Minecraft modpack platform of its era. FTB's platform was later folded into CurseForge, which was acquired by Twitch/Amazon (2016) and then Overwolf (2020). ~20 merged PRs including the auto self-updating system, logging framework rewrite, window management, and performance improvements. Managed via custom IRC chatops system, source lost to the sands of time.

Selected:

- [Slowpoke101/FTBLaunch#217](https://github.com/Slowpoke101/FTBLaunch/pull/217) — Implement automatic self-updating
- [Slowpoke101/FTBLaunch#402](https://github.com/Slowpoke101/FTBLaunch/pull/402) — New logging implementation
- [Slowpoke101/FTBLaunch#486](https://github.com/Slowpoke101/FTBLaunch/pull/486) — Auto-restore window size and position
- [Slowpoke101/FTBLaunch#505](https://github.com/Slowpoke101/FTBLaunch/pull/505) — Settings cleanup, allow re-opening launcher after closing Minecraft
- [Slowpoke101/FTBLaunch#559](https://github.com/Slowpoke101/FTBLaunch/pull/559) — Set JVM options to increase permgen and enable CMS class unloading

Own projects:

- [github:MinimallyCorrect/TickThreading](https://github.com/MinimallyCorrect/TickThreading) — Multi-threaded Minecraft server mod. Used bytecode transformation at load time to parallelise world ticking across dimensions and within dimensions.
- [github:MinimallyCorrect/TickProfiler](https://github.com/MinimallyCorrect/TickProfiler) — Minecraft server profiler for finding which entities and tile entities are causing lag.

Modding toolchain:

- [MinecraftForge/MinecraftForge#2468](https://github.com/MinecraftForge/MinecraftForge/pull/2468) — Workaround JDK-8087309: constant folding "static final boolean" is incomplete (merged)
- [MinecraftForge/ForgeGradle#453](https://github.com/MinecraftForge/ForgeGradle/pull/453) — Throw exception if using Java 9 (merged)
- [MinecraftForge/ForgeGradle#449](https://github.com/MinecraftForge/ForgeGradle/pull/449) — Close jar files after use (merged)
- [md-5/SpecialSource#44](https://github.com/md-5/SpecialSource/pull/44), [#46](https://github.com/md-5/SpecialSource/pull/46), [#49](https://github.com/md-5/SpecialSource/pull/49) — Implement Closeable in Jar, fix resource leaks (all merged)

## Other

- [kasecato/vscode-intellij-idea-keybindings#317](https://github.com/kasecato/vscode-intellij-idea-keybindings/pull/317) — copyFilePath: add !terminalFocus to condition (merged)
- [MarlinFirmware/Marlin#7091](https://github.com/MarlinFirmware/Marlin/pull/7091) — Fix LIN_ADVANCE stepper freeze: ADV_RATE returning 0 with high steps/mm starved the stepper ISR. Closed, merged via maintainer's [#7094](https://github.com/MarlinFirmware/Marlin/pull/7094).
- [Sonic0/cron-converter#33](https://github.com/Sonic0/cron-converter/pull/33) — Fix DST boundary test failure (merged)
- [fufexan/nix-gaming#86](https://github.com/fufexan/nix-gaming/pull/86) — dxvk, vkd3d-proton: fix build, update, swap to dxvk-gplasync (merged)
