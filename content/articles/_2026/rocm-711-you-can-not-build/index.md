+++
# mi ken (ala) pali
title = "ROCm 7.1.1: you can (not) build"
date = 2026-02-22
description = "Issues encountered while building and maintaining ROCm packages"
tags = ["rocm"]
embed_image = "/articles/rocm-711-you-can-not-build/og-image.png?a3"
+++

<div class="eva">
  <div class="date">2026-02-22 by Luna Nova</div>
  <div class="title">ROC<span class="emboss-m">m</span></div>
  <div class="ver">:7.1<span class="dot">.</span>1</div>
  <div class="sub"><span class="sub-red">You can </span>(not)<span class="sub-red"> build.</span></div>
</div>

<br/>

ROCm[^acronymnt] is AMD's open source ecosystem for GPU accelerated compute. ROCm is critical for blender ray-tracing and machine learning on AMD, among many other workloads. If you're lucky, you can use vulkan instead.  
I've been maintaining the ROCm package set in nixpkgs for a year or so.  
Here are some helpful takeaways for your upcoming experience building all ROCm packages for all supported graphics targets, or maybe just one:

<style>
article {
	font-size: 120%;
}

/* replacement header */
article > div:first-child {
  display: none;
}

ul {
	list-style-type: disc;
}
li::marker {
	color: gray;
}

article div > ul > li + li {
	margin-top: 10px;
}


/* Shift page scheme to have radeon red bg */
:root {
  --luna_mane_deep: #2a0a0f !important;
  --luna_mane_mid: #3d1520 !important;
  --luna_night: #2d0f12 !important;
  --luna_mane_purple: #8b4450 !important;
	--blue_light: #eca9bf !important;
	/* --luna_hair_fill: #9b3430 !important;
	--luna_hair_outer: #ab2480 !important;
	--luna_hoof_slippers: #773062 !important;
	--blue: #773062 !important; */
  --eva-serif: 'Times New Roman', 'Didot', 'Bodoni MT', 'GFS Didot', 'Noto Serif Display', 'Georgia', 'Palatino Linotype', serif;
  --eva-mono: 'SF Mono', 'Cascadia Mono', 'JetBrains Mono', 'Consolas', 'Liberation Mono', monospace;
}

