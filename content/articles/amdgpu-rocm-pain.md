+++
title = "amdgpu gpu_recovery is impressive but required too often"
date = 2022-10-01
description = "amdgpu keeps hanging when using ROCM"

[taxonomies]
tags = ["amdgpu", "rocm", "linux"]
+++

AMDGPU keeps impressing me by recovering from GPU crashes without interrupting my X session.

It keeps letting me down by crashing whenever I run mixed compute and graphics loads on the same GPU.

Very mixed feelings on this. Can I trade the awesome crash recovery for not crashing in the first place please?

See [the stable diffusion post's AMD section for some more details](@/articles/stable-diffusion-training-notes/index.md#amdgpu-hang).
