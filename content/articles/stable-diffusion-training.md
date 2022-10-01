+++
title = "Training stable diffusion at home, or lunar-diffusion"
date = 2022-09-27
description = "I fine-tuned stable diffusion at home over a few days, and you can too."
draft = true

[taxonomies]
tags = ["machine learning", "image generation", "stable diffusion", "cuda", "rocm"]
+++

This is a living document which I am using to keep track of my findings during development.  
It is less organized than a typical blog post, and full of TODO and FIXME notes.

Repositories referenced by this post:

- Containers, launcher, and dataloader - https://github.com/LunNova/translunar-diffusion
- Base stable diffusion with optimizations for training - https://github.com/LunNova/InvokeAI-nyoom

Clone "translunar-diffusion" as a dir called "lun" inside the other one. It's also compatible with other SD forks, which is why it's separate.

----

Stable diffusion is an awesome txt2img model. Let's get it ready to train.

We're going to start with the [InvokeAI fork](https://github.com/invoke-ai/InvokeAI), formerly known as lstein/stable-diffusion

<!-- toc -->

# Goals and Results Summary

- upgrade pytorch-lightning to get support for better strategies than DistributedDataParallel
  - done, works
- add a generic, configurable local data source
  - done, works
- make validation optional
  - done, works
- remove any cuda-specific code and full precision casts
  - this should give us fp16 and bf16 support to speed up training and reduce vram usage
  - fp16 works, can't test bf16
- try out gradient accumulation to speed up training
  - this didn't work well, the resulting model produced low quality images
- try out deepspeed to reduce vram usage even further
  - this works but made training 3-4x slower than without deepspeed
- use fsdp_native to reduce vram requirements on each GPU when scaling
  - this didn't work
- split things up and publish repos and post
  - you're reading it, so yes!

# Hardware

You need at minimum a GPU with 24GB of VRAM to train, and that's cutting it fine and will only work when using deepspeed.

I tested using a Radeon Pro W6800 32GB GPU which allows training without deepspeed with a batch size of one.

I haven't tested with any NVIDIA GPUs as I don't have any with sufficient VRAM yet.

## AMD Specific Issues and Workarounds

If you're fortunate enough to have an NVIDIA GPU with enough VRAM, there is no equivalent section, as CUDA is more reliable.

### <a id='amdgpu-hang'></a> GPU Hangs

Sometimes amdgpu crashes mixing compute and desktop graphics loads. If you're reading this section after 2022, this information is likely out of date.

Use a modern kernel (5.19+) and set the following kernel parameters:

```
amdgpu.gpu_recovery=2
amdgpu.reset_method=4
```

Together on a GPU which supports BACO (bus active, chip off), this allows amdgpu to reset **without interrupting your X session**!

<details>
<summary>
Click for fun dmesg logs showing a crash and recovery
</summary>

