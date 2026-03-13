// single use unmitigated claudeslop (via claude-sonnet-4-6, oom sequence by claude-opus-4-6)

// RAM cost ticker - asymptotically approaches $20k
(function () {
	var el = document.getElementById('ram-cost');
	if (!el) return;
	var start = 1000, target = 20000, tau = 600, t0 = Date.now();
	(function tick() {
		var p = 1 - Math.exp(-(Date.now() - t0) / 1000 / tau);
		el.textContent = '$' + Math.floor(start + (target - start) * p).toLocaleString('en-US');
		requestAnimationFrame(tick);
	})();
})();

// htop CPU grid, uptime, load average, process churn, memory escalation, and OOM crash
(function () {
	var cpusEl = document.getElementById('htop-cpus');
	var uptimeEl = document.getElementById('htop-uptime');
	var laEl = document.getElementById('htop-la');
	var procsEl = document.getElementById('htop-procs');
	var memBarEl = document.getElementById('htop-mem-bar');
	var memPadEl = document.getElementById('htop-mem-pad');
	var memUsedEl = document.getElementById('htop-mem-used');
	var swpBarEl = document.getElementById('htop-swp-bar');
	var swpPadEl = document.getElementById('htop-swp-pad');
	var swpUsedEl = document.getElementById('htop-swp-used');
	var tasksEl = document.getElementById('htop-tasks');
	if (!cpusEl) return;

	var frozen = false;
	var started = false;
	var base = 8 * 3600 + 13 * 60 + 57;
	var t0;
	var nextPid = 12100;
	var CPU_ROWS = 8, CPU_COLS = 16;
	var swapPressure = 0; // 0–1, drives red segments in CPU bars

	// Memory escalation state
	var MEM_TOTAL = 503;
	var SWP_TOTAL = 132;
	var BAR_WIDTH = 60;
	var memUsed = 474;
	var swpUsed = 0;
	var MEM_FILL_SECS = 3;
	var SWP_FILL_SECS = 10;
	var FREEZE_SECS = MEM_FILL_SECS + SWP_FILL_SECS;

	function pad2(n) { return (n < 10 ? '0' : '') + n; }
	function rnd(a, b) { return a + Math.random() * (b - a); }
	function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
	function padS(s, n) { while (s.length < n) s = ' ' + s; return s; }
	function padE(s, n) { while (s.length < n) s = s + ' '; return s; }
	function hexId() { return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'); }
	function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }

	// box-drawing (1-char indent per level)
	var BR = '\u251c'; // ├
	var EL = '\u2514'; // └
	var VT = '\u2502'; // │
	var SP = ' ';

	// --- Memory/swap bar rendering ---
	function renderMemBar() {
		if (!memBarEl) return;
		var barChars = Math.round(Math.min(1, memUsed / MEM_TOTAL) * BAR_WIDTH);
		memBarEl.textContent = rep('|', barChars);
		memPadEl.textContent = rep(' ', BAR_WIDTH - barChars);
		memUsedEl.textContent = Math.floor(memUsed) + 'G';
	}

	function renderSwpBar() {
		if (!swpBarEl) return;
		var barChars = Math.round(Math.min(1, swpUsed / SWP_TOTAL) * BAR_WIDTH);
		swpBarEl.className = 'hr';
		swpBarEl.textContent = rep('|', barChars);
		swpPadEl.textContent = rep(' ', BAR_WIDTH - barChars);
		if (swpUsed < 0.001) swpUsedEl.textContent = '320K';
		else if (swpUsed < 1) swpUsedEl.textContent = Math.floor(swpUsed * 1024) + 'M';
		else if (swpUsed < 10) swpUsedEl.textContent = swpUsed.toFixed(1) + 'G';
		else swpUsedEl.textContent = Math.floor(swpUsed) + 'G';
	}

	// --- CPU grid ---
	function renderCpus() {
		var lines = [];
		for (var row = 0; row < CPU_ROWS; row++) {
			var cells = [];
			for (var col = 0; col < CPU_COLS; col++) {
				var cpu = col * CPU_ROWS + row;
				var pct = pick([97, 98, 99, 100, 100, 100, 100, 100]);
				var numStr = cpu < 10 ? '\u00a0\u00a0' + cpu : cpu < 100 ? '\u00a0' + cpu : '' + cpu;
				var pctStr = pct < 100 ? '\u00a0' + pct + '%' : pct + '%';
				// red = kernel time (swap thrashing), green = user time
				var redCount = 0;
				if (swapPressure > 0) {
					redCount = Math.floor(swapPressure * 3 * rnd(0.3, 1.5));
					redCount = Math.min(3, Math.max(0, redCount));
				}
				var greenCount = 3 - redCount;
				var barHtml = '';
				if (redCount > 0) barHtml += '<span class="hr">' + rep('|', redCount) + '</span>';
				if (greenCount > 0) barHtml += '<span class="hg">' + rep('|', greenCount) + '</span>';
				cells.push(numStr + '[' + barHtml + '<span class="hw">' + pctStr + '</span>]');
			}
			lines.push(cells.join(''));
		}
		cpusEl.innerHTML = lines.join('\n');
	}
	renderCpus();

	// --- CK source files (real filenames from composable_kernel builds) ---
	var ckSrcs = [
		'grouped_conv1d_bwd_weight/xdl/device_grouped_conv1d_bwd_weight_xdl_gnwc_gkxc_gnwk_f16_instance.cpp',
		'grouped_conv2d_bwd_data/xdl/device_grouped_conv2d_bwd_data_xdl_gnhwc_gkyxc_gnhwk_f16_instance.cpp',
		'grouped_conv2d_bwd_data/xdl/device_grouped_conv2d_bwd_data_xdl_nhwgc_gkyxc_nhwgk_f16_16_16_instance.cpp',
		'grouped_conv2d_bwd_data/xdl/device_grouped_conv2d_bwd_data_xdl_ngchw_gkcyx_ngkhw_f16_instance.cpp',
		'grouped_conv2d_bwd_data/xdl/device_grouped_conv2d_bwd_data_xdl_ngchw_gkyxc_ngkhw_bf16_instance.cpp',
		'grouped_conv2d_bwd_weight/xdl/nhwgc_gkyxc_nhwgk/device_grouped_conv2d_bwd_weight_xdl_nhwgc_gkyxc_nhwgk_f16_pad0_pipev5_instance.cpp',
		'grouped_conv2d_bwd_weight/xdl/nhwgc_gkyxc_nhwgk/device_grouped_conv2d_bwd_weight_xdl_nhwgc_gkyxc_nhwgk_bf16_default_pipev2_instance.cpp',
		'grouped_conv3d_bwd_weight/xdl/device_grouped_conv3d_bwd_weight_xdl_bilinear_ndhwgc_gkzyxc_ndhwgk_f16_instance.cpp',
		'grouped_conv3d_bwd_data/xdl/device_grouped_conv3d_bwd_data_xdl_ndhwgc_gkzyxc_ndhwgk_bf16_instance.cpp',
		'grouped_conv3d_fwd/xdl/device_grouped_conv3d_fwd_xdl_convscale_ndhwgc_gkzyxc_ndhwgk_f8_instance.cpp',
		'grouped_conv2d_fwd/xdl/device_grouped_conv2d_fwd_xdl_ngchw_gkcyx_ngkhw_f16_instance.cpp',
		'grouped_conv1d_bwd_weight/xdl/device_grouped_conv1d_bwd_weight_xdl_gnwc_gkxc_gnwk_bf16_f32_bf16_instance.cpp',
	];
	var ckIdx = 0;
	function nextCkSrc() { return ckSrcs[ckIdx++ % ckSrcs.length]; }

	// CK clang++ flags (from real builds)
	var CK_DFLAGS = '-DCK_ENABLE_BF16 -DCK_ENABLE_BF8 -DCK_ENABLE_FP16 -DCK_ENABLE_FP32 -DCK_ENABLE_FP64 -DCK_ENABLE_FP8 -DCK_ENABLE_INT8';

	function ckClangCmd(src) {
		return '/nix/store/2zky6wm53kvhsbsb9kr24fq62i2wmd9d-rocm-toolchain/bin/clang++ ' + CK_DFLAGS + ' -DCK_TIME_KERNEL=0 -DCK_USE_FNUZ_FP8 -DCK_USE_XDL -DUSE_PROF_API=1 -D__HIP_PLATFORM_AMD__=1 -O3 -std=c++20 -fPIC -Weverything --offload-compress -x hip --offload-arch=gfx90a -c /build/source/library/src/tensor_operation_instance/gpu/' + src;
	}

	// hipblaslt assembly leaf command
	function hblAsmCmd() {
		return '/nix/store/fbjcg0fywscg6sv22kw1k00zsgdm1mgh-hipClang/bin/clang++ -x assembler -target amdgcn-amdhsa -mcpu=gfx90a -mcode-object-version=5 -o /build/Tensile/library/kernel_' + hexId() + '.co /build/Tensile/assembly/kernel_' + hexId() + '.s';
	}

	// --- Process tree ---
	// Two separate nix builds running in parallel:
	// 1. composable_kernel (nixbld10): make -> clang++ -> clang -cc1 (long-lived leaves, 15 min each)
	// 2. hipblaslt (nixbld1): TensileCreateLibrary (30G+ python) -> hipClang assembly workers
	var s = [nextCkSrc(), nextCkSrc()];

	var ckLeafIndices = [];
	var hblLeafIndices = [];

	var procs = [
		// ── composable_kernel build (nixbld10) ──
		{ tree: '', user: 'nixbld10', cmd: 'make -j64 SHELL=/nix/store/f15k3dpilmiyv6zgpib289rnjykgr1r4-bash-5.3p9/bin/bash device_grouped_conv1d_bwd_weight_instance device_grouped_conv2d_bwd_data_instance device_grouped_conv2d_bwd_weight_instance' },
		{ tree: BR, user: 'nixbld10', cmd: 'make -s -f CMakeFiles/Makefile2 device_grouped_conv2d_bwd_data_instance' },
		{ tree: VT + EL, user: 'nixbld10', cmd: 'make -s -f library/src/tensor_operation_instance/gpu/grouped_conv2d_bwd_data/CMakeFiles/device_grouped_conv2d_bwd_data_instance.dir/build.make library/src/tensor_operation_instance/gpu/grouped_conv2d_bwd_data/CMakeFiles/device_grouped_conv2d_bwd_data_instance.dir/build' },
		// CK slot 0
		{ tree: VT + SP + BR, user: 'nixbld10', cmd: ckClangCmd(s[0]), slot: 0, isCkParent: true },
		{ tree: VT + SP + VT + EL, user: 'nixbld10', cmd: '/nix/store/2zky6wm53kvhsbsb9kr24fq62i2wmd9d-rocm-toolchain/bin/clang -cc1 -triple amdgcn-amd-amdhsa -aux-triple x86_64-unknown-linux-gnu -emit-obj -disable-free -clear-ast-before-backend -target-cpu gfx90a -fcuda-is-device', leaf: true, highCpu: true, slot: 0, ckLeaf: true },
		// CK slot 1
		{ tree: VT + SP + EL, user: 'nixbld10', cmd: ckClangCmd(s[1]), slot: 1, isCkParent: true },
		{ tree: VT + SP + SP + EL, user: 'nixbld10', cmd: '/nix/store/2zky6wm53kvhsbsb9kr24fq62i2wmd9d-rocm-toolchain/bin/clang -cc1 -triple amdgcn-amd-amdhsa -aux-triple x86_64-unknown-linux-gnu -emit-obj -disable-free -clear-ast-before-backend -target-cpu gfx90a -fcuda-is-device', leaf: true, highCpu: true, slot: 1, ckLeaf: true },
		// remaining make branch (sleeping, waiting for its turn)
		{ tree: EL, user: 'nixbld10', cmd: 'make -s -f CMakeFiles/Makefile2 device_grouped_conv2d_bwd_weight_instance' },

		// ── the infamous 15-min single file (nixbld11) ──
		{ tree: '', user: 'nixbld11', cmd: 'make -j15 SHELL=/nix/store/f15k3dpilmiyv6zgpib289rnjykgr1r4-bash-5.3p9/bin/bash device_grouped_conv2d_fwd_instance device_grouped_conv2d_fwd_bias_clamp_instance device_grouped_conv2d_fwd_clamp_instance device_grouped_conv2d_fwd_dynamic_op_instance' },
		{ tree: EL, user: 'nixbld11', cmd: 'make -s -f CMakeFiles/Makefile2 device_grouped_conv2d_fwd_instance' },
		{ tree: SP + EL, user: 'nixbld11', cmd: 'make -s -f library/src/tensor_operation_instance/gpu/grouped_conv2d_fwd/CMakeFiles/device_grouped_conv2d_fwd_instance.dir/build.make library/src/tensor_operation_instance/gpu/grouped_conv2d_fwd/CMakeFiles/device_grouped_conv2d_fwd_instance.dir/build' },
		{ tree: SP + SP + EL, user: 'nixbld11', cmd: ckClangCmd('grouped_conv2d_fwd/xdl/device_grouped_conv2d_fwd_xdl_ngchw_gkcyx_ngkhw_f16_instance.cpp'), isCkParent: true },
		{ tree: SP + SP + SP + EL, user: 'nixbld11', cmd: '/nix/store/2zky6wm53kvhsbsb9kr24fq62i2wmd9d-rocm-toolchain/bin/clang -cc1 -triple amdgcn-amd-amdhsa -aux-triple x86_64-unknown-linux-gnu -emit-obj -disable-free -clear-ast-before-backend -target-cpu gfx90a -fcuda-is-device -main-file-name device_grouped_conv2d_fwd_xdl_ngchw_gkcyx_ngkhw_f16_instance.cpp', isMonster: true },

		// ── hipblaslt Tensile build (nixbld1) ──
		{ tree: '', user: 'nixbld1', cmd: '/nix/store/5hqbbgdslqp84cqs1agnak0676j27bsq-python3-3.13.11-env/bin/python3.13 -m Tensile.TensileCreateLibrary --architecture=gfx90a --cxx-compiler=/nix/store/7prkhjmnb865nrs0mrw6ns7bq1kj7b4s-clr-7.1.1/bin/amdclang++ /build/source/projects/hipblaslt/library /build/source/projects/hipblaslt/build/Tensile HIP', isTensile: true },
		// Tensile assembly leaf slots (short-lived asm->codeobj via hipClang)
		{ tree: BR, user: 'nixbld1', cmd: hblAsmCmd(), leaf: true, hblLeaf: true },
		{ tree: BR, user: 'nixbld1', cmd: hblAsmCmd(), leaf: true, hblLeaf: true },
		{ tree: BR, user: 'nixbld1', cmd: hblAsmCmd(), leaf: true, hblLeaf: true },
		{ tree: BR, user: 'nixbld1', cmd: hblAsmCmd(), leaf: true, hblLeaf: true },
		{ tree: EL, user: 'nixbld1', cmd: hblAsmCmd(), leaf: true, hblLeaf: true },

		// user
		{ tree: '', user: 'user', cmd: 'nix build github:nixos/nixpkgs/master#rocmPackages.rocm-tests.tests.torch', isNixBuild: true },
	];

	// Assign PIDs, birth times, and initial CPU time
	procs.forEach(function (p, i) {
		p.pid = nextPid++;
		// CK leaves started long ago (they take 15+ min), Tensile leaves are recent
		var wallAge = p.isMonster ? rnd(900, 1200) : p.ckLeaf ? rnd(120, 900) : p.hblLeaf ? rnd(0.5, 5) : rnd(10, 600);
		p.birthTime = -wallAge;
		// CPU time = wall time * avg CPU fraction
		var avgCpu = p.isMonster ? 0.97 : p.highCpu ? 0.6 : p.isTensile ? 0.23 : p.hblLeaf ? 0.7 : p.isCkParent ? 0 : p.isNixBuild ? 0.02 : 0.01;
		p.cpuTime = wallAge * avgCpu;
		if (p.leaf && p.ckLeaf) ckLeafIndices.push(i);
		if (p.leaf && p.hblLeaf) hblLeafIndices.push(i);
	});

	function renderRow(p) {
		// TIME+ is cumulative CPU time, not wall time
		var ct = p.cpuTime;
		var mm = Math.floor(ct / 60);
		var ss = (ct % 60).toFixed(2);
		var time = padS('' + mm, 2) + ':' + (parseFloat(ss) < 10 ? '0' : '') + ss;

		var cpu, mem, state, virt, res, shr;
		// Use baseCpu with small jitter for smooth fluctuation
		cpu = p.baseCpu + rnd(-1, 1);
		if (p.highCpu) {
			cpu = Math.max(0, cpu);
			mem = rnd(0.4, 1.6); state = 'R';
			virt = rnd(1.1, 1.5).toFixed(2) + 'G';
			res = Math.floor(rnd(900, 1400)) + 'M';
			shr = Math.floor(rnd(80, 120)) + 'M';
		} else if (p.isMonster) {
			cpu = Math.max(90, cpu);
			mem = rnd(0.8, 1.2); state = 'R';
			virt = rnd(4.8, 5.5).toFixed(2) + 'G';
			res = rnd(4.2, 4.8).toFixed(2) + 'G';
			shr = Math.floor(rnd(80, 120)) + 'M';
		} else if (p.isCkParent) {
			cpu = 0; mem = 0; state = 'S';
			virt = ' 185M';
			res = padS(Math.floor(rnd(54, 65)) + 'M', 5);
			shr = padS(Math.floor(rnd(30, 45)) + 'M', 5);
		} else if (p.isTensile) {
			cpu = Math.max(0, cpu);
			mem = rnd(5.5, 7.0); state = 'R';
			virt = rnd(32, 38).toFixed(1) + 'G';
			res = padS(rnd(28, 34).toFixed(1) + 'G', 5);
			shr = padS(Math.floor(rnd(8, 16)) + 'M', 5);
		} else if (p.hblLeaf) {
			cpu = Math.max(0, cpu);
			mem = rnd(0, 0.2); state = 'R';
			virt = ' 209M';
			res = padS(Math.floor(rnd(55, 70)) + 'M', 5);
			shr = padS(Math.floor(rnd(30, 45)) + 'M', 5);
		} else if (p.isNixBuild) {
			cpu = rnd(1, 3); mem = 0.3; state = 'S';
			virt = ' 902M';
			res = ' 244M';
			shr = ' 120M';
		} else {
			cpu = Math.max(0, cpu); mem = 0; state = 'S';
			virt = padS('' + Math.floor(rnd(3000, 35000)), 5);
			res = padS('' + Math.floor(rnd(1800, 3000)), 5);
			shr = padS('' + Math.floor(rnd(1700, 2600)), 5);
		}
		cpu = Math.min(99.9, Math.max(0, cpu));

		var div = document.createElement('div');
		div.style.whiteSpace = 'pre';
		div.innerHTML =
			padS('' + p.pid, 7) + ' <span class="hg">' + padE(p.user, 8) + '</span>' +
			'    20   0 ' + padS('' + virt, 5) + ' ' + padS('' + res, 5) + ' ' + padS('' + shr, 5) +
			' ' + state + ' ' +
			'<span class="hg">' + padS(cpu.toFixed(1), 4) + '</span> ' +
			padS(mem.toFixed(1), 4) + ' ' + time + '  ' +
			'<span style="color:#555">' + p.tree + '</span>' + p.cmd.slice(0, Math.max(20, 130 - p.tree.length));
		return div;
	}

	// Give each process a stable base CPU% that drifts slowly
	procs.forEach(function (p) {
		if (p.highCpu) p.baseCpu = rnd(45, 84);
		else if (p.isMonster) p.baseCpu = rnd(95, 99.9);
		else if (p.isCkParent) p.baseCpu = 0;
		else if (p.isTensile) p.baseCpu = rnd(16, 30);
		else if (p.hblLeaf) p.baseCpu = rnd(40, 99);
		else if (p.isNixBuild) p.baseCpu = rnd(1, 3);
		else p.baseCpu = rnd(0, 2);
	});

	// Pre-create row elements
	var rowEls = [];
	procs.forEach(function (p) {
		var el = renderRow(p);
		procsEl.appendChild(el);
		rowEls.push(el);
	});

	// --- Freeze and OOM dialog ---
	function freeze() {
		frozen = true;
		clearInterval(intervalId);
		var overlay = document.getElementById('win95-overlay');
		if (overlay) overlay.style.display = 'block';
		setTimeout(function () {
			var dialog = document.getElementById('win95-oom');
			if (dialog) dialog.style.display = 'block';
		}, 500);
	}

	var okBtn = document.getElementById('win95-ok');
	if (okBtn) {
		okBtn.addEventListener('click', function () {
			document.getElementById('win95-oom').style.display = 'none';
			document.getElementById('win95-overlay').style.display = 'none';
		});
	}

	// --- Unified tick ---
	function tick() {
		if (frozen) return;
		var elapsed = (Date.now() - t0) / 1000;

		// Memory escalation
		if (elapsed < MEM_FILL_SECS) {
			// Phase 1: fill RAM 474G → 503G
			memUsed = 474 + (MEM_TOTAL - 474) * (elapsed / MEM_FILL_SECS);
		} else {
			memUsed = MEM_TOTAL;
			// Phase 2: fill swap (quadratic — starts slow, accelerates)
			var swpFrac = Math.min(1, (elapsed - MEM_FILL_SECS) / SWP_FILL_SECS);
			swpUsed = 130 * swpFrac * swpFrac;
			swapPressure = swpFrac;
		}
		renderMemBar();
		renderSwpBar();

		// Check for freeze
		if (elapsed >= FREEZE_SECS) {
			freeze();
			return;
		}

		// Uptime
		if (uptimeEl) {
			var s = base + Math.floor(elapsed);
			uptimeEl.textContent = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s % 3600 / 60)) + ':' + pad2(s % 60);
		}
		// Load average — drifts upward over time
		if (laEl) {
			var laDrift = elapsed * 2.5;
			laEl.textContent =
				(295.80 + laDrift + rnd(-1, 1)).toFixed(2) + ' ' +
				(289.35 + laDrift * 0.85 + rnd(-0.75, 0.75)).toFixed(2) + ' ' +
				(237.34 + laDrift * 0.6 + rnd(-0.5, 0.5)).toFixed(2);
		}
		// Task count — climbs fast pre-swap, slows under pressure
		if (tasksEl) {
			var taskRate = elapsed < MEM_FILL_SECS ? 3 : Math.max(0.3, 3 * (1 - swapPressure));
			tasksEl.textContent = Math.floor(571 + elapsed * taskRate + rnd(-1, 1));
		}
		// CPU grid
		renderCpus();
		// All process rows — TIME+ ticks, CPU% fluctuates
		procs.forEach(function (p, i) {
			// Drift base CPU slightly each tick
			if (p.highCpu) p.baseCpu = Math.max(40, Math.min(90, p.baseCpu + rnd(-2, 2)));
			else if (p.isMonster) p.baseCpu = Math.max(92, Math.min(99.9, p.baseCpu + rnd(-0.5, 0.5)));
			else if (p.isTensile) p.baseCpu = Math.max(10, Math.min(40, p.baseCpu + rnd(-1.5, 1.5)));
			else if (p.hblLeaf) p.baseCpu = Math.max(30, Math.min(99, p.baseCpu + rnd(-5, 5)));
			// Accumulate CPU time: 1 tick = 1s wall time, scaled by CPU%
			p.cpuTime += p.baseCpu / 100;

			var newEl = renderRow(p);
			procsEl.replaceChild(newEl, rowEls[i]);
			rowEls[i] = newEl;
		});
	}
	var intervalId;

	// CK churn: slow, every 15-30s a CK leaf finishes one ISA pass and maybe rotates source
	function ckChurn() {
		if (frozen) return;
		var li = pick(ckLeafIndices);
		var leaf = procs[li];
		var parentIdx = li - 1;
		var parent = procs[parentIdx];

		leaf.pid = nextPid++;
		leaf.birthTime = (Date.now() - t0) / 1000;
		leaf.baseCpu = rnd(45, 84);
		leaf.cpuTime = 0;

		// 30% chance: new source file (finished all ISAs for that file)
		if (Math.random() < 0.3) {
			var newSrc = nextCkSrc();
			parent.cmd = ckClangCmd(newSrc);
			parent.pid = nextPid++;
			parent.birthTime = leaf.birthTime - rnd(0.01, 0.05);
			parent.cpuTime = 0;
		}

		setTimeout(ckChurn, 15000 + Math.random() * 15000);
	}

	// Tensile churn: fast, every 1-3s an assembly worker finishes and new one starts
	function hblChurn() {
		if (frozen) return;
		var li = pick(hblLeafIndices);
		var leaf = procs[li];

		leaf.pid = nextPid++;
		leaf.birthTime = (Date.now() - t0) / 1000;
		leaf.cmd = hblAsmCmd();
		leaf.baseCpu = rnd(40, 99);
		leaf.cpuTime = 0;

		setTimeout(hblChurn, 1000 + Math.random() * 2000);
	}

	// Start animation once htop is 1/3 visible
	function start() {
		if (started) return;
		started = true;
		t0 = Date.now();
		intervalId = setInterval(tick, 1000);
		setTimeout(ckChurn, 15000 + Math.random() * 15000);
		setTimeout(hblChurn, 1000 + Math.random() * 2000);
	}

	var htopEl = document.querySelector('.htop');
	var rect = htopEl.getBoundingClientRect();
	var visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
	if (visibleHeight >= rect.height / 3) {
		start();
	} else {
		var observer = new IntersectionObserver(function (entries) {
			if (entries[0].isIntersecting) {
				start();
				observer.disconnect();
			}
		}, { threshold: 0.33 });
		observer.observe(htopEl);
	}
})();
