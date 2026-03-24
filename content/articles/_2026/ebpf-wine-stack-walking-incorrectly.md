+++
title = "Walking the stack incorrectly in a WINE program from eBPF"
date = 2026-03-15
description = "Where we're going we don't need bpf_get_stack (it doesn't understand windows)"
tags = ["reverse engineering", "rust", "linux"]
+++

Wanted to walk the stack in a wine program from ebpf? Have no idea what you're doing?
Tried to build a real windows stack walker entirely in ebpf, hit errors with your program having too high complexity at verification time?  
yeah, turns out trying to chase pointers through the PE unwind info yourself because you can't use the BPF built in linux stack helpers is very verboten.

Don't worry! I have a dubious solution for you that the kernel allows…

No frame pointers either. What if we just. Sample addresses out of the stack in a linear sweep and guess that it could be a function addr.

Is everything in the output even actually a valid thing that should be in the trace? Nope!

Reverse engineering is fun.

```rs
use aya_ebpf::{
	  EbpfContext,
    macros::{uretprobe, perf_event, map},
    programs::{RetProbeContext, PerfEventContext},
    bindings::pt_regs,
    maps::StackTrace,
    helpers::{bpf_probe_read_user},
};
use aya_log_ebpf::info;

#[map]
static STACK_TRACES: StackTrace = StackTrace::with_max_entries(1024, 0);
const MAX_STACK_FRAMES: usize = 8;

unsafe fn manual_stack_walk(rsp: u64, stack_frames: &mut [u64]) -> usize {
    let mut frame_count = 0;
    let mut current_rsp = rsp;
    
    // For Windows x64, we'll try to read return addresses from the stack
    // The stack grows downward, and return addresses are typically stored at 8-byte intervals
    // due to ebpf program complexity limits, we structure this as a linear sweep through stack for fixed step count
    for _i in 0..256 {
        // Try to read a potential return address from the current stack position
        let addr = match unsafe { bpf_probe_read_user(current_rsp as *const u64) } {
            Ok(addr) => addr,
            Err(_) => break,
        };

        if frame_count < stack_frames.len() && (// Wild mass guess at if it could be code!
            (addr >= 0x140001001 && addr < 0x200000000) ||  // Main image
           (addr >= 0x7ff000000000 && addr < 0x800000000000)) {// System range & ASLRed stuff but WINE DOESN'T PIE in 2026 lmao???
            stack_frames[frame_count] = addr;
            frame_count += 1;
        }
        
        current_rsp += 8; // Move to next potential return address, stride picked by fair dice roll
    }
    
    frame_count
}

#[perf_event]
pub fn trace_crc_entry(ctx: PerfEventContext) -> u32 {
    match try_trace_crc_entry(ctx) {
        Ok(ret) => ret,
        Err(_) => 0,
    }
}

fn try_trace_crc_entry(ctx: PerfEventContext) -> Result<u32, i64> {
    // Cast PerfEventContext to pt_regs to access CPU registers
    let regs = ctx.as_ptr() as *mut pt_regs;
    
    unsafe {
        // Access x86_64 registers from pt_regs structure
        let rax = (*regs).rax;
        let rbx = (*regs).rbx; 
        let rcx = (*regs).rcx;
        let rdx = (*regs).rdx;
        let rsi = (*regs).rsi;
        let rdi = (*regs).rdi;
        let rip = (*regs).rip;
        let rsp = (*regs).rsp;
        
        // Try manual stack walking for Windows/Wine processes
        let mut manual_stack: [u64; MAX_STACK_FRAMES] = [0; MAX_STACK_FRAMES];
        let frame_count = manual_stack_walk(rsp, &mut manual_stack);
				match frame_count {
						0 => info!(&ctx, "BP @ RIP:0x{:x} RSP:0x{:x} RAX:0x{:x} RBX:0x{:x} RCX:0x{:x} RDX:0x{:x} RSI:0x{:x} RDI:0x{:x} MANUAL_FAILED",
							rip, rsp, rax, rbx, rcx, rdx, rsi, rdi);
						1 => info!(&ctx, "BP @ RIP:0x{:x} RSP:0x{:x} RAX:0x{:x} RBX:0x{:x} RCX:0x{:x} RDX:0x{:x} RSI:0x{:x} RDI:0x{:x} MANUAL[1]: 0x{:x}",
											rip, rsp, rax, rbx, rcx, rdx, rsi, rdi, manual_stack[0]),
						2 => info!(&ctx, "BP @ RIP:0x{:x} RSP:0x{:x} RAX:0x{:x} RBX:0x{:x} RCX:0x{:x} RDX:0x{:x} RSI:0x{:x} RDI:0x{:x} MANUAL[2]: 0x{:x} 0x{:x}",
											rip, rsp, rax, rbx, rcx, rdx, rsi, rdi, manual_stack[0], manual_stack[1]),
						// …  This should totally be a macro! Lack of finished-ness should help you reimpl instead of copying
				}
    }
    
    Ok(0)
}
```

```console
 [INFO  ebpf_tracer] BP @ RIP:0x1400b9200 RSP:0x16e880 RAX:0x0 RBX:0x0 RCX:0x200 RDX:0x1000 RSI:0x45b6000 RDI:0x140000000 MANUAL[8]: 0x140001000 0x140000000 0x1400145a8 0x140000000 0x144243af8 0x1400bb094 0x1400145a8 0x14001a510
[INFO  ebpf_tracer] BP @ RIP:0x1400b9200 RSP:0x16e880 RAX:0x0 RBX:0x0 RCX:0x200 RDX:0x1000 RSI:0x45b7000 RDI:0x140000000 MANUAL[8]: 0x140001000 0x140000000 0x1400145a8 0x140000000 0x144243af8 0x1400bb094 0x1400145a8 0x14001a510
[INFO  ebpf_tracer] BP @ RIP:0x1400b9200 RSP:0x16e880 RAX:0x0 RBX:0x0 RCX:0x200 RDX:0x1000 RSI:0x45b8000 RDI:0x140000000 MANUAL[8]: 0x140001000 0x140000000 0x1400145a8 0x140000000 0x144243af8 0x1400bb094 0x1400145a8 0x14001a510
[INFO  ebpf_tracer] BP @ RIP:0x1400b9200 RSP:0x16e880 RAX:0x0 RBX:0x0 RCX:0x200 RDX:0x1000 RSI:0x45b9000 RDI:0x140000000 MANUAL[8]: 0x140001000 0x140000000 0x1400145a8 0x140000000 0x144243af8 0x1400bb094 0x1400145a8 0x14001a510
…
Target process exited, stopping eBPF tracing...
```

Transforming this to just shunt the data to userspace for analysis is probably more sensible, especially if userspace can access the virtual memory of the wine process under test and it's long lived.  
That would allow doing a real stack walk post-hoc and leave eBPF responsible for getting enough of a snapshot out for that future analysis.

If this post left you with a strong need to know why I'm using eBPF to backtrace WINE processes, bad news. That's something for a future post.

Have fun!