```
[56076.626692] amdgpu: qcm fence wait loop timeout expired
[56076.626695] amdgpu: The cp might be in an unrecoverable state due to an unsuccessful queues preemption
[56076.626697] amdgpu: Failed to evict process queues
[56076.626716] amdgpu 0000:0c:00.0: amdgpu: GPU reset begin!
[56076.626727] amdgpu: Failed to quiesce KFD
[56076.639222] amdgpu: Failed to suspend process 0x800a
[56076.697119] [drm] free PSP TMR buffer
[56076.734968] CPU: 14 PID: 365547 Comm: kworker/u64:1 Not tainted 5.19.1-xanmod1 #1-NixOS
[56076.734970] Hardware name: ASUS System Product Name/ROG STRIX B550-F GAMING (WI-FI), BIOS 2423 08/10/2021
[56076.734971] Workqueue: amdgpu-reset-dev amdgpu_device_queue_gpu_recover_work [amdgpu]
[56076.735057] Call Trace:
[56076.735058]  <TASK>
[56076.735060]  dump_stack_lvl+0x45/0x5e
[56076.735065]  amdgpu_do_asic_reset+0x28/0x434 [amdgpu]
[56076.735178]  amdgpu_device_gpu_recover_imp.cold+0x600/0x9de [amdgpu]
[56076.735280]  amdgpu_device_queue_gpu_recover_work+0x16/0x20 [amdgpu]
[56076.735349]  process_one_work+0x251/0x440
[56076.735352]  worker_thread+0x239/0x4c0
[56076.735353]  ? mod_delayed_work_on+0x130/0x130
[56076.735354]  kthread+0x158/0x180
[56076.735356]  ? kthread_complete_and_exit+0x20/0x20
[56076.735357]  ret_from_fork+0x1f/0x30
[56076.735359]  </TASK>
[56076.735361] amdgpu 0000:0c:00.0: amdgpu: BACO reset
[56076.904156] amdgpu 0000:0c:00.0: AMD-Vi: Event logged [IO_PAGE_FAULT domain=0x0013 address=0x77db21700 flags=0x0020]
[56076.926570] amdgpu 0000:0c:00.0: amdgpu: GPU reset succeeded, trying to resume
[56076.926727] [drm] PCIE GART of 512M enabled (table at 0x0000008000000000).
[56076.926745] [drm] VRAM is lost due to GPU reset!
[56076.926751] [drm] PSP is resuming...
[56076.986352] [drm] reserve 0xa00000 from 0x85e3c00000 for PSP TMR
[56077.090556] amdgpu 0000:0c:00.0: amdgpu: GECC is enabled
[56077.112143] amdgpu 0000:0c:00.0: amdgpu: SECUREDISPLAY: securedisplay ta ucode is not available
[56077.112147] amdgpu 0000:0c:00.0: amdgpu: SMU is resuming...
[56077.112150] amdgpu 0000:0c:00.0: amdgpu: smu driver if version = 0x00000040, smu fw if version = 0x00000041, smu fw program = 0, version = 0x003a5400 (58.84.0)
[56077.112152] amdgpu 0000:0c:00.0: amdgpu: SMU driver if version not matched
[56077.112183] amdgpu 0000:0c:00.0: amdgpu: use vbios provided pptable
[56077.120431] amdgpu 0000:0c:00.0: amdgpu: SMU is resumed successfully!
[56077.121385] [drm] DMUB hardware initialized: version=0x02020013
[56077.147177] [drm] kiq ring mec 2 pipe 1 q 0
[56077.152644] [drm] VCN decode and encode initialized successfully(under DPG Mode).
[56077.152816] [drm] JPEG decode initialized successfully.
[56077.152827] amdgpu 0000:0c:00.0: amdgpu: ring gfx_0.0.0 uses VM inv eng 0 on hub 0
[56077.152828] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.0.0 uses VM inv eng 1 on hub 0
[56077.152829] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.1.0 uses VM inv eng 4 on hub 0
[56077.152829] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.2.0 uses VM inv eng 5 on hub 0
[56077.152830] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.3.0 uses VM inv eng 6 on hub 0
[56077.152830] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.0.1 uses VM inv eng 7 on hub 0
[56077.152831] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.1.1 uses VM inv eng 8 on hub 0
[56077.152831] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.2.1 uses VM inv eng 9 on hub 0
[56077.152831] amdgpu 0000:0c:00.0: amdgpu: ring comp_1.3.1 uses VM inv eng 10 on hub 0
[56077.152832] amdgpu 0000:0c:00.0: amdgpu: ring kiq_2.1.0 uses VM inv eng 11 on hub 0
[56077.152832] amdgpu 0000:0c:00.0: amdgpu: ring sdma0 uses VM inv eng 12 on hub 0
[56077.152833] amdgpu 0000:0c:00.0: amdgpu: ring sdma1 uses VM inv eng 13 on hub 0
[56077.152833] amdgpu 0000:0c:00.0: amdgpu: ring sdma2 uses VM inv eng 14 on hub 0
[56077.152834] amdgpu 0000:0c:00.0: amdgpu: ring sdma3 uses VM inv eng 15 on hub 0
[56077.152834] amdgpu 0000:0c:00.0: amdgpu: ring vcn_dec_0 uses VM inv eng 0 on hub 1
[56077.152835] amdgpu 0000:0c:00.0: amdgpu: ring vcn_enc_0.0 uses VM inv eng 1 on hub 1
[56077.152835] amdgpu 0000:0c:00.0: amdgpu: ring vcn_enc_0.1 uses VM inv eng 4 on hub 1
[56077.152836] amdgpu 0000:0c:00.0: amdgpu: ring vcn_dec_1 uses VM inv eng 5 on hub 1
[56077.152836] amdgpu 0000:0c:00.0: amdgpu: ring vcn_enc_1.0 uses VM inv eng 6 on hub 1
[56077.152837] amdgpu 0000:0c:00.0: amdgpu: ring vcn_enc_1.1 uses VM inv eng 7 on hub 1
[56077.152837] amdgpu 0000:0c:00.0: amdgpu: ring jpeg_dec uses VM inv eng 8 on hub 1
[56077.160757] amdgpu 0000:0c:00.0: amdgpu: recover vram bo from shadow start
[56077.160760] amdgpu 0000:0c:00.0: amdgpu: recover vram bo from shadow done
[56077.160770] amdgpu 0000:0c:00.0: amdgpu: GPU reset(1) succeeded!
```
</details>

