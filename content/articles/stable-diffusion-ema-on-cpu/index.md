+++
title = "Stable diffusion optimization: EMA weights on CPU"
date = 2022-09-29
description = "Save a few gigabytes of VRAM while training stable diffusion, with bonus memory leak fix!"

[taxonomies]
tags = ["machine learning", "stable diffusion", "cuda", "rocm", "performance"]
+++

Stable diffusion uses an Exponential Moving Average of the model's weights to improve quality of resulting images and avoid overfitting to the most recently trained images. It also gives us a more stable EMA validation loss to use to pick the best checkpoints. See [Understanding the use of EMA in Diffusion models](https://old.reddit.com/r/MachineLearning/comments/ucflc2/d_understanding_the_use_of_ema_in_diffusion_models/) on reddit for some discussion.


<details>

<summary> I want to skip to the code </summary>

This optimization, along with some others, are in this fork of InvokeAI: [github:LunNova/InvokeAI-nyoom](
https://github.com/LunNova/InvokeAI-nyoom/).

</details>

# What is an Exponential Moving Average anyway?

An EMA is a moving average which can be calculated only by knowing the last EMA value, and the current value. The EMA doesn't require retaining the last N data points, making it quite memory efficient.

```py
def next_ema(val: float, last_ema: float, decay: float) -> float:
    return last_ema * decay + val * (1-decay)
```

This concept is widely used in various fields and has been independently discovered and applied many times. As an example, I implemented a similar averaging technique in a Minecraft mod project [back in 2013](https://github.com/MinimallyCorrect/TickThreading/blob/8a80f377eb0e8575f079b698cdb168b9e746d491/src/common/me/nallar/patched/PatchMinecraftServer.java#L213) and I had no idea what it was called.

# How do you implement an EMA for a machine learning model?

It's very similar, except rather than single floats as inputs you have to do this for every model parameter that you want to be part of the EMA. With PyTorch modules you can use [the `named_parameters()` iterator](https://pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.named_parameters) to access all parameters.

# EMA in Stable Diffusion

Stable Diffusion includes an implementation of an EMA called `LitEma`, found at [ldm/modules/ema.py](https://github.com/CompVis/stable-diffusion/blob/69ae4b35e0a0f6ee1af8bb9a5d0016ccb27e36dc/ldm/modules/ema.py).  
The implementation is very short, and most of the work involved is managing dicts of tensors.

## Where are the EMA weights kept?

In this implementation, a device is never explicitly set, so the EMA weights end up on the GPU like everything else. This doubles the memory required to store the model parameters!

## How can we move them to the CPU?

Unfortunately, Pytorch Lightning tries quite hard to put buffers on the GPU automatically. This is normally nice, and part of ["hardware agnostic training"](https://pytorch-lightning.readthedocs.io/en/latest/accelerators/accelerator_prepare.html).  
Some other users have ran into [similar issues](https://github.com/Lightning-AI/lightning/issues/3698).
We can get around this by avoiding using `register_buffers` and manually creating Tensors on the CPU, and storing them inside a list to avoid Lightning detecting the tensor.  
This is a bit of a fragile hack, but it works for now.

```py
self.cpu_shadow_params = [{}] if ema_on_cpu else None

for name, p in model.named_parameters():
    if p.requires_grad:
        # remove as '.'-character is not allowed in buffers
        s_name = name.replace('.', '')
        self.m_name2s_name.update({name: s_name})

        cloned = p.detach().clone().data
        cloned.requires_grad = False

        # Added this check here
        if ema_on_cpu:
            self.cpu_shadow_params[0][s_name] = cloned.cpu()
        else:
            self.register_buffer(s_name, cloned)
```

## Let's try it

After making the above change, and a few more bodges further down to copy tensors on/off the GPU and handle restoring checkpoints with the same `state_dict` keys, it works!

Unfortunately it's now taking over 2 seconds per batch because copying tensors from the GPU to CPU is slow.

## This is too slow! We need a workaround

Yep, it's taking an extra second per batch to update on the CPU. Saving VRAM isn't that much use if we're halving the speed.

Fortunately for us, in our particular context we don't need to update the weights on every single batch. Machine learning model weights drift slowly, so we can apply an EMA update only on every Nth batch and still get mostly the same results, as long as N isn't set too high!

We'll also need to set the initial `decay` value to `math.pow(decay, update_every)` so we still make a big enough change.

## What's going on with `collected_params`?

Glad you spotted that too, it does look a little odd.

`store` saves the current weights of the model in `self.collected_params`, and `restore` restores those back to the original model. This allows temporarily using the EMA weights as the main weights, and is used to log images during training. [Here's how it gets used in ldm/models/diffusion/ddpm.py](https://github.com/LunNova/InvokeAI-nyoom/blob/366aa344f87fdf4032413a065ccde0b15244c134/ldm/models/diffusion/ddpm.py#L1993-L2000).

The original code isn't doing anything with `self.collected_params` after restoring so it's leaking an entire copy of the model after the first time `store` gets called!

For bonus points, let's fix that leak and move those tensors onto the CPU.

# All together now

Here are our final changes: [LunNova/InvokeAI-nyoom  ema: move EMA weights to CPU and only update weights every N steps](https://github.com/LunNova/InvokeAI-nyoom/commit/366aa344f87fdf4032413a065ccde0b15244c134)

This reduced training memory usage at a batch size of two from OOMing at 32GB to using only 27GB of VRAM.  
Before this change it took 27GB to train a batch size of one so I'm quite happy with it!
