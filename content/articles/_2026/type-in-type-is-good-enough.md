+++
title = "Type : Type is good enough to get started!"
description = "Girard's paradox hurts less than trying to avoid Girard's paradox"
date = 2026-03-25
tags = ["type-theory"]
+++

Working on a new dependently typed language that isn't also doing proofs?

`Type : Type` is good enough! Don't bother implementing a universe hierarchy. It's fine.  
You can fix it in V2, or once you're self-hosting.

If you try to do it right from the start you'll spend a lot of time handling it, and almost inevitably your V1 will be unsound anyway, whether from your universe hierarchy being flawed or from [unrelated mistakes](https://github.com/idris-lang/Idris-dev/issues/3687).

We can learn from the mistakes of the past to avoid repeating the probable mistakes of the future for the first time. Idris 2 is [still Type-in-Type](https://idris2.readthedocs.io/en/latest/faq/faq.html#does-idris-have-universe-polymorphism-what-is-the-type-of-type).

If you're writing a proof system, please disregard.