### Power Profiles

Modern AMD GPUs have a compute power profile, which should be activated before training. On my machine this is profile 5.

I use [amdgpu-power-limit.sh](https://github.com/LunNova/nixos-configs/blob/dev/packages/lun-scripts/amdgpu-power-limit.sh) to set a wattage limit and power profile.

# Upgrading pytorch-lightning

latent-diffusion's original release used an ancient pytorch-lightning version. Upgrading to the latest 1.7.6 isn't too hard, and adds support for new accelerators.

Most changes will be in the launcher (main.py) which constructs the lightning `Trainer` and its options. I can't point you to a single nice commit for the minimal changes, as I replaced it.

The only other required change was [removing the deprecated `dataloader_idx` arg from `on_train_batch_start` in `ddpm.py`.](https://github.com/LunNova/InvokeAI-nyoom/commit/8a1b02f15284cdb81300440ca173b0a3dfa3b87f)

# Hardware Agnostic Training

Pytorch Lightning supports ["hardware agnostic training"](https://pytorch-lightning.readthedocs.io/en/latest/accelerators/accelerator_prepare.html)


# fp16/bf16

After the above two changes, fp16 just works. Ensure `precision: 16` or `precision: bf16` is set in the lightning section of the training config.

# deepspeed

Deepspeed's most important feature for us is offloading the optimizer state to the CPU/system RAM.

```yaml
  trainer:
    strategy: "deepspeed"
    # Does NOT work in combination with deepspeed currently
    # FIXME: debug why
    # precision: 16
  deepspeed:
    # Setting this uses a deepspeed config file and ignores other flags
    # config: ./configs/stable-diffusion/deepspeed.json/
    stage: 1
    offload_optimizer: True
```

Add these options to your training yml to enable deepspeed. VRAM usage will go down, CPU usage and PCIE bandwidth usage will go up. Training speed will slow to a crawl, partly due to fp16 not working. :(

# fsdp_native

Fully sharded data parallel training allows splitting the model across GPUs without storing the full model weights and optimizer state on each GPU, reducing VRAM usage.

In theory, setting the `strategy` parameter to the pytorch lightning `Trainer` to `fsdp_native` should be the only necessary change. In practice, this doesn't work as some weights for the autoencoder are left on the CPU.

This only happens with fsdp, I haven't worked out why yet.

TODO: file a bug at lightning repo seeking assistance?

# Optimized EMA 

See [Stable diffusion optimization: EMA weights on CPU](@/articles/stable-diffusion-ema-on-cpu/index.md).

# Autoencoder training

Training a custom autoencoder on your dataset may be worth doing if it is mostly art, as the autoencoder in the base stable diffusion model seems to be pretty poor at anime or furry style eyes.

FIXME: This only works at fp32, fp16 gives NaN loss

See training-encoder.yml for a configuration for training the encoder.


# Setup

Clone [github:LunNova/lunar-diffusion](github.com/LunNova/lunar-diffusion), including submodules.

# Checkpoints and Logging

<details>
<summary>Example `lightning` section of training yml file</summary>

```yaml
lightning:
  logger:
    tensorboard:
      target: pytorch_lightning.loggers.tensorboard.TensorBoardLogger
      params:
        flush_secs: 60
        name: tensorboard
  callbacks:
    progress:
      target: lun.callbacks.SmoothedProgressBar
    # These look messy but afaict you need all these settings for correct functioning
    monitored_checkpoint:
      target: pytorch_lightning.callbacks.ModelCheckpoint
      params:
        auto_insert_metric_name: false
        monitor: *monitor
        save_top_k: 1
        save_last: false # don't do last.cklpt
        filename: monitor/loss={val/loss_simple_ema:.3f} e={epoch:04d} gs={step:06d}
    periodic_checkpoint:
      target: pytorch_lightning.callbacks.ModelCheckpoint
      params:
        auto_insert_metric_name: false
        every_n_train_steps: 20000
        monitor: null
        save_top_k: -1 # keep unlimited
        save_last: false # don't do last.cklpt
        save_on_train_epoch_end: True # val may be off
        filename: periodic/e={epoch:04d} gs={step:06d}
    periodic_checkpoint_overwrite:
      target: pytorch_lightning.callbacks.ModelCheckpoint
      params:
        auto_insert_metric_name: false
        every_n_train_steps: 2000
        monitor: null
        save_top_k: 1 # needs this so it will actually overwrite
        save_last: false # don't do last.cklpt
        save_on_train_epoch_end: True
        filename: every-2k-steps
    image_logger:
      target: main.ImageLogger
      params:
        batch_frequency: 500
        max_images: 4
        increase_log_steps: False
        log_first_step: False
        # ignore global_step and keep track internally
        # works around bug when gradient accumulation is on
        check_custom_step: True
        log_images_kwargs:
          use_ema_scope: False
          inpaint: False
          plot_progressive_rows: False
          plot_diffusion_rows: False
          N: 4
          ddim_steps: 50
```

</details>

I recommend setting up the above callbacks and logger. Tweak fequencies as desired.

This will keep one checkpoint `every-2k-steps.ckpt` that gets overwritten, a `periodic` folder of checkpoints every 20k steps that are kept, and a `monitor` folder of "best" checkpoints based on the monitored metric.

This balance avoids using up too much disk space for periodic checkpoints, but keeps a frequent overwritten checkpoint that you can resume from in case of system crashes. This happened frequently to me earlier due to `amdgpu`/ROCM issues.

`main.py` also creates `on_exception.ckpt` when training is interrupted due to an exception, or ctrl-c.

# Dataset

You'll need to prepare a dataset. There are two options ready in the code, flat files and metadata.

## Flat files

```
dataset_dir
  images
    1.png
    2.jpg
  captions
    1.txt
    2.txt
```

The text files should contain the caption for each image. No filtering is available. Minimal options are available.

```yaml
    train:
      target: lun.data.local.Local
      params:
        size: 512
        flip_p: 0.333
        mode: "train"
        # no metadata_params set
```

## Metadata

The metadata approach requires this structure:

```
dataset_dir
  metadata
    <any number of folders deep>
      1.json
  images
    <any number of folders deep>
      1.png
      2.png
```

The `json` metadata files should look like this:

<details>

<summary>Example JSON metadata file</summary>

```json
{
   # list of tags for the image
   "tags":[
      "oc:kindle",
      "oc",
      "kirin",
      "artist:lulubell",
      "oc only",
      "solo",
      "safe"
   ],
   # score eg from an image board
   "score":55,
   # path relative to dataset root
   "path":"images/287/2877648.png"
}
```
Extra keys in the JSON file are fine and will be ignored.

If you're curious, that's for [this cute picture](https://derpibooru.org/2877648)!
</details>

<details>

<summary>Rather long YAML config with metadata.</summary>

This is a cut down example of a real dataloader I used to train recently.

```yaml
    train:
      target: lun.data.local.Local
      params:
        size: 512
        flip_p: 0.333
        mode: "train"
        metadata_params: &train_metadata_params # <&so can merge this into validation below!
          # only check every nth .json in the metadata dir
          # good for validation set
          #consider_every_nth: 8
          # shuffle tags randomly in half the dataset
          shuffle_tag_p: 0.5
          # ignoring images with these tags
          blacklist_tags:
            - animated
            - machine learning generated
          # removing some tags which have no impact on the image contents from the caption
          non_caption_tags:
            - high res
            - alternate version
            - derpibooru exclusive
            - edit
            - color edit
            - story in the comments
            - translated in the comments
          # shortening some common multi word tags to reduce
          # how many tokens are used
          replacements:
            princess cadance: cadance
            princess luna: luna
            nightmare moon: nmm
            shining armor: shiny
            'artist:': 'by='
            # recommended if your dataset uses : in any tags
            # as by convention : is used for weighted prompts in most stable diffusion
            # txt2img frontend
            ':': '='
          # if score's below this it gets filtered out immediately
          abs_min_score: 50
          # if score's below this after applying tag_bonus_scores gets filtered out
          min_score: 200
          # add a tag based on the imageboard score
          # >3200 = scr3200, >1600 = scr1600, and so on
          score_tags: [ 3200, 1600, 800, 600, 400, 300, 200, 150, 100, 50, 25, 5 ]
          # increase or decrease the score used to check min_score
          # used to increase or decrease prevalence of particular tags
          tag_bonus_scores:
            solo: 100
            duo: 100
            pride flag: 50
            transgender pride flag: 50
            monochrome: -75
            grayscale: -75
            sketch: -75
```
</details>