.eva {
  border-left: 4px solid #d32f2f;
  padding: 0 1.5rem 1rem;
  margin: 0;
  position: relative;
  overflow: hidden;

  .date {
    font-family: var(--eva-mono);
    font-size: 1rem;
    color: #666;
    letter-spacing: 0.1em;
    padding: 0.1rem;
    float: right;
  }

  .title {
    font-family: var(--eva-serif);
    font-size: 6rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #ffffff;
    margin: 0;
    line-height: 1;
    transform: scaleX(0.75);
    transform-origin: left;
  }

  .ver {
    font-family: var(--eva-serif);
    font-size: 5rem;
    font-weight: 700;
    color: #d32f2f;
    margin: -0.25rem 0 0 0;
    letter-spacing: 0.1em;
    transform: scaleX(0.75);
    transform-origin: left;

    .dot { opacity: 0.3; }
  }

  .emboss-m {
    text-shadow: 0.11em 0.07em 0 #d32f2f;
  }

  .sub {
    font-family: var(--eva-serif);
    font-size: 5rem;
    font-weight: 700;
    color: #cccccc;
    letter-spacing: 0.025em;
    text-transform: none;
    transform: scaleX(0.70);
    transform-origin: right;
    margin: 0rem 0 0 0;
    text-align: right;
		white-space: nowrap;

    .sub-red { color: #d32f2f; }
  }

  @media (max-width: 900px) {
    .title { font-size: 5rem; }
    .ver { font-size: 4rem; }
    .sub { font-size: 4rem; }
  }
  @media (max-width: 700px) {
    .title { font-size: 4rem; }
    .ver { font-size: 3rem; }
    .sub { font-size: 3rem; }
  }
  @media (max-width: 500px) {
    .title { font-size: 3rem; }
    .ver { font-size: 2.25rem; }
    .sub { font-size: 2.25rem; }
  }
}

#ram-cost {
  font-family: monospace;
  font-weight: bold;
  font-size: 1.1em;
  color: var(--magenta, #ff00ff);
}

.htop {
  background: #0c0c0c;
  color: #aaa;
  font-family: 'Cascadia Mono', 'Fira Code', 'Consolas', 'Liberation Mono', monospace;
  font-size: 11px;
  line-height: 1.3;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
  width: fit-content;
  max-width: calc(100vw - 16px);
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  .hg { color: #33d17a; font-weight: bold; }
  .hr { color: #ff3333; font-weight: bold; }
  .hw { color: #fff; font-weight: bold; }
  .hc { color: #33c7de; font-weight: bold; }
  .htop-hdr { color: #000; background: #33d17a; font-weight: bold; width: 100%; display: inline-block; }
}

/* Win95 OOM dialog */
.win95-overlay {
  display: none;
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9998;
}
.win95-dialog {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  white-space: normal;
  background: #c0c0c0;
  font: 14px 'Microsoft Sans Serif', 'Tahoma', 'Arial', sans-serif;
  color: #000;
  border: 2px outset #fff;
  outline: 1px solid #000;
  box-shadow: 2px 2px 0 #000;
  min-width: 380px;

  .win95-titlebar {
    background: #000080;
    color: #fff;
    font-weight: bold;
    padding: 2px 4px;
    height: 18px;
    line-height: 18px;
    display: flex;
    align-items: center;
  }

  .win95-body {
    padding: 12px 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;

    svg { flex-shrink: 0; width: 32px; height: 32px; }
    .win95-text { line-height: 1.4; padding-top: 4px; }
  }

  .win95-buttons {
    display: flex;
    justify-content: center;
    padding: 0 16px 12px;
  }

  button {
    background: #c0c0c0;
    font: inherit;
    border: 2px outset #fff;
    outline: 1px solid #000;
    padding: 2px 0;
    min-width: 75px;
    cursor: pointer;
    &:active { border-style: inset; }
    &:focus { outline: 1px dotted #000; outline-offset: -4px; }
  }
}
</style>

- You will not have enough CPU cores
  - 32 threads of Zen 5 are not sufficient for a pleasant experience
  - 128t of EPYC Milan are not sufficient for a pleasant experience
  - 256t of EPYC eng sample **overclocked to 5.6GHz** are not sufficient for a pleasant experience[^ck]
  - Expect load averages resembling telephone numbers
- You will not have enough RAM
  - 32GiB is impossible[^hipblaslt-ram]
  - 96GiB is not sufficient for a pleasant experience
  - 512GiB is still insufficient to allow full parallelism
  - Please insert <span id="ram-cost">$6,000</span>[^ram-shortage] to continue

<div class="htop" role="presentation" aria-hidden="true"><div id="htop-cpus"></div>
  Mem[<span id="htop-mem-bar" class="hg">||||||||||||||||||||||||||||||||||||||||||||||||||||||||</span><span id="htop-mem-pad">    </span><span id="htop-mem-used" class="hw">474G</span>/503G] Tasks: <span class="hw" id="htop-tasks">571</span>, 414 thr, 1554 kthr; <span class="hg">128 running</span>
  Swp[<span id="htop-swp-bar"></span><span id="htop-swp-pad">                                                           </span><span id="htop-swp-used">320K</span>/132G] Load average: <span class="hw" id="htop-la">295.80 289.35 237.34</span>
                                                                            Uptime: <span id="htop-uptime">08:13:57</span>
<span class="htop-hdr">  PID  USER         PRI  NI  VIRT  RES   SHR S CPU% MEM%  TIME+    Command</span>
<div id="htop-procs"></div><div id="win95-overlay" class="win95-overlay"></div><div id="win95-oom" class="win95-dialog">
  <div class="win95-titlebar">Singularity detected in C:\WINDOWS\WIN386.SWP</div>
  <div class="win95-body">
    <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" stroke-width="1"/><line x1="10" y1="10" x2="22" y2="22" stroke="#fff" stroke-width="3"/><line x1="22" y1="10" x2="10" y2="22" stroke="#fff" stroke-width="3"/></svg>
    <div class="win95-text">There is not enough free memory to run this program.<br><br>Quit one or more programs, and then try again.</div>
  </div>
  <div class="win95-buttons"><button id="win95-ok">OK</button></div>
</div></div>

- Your GPU model is not supported at build time by packages that are required link dependencies[^pytorch-hipblaslt] of other major packages  
  - You can not build an empty stub library.
  - You set `GPU_TARGETS` to a random supported model. It's ignored.
  - The library wanted `AMDGPU_TARGETS` or `GPU_ARCHS` or `SUPPORTED_TARGETS` or `CMAKE_HIP_ARCHITECTURES` or `PYTORCH_ROCM_ARCH` or `AOTRITON_TARGET_ARCH` or `HIP_ARCHITECTURES`
- Your package output is too large for your distro's infrastructure[^hipblaslt-metadata]
- You find out that a critical package is secretly both a compiler templating torture test *and* a machine learning library[^ck]  
  - You wait 15 minutes for a single CXX file to be compiled, then 8×15 minutes more as it builds for all ISAs  
  - You are forced to split it into ≈20 sub-builds that smuggle object files through build outputs using timestamp manipulation to trick make[^ck-build-architecture]
- You run out of space after a core matrix multiplication package emits 200GiB of assembly files mid build[^hipblaslt-disk-usage]  
  - You discover War and Peace 25,000 times over in assembly comments[^war-and-peace-math]
- You spend an entire Google Summer of Code project fixing ROCm packages for Gentoo[^gsoc-gentoo]  
- You find many circular dependencies[^circular]
- A major library's kernels aren't showing up in git. After great confusion, you realize upstream's lfsconfig excludes all files[^miopen-fetch]
- You build for AArch64. Some packages set x64 specific flags[^rdc] for no discernible reason.
- You try to use two GPUs. The core collective communications library ships with undefined behavior that requires reducing optimization level[^rccl-ub]
- You attempt to improve an upstream build process  
  - You determine that there is no way to safely proceed without a rewrite hundreds of lines into a draft PR[^hipblaslt-draft]
  - You consider rewriting the entire build system in rust  
  - ~~You rewrite the entire build system in rust~~
- You trigger a nixpkgs-review run against a rocmPackages touching PR. 
  - The heat death of the universe arrives prior to its completion

Upstream are trying to fix things. Hopefully we get there some day.

Massive shoutouts to everyone helping out across the ecosystem and distros, in no specific order:

[@bstefanuk](https://github.com/bstefanuk) at AMD for massive refactors to improve CMake setup all across ROCm.  
[@stellaraccident](https://github.com/stellaraccident) at AMD who is trying to split up packages by ISA in a more principled way that separates host code and kernels with the new `kpack` format.  
[@GZGavinZhao](https://github.com/GZGavinZhao) at Solus/NixOS for maintaining a patch set that allows similar-enough ISAs to load eg 1031 loads 1030 to get best-effort support for unsupported ISAs, among other significant efforts for Solus and NixOS ROCm support.  
[@AngryLoki](https://github.com/AngryLoki) at Gentoo consistently upstreaming patches which are often of help for all distros.  
[@Madouura](https://github.com/Madouura) for the herculean task of getting much of ROCm into nixpkgs initially. Hasn't been seen in some time. Maybe understandably burned out from the scope and the mess.  
[@Flakebi](https://github.com/Flakebi), [@mschwaig](https://github.com/mschwaig) for review (through the present) and contributions (mostly in the 5.x and 6.x era) for NixOS.  
[@06kellyjac](https://github.com/06kellyjac) and [@Wulfsta](https://github.com/Wulfsta) for help with Strix Halo and Radeon VII testing for NixOS.  

---

[^acronymnt]: ROCm… does it stand for Radeon Open Co*m*pute? Compute modules? Compute ecosysteM? Nope! Radeon Open Compute Platform [but P sounded worse than m](https://github.com/ROCm/ROCm/issues/1628#issuecomment-1448989962) apparently. AMD's [official statement](https://github.com/ROCm/ROCm/issues/1628#issuecomment-1448989962) is "ROCm no longer functions as an acronym.". "no longer". So. it functioned before anyone asked how the m stands for Platform, but now that the disconnect has been noticed, it can't function in the future. Wile E. Coyote acronymics.

[^ck]: composable_kernel is ostensibly a machine learning library providing optimized kernels. In practice it's a compiler torture test. The template instantiations are so complex that a single kernel `device_grouped_conv2d_fwd_xdl_ngchw_gkcyx_ngkhw_f16_instance` (one of thousands) takes 15 minutes of clang++ time **per** `--offload-arch`. Upstream are beginning to address this by tidying up the inadvertent [tremendously tangled templated tensor tile torture test](https://github.com/ROCm/composable_kernel/issues/3575) with some more modern and faster C++ usage.

[^hipblaslt-ram]: hipBLASlt's Tensile kernel generator will nom RAM until you OOM. The specific limit is unclear - over time it has varied - but at worst 96GiB has been documented as insufficient in [supermassive RAM usage with TensileCreateLibrary #316](https://github.com/ROCm/rocm-libraries/issues/316). If you're building for a single ISA and that ISA isn't gfx942 you can *probably get away* with <32GB. Maybe. Unless things got worse.

[^ram-shortage]: RAM prices have [dramatically increased by around 3× to 6× over 6 months following September 2025](https://pcpartpicker.com/trends/price/memory/), primarily due to demand for AI compute.

[^pytorch-hipblaslt]: pytorch hard depends on linking with hipblaslt, but hipblaslt can't build for arches like gfx1030 and gfx90c. This has caused a lot of trouble - see [ROCm loses some supported GPUs by requiring hipblaslt #119081
](https://github.com/pytorch/pytorch/issues/119081). Users and distros have resorted to patching hipblaslt to allow generating a stub build with no device kernels, or building for an extra throwaway arch that will not be used at runtime.

[^hipblaslt-metadata]: Without a nixpkgs-carried patch, hipBLASLt's Tensile kernel metadata files (.dat) were stored in verbose formats reaching 80MiB+ per lazy library for some ISAs and >10GiB overall. The patch enables zstd compression of msgpack-formatted metadata, dramatically reducing file sizes. See [rocm-libraries issue #1327](https://github.com/ROCm/rocm-libraries/issues/1327) and nixpkgs' [messagepack-compression-support.patch](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/rocm-modules/6/hipblaslt/messagepack-compression-support.patch) applied since ROCm 6.4.

[^ck-build-architecture]: Smuggling .o files between nix derivations to avoid a single build that hits hydra's 10 hour build timeout and to make it possible to parallelise across a multi box build farm. See default.nix and base.nix in the [composable_kernel dir in nixpkgs](https://github.com/NixOS/nixpkgs/tree/25.11/pkgs/development/rocm-modules/6/composable_kernel).

[^hipblaslt-disk-usage]: hipBLASLt's Tensile kernel generator has catastrophic temporary disk space usage. The build process emits assembly files with extraordinarily verbose comments. Repeated helpful annotation like `// 1 wait state required when next inst writes vgprs held by previous dwordx4 store inst`. As of ROCm 6.4.3 a build materializes all assembly files simultaneously before converting them to code objects, consuming **240GB** of temporary space, of which ≈90GB was comment spam alone.

    Investigation in [nixpkgs PR #449985](https://github.com/NixOS/nixpkgs/pull/449985) suppressed the verbose comments, reducing peak usage to 150GB. Follow-up work ([PR #451188](https://github.com/NixOS/nixpkgs/pull/451188)) applied a major Tensile refactor: instead of materializing all assembly files at once, they're converted to code objects immediately and unlinked. This brought peak build space down to 25GB—a 90% reduction from the original 240GB. Even after these improvements, hipblaslt still requires 25GB+ of temporary space to build.

    These patches have not been merged and are interminably in draft status due to general state of hipblaslt. Upstream [have merged](https://github.com/ROCm/rocm-libraries/commit/f27f34076a02df70a4d19fbc6452d6aa98ae08f5) a smaller change which unlinks assembly but not object files recently which helps a bit. This arrived in ROCm 7.2.0.

[^war-and-peace-math]: War and Peace as plain text is approximately 3.7 MiB. The ≈90 GiB of assembly comments in hipBLASLt's build output (across all ISAs) works out to roughly 25,000 copies.

[^gsoc-gentoo]: A 12-week Google Summer of Code project — "Refining ROCm Packages in Gentoo" — documented much ROCm trouble. The [Week 2 report](https://blogs.gentoo.org/gsoc/2022/07/12/week-2-report-for-refining-rocm-packages-in-gentoo/) recounted many issues with cyclic dependencies. The developer preserved their unrebased git history of "battling against hip" as a cautionary tale in a branch. The [project summary](https://blogs.gentoo.org/gsoc/2022/09/12/refining-rocm-packages-in-gentoo-project-summary/) notes that the original proposal allocated one week to porting ROCm to vanilla clang. The [Week 5 report](https://blogs.gentoo.org/gsoc/2022/07/18/week-5-report-for-refining-rocm-packages-in-gentoo/) records new problems surfacing continuously, forcing TensorFlow and JAX support to be abandoned.

[^circular]: aotriton ↔ torch. aqlprofile ↔ rocm-runtime. rocprofiler-register ↔ clr.

[^miopen-fetch]: 'FIXME: if someone can reduce the level of awful here that would be really nice.'. [20 lines to](https://github.com/NixOS/nixpkgs/blob/62f602d24be70e13dda7df3fa499c59c0c71acb9/pkgs/development/rocm-modules/miopen/default.nix#L84-L103) re-add a remote, fetch tags, clean, switch branches, remove the broken config, re-track *.kdb.bz2, fetch and pull LFS objects, then delete .git.

[^rdc]: rdc sets `-m64 -msse -msse2` in its CMakeLists. Not clear why, [PR raised to fix this](https://github.com/ROCm/rocm-systems/pull/2423) along with flag clobbering due to ordering before project().

[^rccl-ub]: RCCL (AMD's NCCL equiv.) is built with `-O2 -fno-strict-aliasing` [in nixpkgs](https://github.com/NixOS/nixpkgs/blob/62f602d24be70e13dda7df3fa499c59c0c71acb9/pkgs/development/rocm-modules/rccl/default.nix#L118-L121) because of UB in the upstream code which caused it to [fall over at runtime](https://github.com/ROCm/rccl/issues/1454).

[^hipblaslt-draft]: nixpkgs vendors parts of a [draft PR](https://github.com/ROCm/rocm-libraries/pull/2073) that optimizes the tensile python process memory and disk usage. See discussion for how this isn't safe in more detail. The existing code relies on mutation and defensive cloning such that removing deep clones to improve memory usage is risky. There is no static analysis tool that can handle checking changes are correct in this untyped python codebase.



---

<div id="comment-section"></div>
<script src="./rocm-build-issues.js" async></script>
<script type="module" defer>
import Comments from '/atproto-comments.js';
new Comments(
    document.getElementById('comment-section'), // where to inject the comments
    "/comments.css", // comments specific CSS
    'https://public.api.bsky.app/', // AppView base URL for API call
    'at://did:plc:j3hvz7sryv6ese4nuug2djn7/app.bsky.feed.post/3mfivdum5q22o' // URI of the root of the thread to load
).render();
</script>
