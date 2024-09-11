+++
title = "Zen 3's Amazing Slow Short Rep Mov"
date = 2024-02-12
description = "Zen 3 signals Fast Short Rep Mov support. It's slow for unaligned data. AMD Pls Fix."

[taxonomies]
tags = ["performance"]
+++

In 2019 Intel released a new CPU feature called FSRM - Fast Short Rep Mov - as part of their Ice Lake architecture.  
FSRM signals that `rep movsb` should be used even for small moves and will perform well. Previous processors' `rep movsb` implementations were only any good on large data.

Intel's optimization manual[^1] states:

> 3.7.6.1 Fast Short REP MOVSB  
> Beginning with processors based on Ice Lake Client microarchitecture, REP MOVSB performance of short
> operations is enhanced. The enhancement applies to string lengths between 1 and 128 bytes long.
> Support for fast-short REP MOVSB is enumerated by the CPUID feature flag: CPUID [EAX=7H,
> ECX=0H).EDX.FAST_SHORT_REP_MOVSB[bit 4] = 1. There is no change in the REP STOS performance
> Table 3-6. Effect of Address Misalignment on Memcpy() Performance

glibc (and others, including the Linux kernel) started checking for FSRM and deciding to use `rep movsb` instructions for memmove, including for unaligned data. On Intel these operations are specified to perform somewhat worse for unaligned data, but not terribly.

> Address Misalignment Performance Impact  
> Source Buffer The impact on Enhanced REP MOVSB and STOSB implementation versus
> 128-bit AVX is similar.
> Destination Buffer The impact on Enhanced REP MOVSB and STOSB implementation can be 25%
> degradation, while 128-bit AVX implementation of memcpy may degrade only
> 5%, relative to 16-byte aligned scenario.

AMD started setting the same Fast Short Rep Mov flag with their Zen 3 (Ryzen 5xxx) CPUs but did not test it on unaligned data.  
`rep movsb` with unaligned data on a Zen 3 CPU sees a 20x slowdown![^2]

```
FSRM:
  Size (bytes)   Destination Alignment      Throughput (GB/s)
  2113                               0                84.2448              
  2113                              15                 4.4310
  524287                             0                57.1122 
  524287                            15                4.34671

Vectorized:
  Size (bytes)   Destination Alignment      Throughput (GB/s)
  2113                               0               124.1830             
  2113                              15               121.8720
  524287                             0                58.3212 
  524287                            15                58.5352 
```

A patch set for glibc to avoid using rep movsb again[^3] is under development.

I hope AMD are able to release a microcode update which fixes the behavior of `rep movsb` on unaligned data or unsets the FSRM flag. Without a fix, the FSRM CPUID[^4] flag is misleading on AMD processors and any code deciding to use `rep movsb` will be wrong if it does the obvious thing.

[^1]: [Intel® 64 and IA-32 Architectures Optimization Reference Manual Volume 1](https://www.intel.com/content/www/us/en/content-details/671488/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html)
[^2]: [glibc Bug 30994 - REP MOVSB performance suffers from page aliasing on Zen 4](https://sourceware.org/bugzilla/show_bug.cgi?id=30994)
[^3]: [Patch set for glibc - Re: [PATCH 0/4] x86: Improve ERMS usage on Zen3+](https://inbox.sourceware.org/libc-alpha/a9596bb0-96e7-4d51-b6c2-b8d9dba2280e@linaro.org/)
[^4]: [CPUID Instruction Reference - Structured Extended Feature Enumeration Sub-leaf (Initial EAX Value = 07H, ECX = 1)](https://www.felixcloutier.com/x86/cpuid#:~:text=Initial%20EAX%20Value%20%3D%2007H%2C%20ECX%20%3D%201)
