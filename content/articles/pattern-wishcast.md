---
title: "pattern-wishcast: enum pattern types in 2025 rust"
description: Discussing the pattern types proposal, imitating some of it with uninhabited variants.
date: 2025-07-06

taxonomies:
  tags:
    - rust
---

tl;dr: [pattern-wishcast](https://crates.io/crates/pattern-wishcast) for an approximation of enum pattern types, [cargo-derive-doc](https://crates.io/crates/cargo-derive-doc) for a cargo subcommand that documents what macros expand to

---

> **wishcasting /ˈwɪʃˌkɑːstɪŋ/**  
> *n.*-The act of interpreting information or a situation in a way that casts it as favorable or desired, although there is no evidence for such a conclusion; a wishful forecast.

Rust is going to get pattern types. `edition = 2027`?  

## Pattern Types

Pattern types are a proposed name for a subtype of an existing type based on a `match`-like predicate, from an in-progress RFC[^pat_rfc] by [github/joboet](https://github.com/joboet). Some examples of pattern types given by the RFC are:

```rs
Option<i32> is Some(_)
i32 is 1..16
&[Ordering] is [Ordering::Less, ..]
```

In the above syntax the pattern after `is` acts as a predicate constraining which values of the supertype are valid members of the pattern type.  
Pattern types are a form of predicate subtyping[^pr_st]; they are limited to predicates that Rust's patterns can express.  
Pattern types are described as refinement types in the WIP RFC body, but are less powerful than refinement types[^ref_st] as typically described in the literature.

Pattern types would be the first Rust types to have subtyping other than through lifetime variance or outright equality.

### Niche Optimizations

Rust has some special types like [NonZero](https://doc.rust-lang.org/stable/std/num/struct.NonZero.html) that allow for [niche optimizations](https://www.0xatticus.com/posts/understanding_rust_niche/).

> A value that is known not to equal zero.
>
> This enables some memory layout optimization. For example, `Option<NonZero<u32>>` is the same size as `u32`:
>
> ```rs
> use core::{num::NonZero};
> assert_eq!(size_of::<Option<NonZero<u32>>>(), size_of::<u32>());
> ```

Pattern types allow implementing the same thing in a more general way. `NonZero<u32>` would be superceded by `u32 is 1..`.

Layout optimizations for pattern types *do not directly impact the size of the pattern type*; instead they impact the layout of types that contain the pattern type by allowing them to reuse bit patterns that would represent values that *do not* match the pattern's predicate.

A `u32 is 1..10` has many bit patterns that are invalid such as 0, so an `Option<u32 is 1..10>` can pick one of those bit patterns to represent `None`; allowing this to hold: `assert_eq!(size_of::<Option<u32 is 1..10>>(), size_of::<u32>());`

This layout optimization does not cause a problem for subtyping[^rust_pat_pr_wip]: a `u32 is 1..10` ≤: `u32`, an `Option<u32 is 1..10>` is not a subtype of `u32`.
Some of the possible bit patterns in an `Option<u32 is 1..10>`'s backing `u32` sized storage must not be interpreted as `u32`.  
We can not get a `u32` from a `Option<u32 is 1..10>::None`'s backing storage without an unsafe transmute.
If it's `Some` we can get a `&(u32 is 1..10)` out of it, and that being a subtype of `u32` is safe. We don't have to worry about something else mutating it to `None` and making it a `u32` while we have that reference due to rust's usual mutability guarantees.

It's critical this *doesn't* hold for mutable references. An `&mut(u32 is 1..10)` must not be usable as an `&mut u32`, as we could store `0`.

### Implementation Status

rust has an unstable implementation[^rust_pat_tracking] of pattern types which relies on a macro, sidestepping a lack of decision on syntax. The implementation was championed by [github/oli-obk](https://github.com/oli-obk).

```rs
#![feature(pattern_types)
type NonZeroU32 = std::pat::pattern_type!(u32 is 1..);
```

As of 2025-06:

* numeric ranges work
* layout optimization works, similar to `NonZero<_>`
* enum variants do not work
* subtyping does not work :c
  * there's a very limited form of coercion for numeric literals only. `let x: pattern_type!(u32 is 5..10) = 7;` works

## from __future__ import rust::rfcs::enum_pattern_types

Can we create pattern types that allow specific enum variants in current stable rust? No.  
Can we emulate something like pattern types if we plan ahead when defining an enum? Maybe!

Let's try to imitate this type alias:

```rs
// A result that can only be the Ok variant
type OkResult<O, E> = Result<O, E> is Ok(_);
```

```rs
#![feature(never_type)]
#[repr(C)]
enum PatternableResult<P: ResultVariantPresence, O, E> {
  // 2nd arg is either () or !.
  // If it's ! it's uninhabited so this variant can't be constructed and doesn't need to be matched
  Ok(O, P::Ok),
  Err(E, P::Err),
}
type AnyResult<O, E> = PatternableResult<AnyResultVariantPresence, O, E>;
type OkResult<O, E> = PatternableResult<OkResultVariantPresence, O, E>;

// AnyResult instances can be either variant, OkResult instances can only be Ok

trait ResultVariantPresence {
  type Ok;
  type Err;
}
struct OkResultVariantPresence;
impl ResultVariantPresence for OkResultVariantPresence {
  type Ok = ();
  type Err = !;
}
struct AnyResultVariantPresence;
impl ResultVariantPresence for AnyResultVariantPresence {
  type Ok = ();
  type Err = ();
}

fn unwrap_safely(ok: OkResult<i64, ()>) -> i64 {
  match ok {
    OkResult::Ok(contains, _) => {
      // Matched on the only possible variant Ok of OkResult
      contains
    } // We don't need another match arm, rustc can tell Err is uninhabited
  }
}
```

It works! So verbose, and we haven't exposed a safe way to turn an AnyResult that's Ok into an OkResult while proving it is valid to do so.

Let's write a macro which can automate the traits and the conversion boilerplate.

## pattern-wishcast

[![crates.io](https://img.shields.io/crates/v/pattern-wishcast.svg)](https://crates.io/crates/pattern-wishcast)
[![docs.rs](https://docs.rs/pattern-wishcast/badge.svg)](https://docs.rs/pattern-wishcast)
[![GitHub](https://img.shields.io/badge/github-source-blue.svg)](https://github.com/LunNova/x/tree/main/pattern-wishcast)

⚠️ `pattern-wishcast` is a work in progress. Expect breaking changes. miri seems happy with its transmutes, but I couldn't find any reference to point to and confidently declare its internals are ok  
If `pattern-wishcast` on crates.io is > version 0.1 this post is likely using an outdated API

```rs
pattern_wishcast! {
  enum StuckEvaluation = {
    Var { id: usize },
    Application { func: Box<FlexValue>, arg: Box<FlexValue> }
  };

  enum Value is <P: PatternFields> = {
    HostValue { value: String },
    // Self -> Value<P>, recursively preserves applied pattern
    // including checking before conversion in generated downcast
    TupleValue { elements: Vec<Self> },
    StuckEvaluation,
  };

  // with real pattern types we wouldn't need to explicitly make an alias with a wildcard
  type FlexValue = Value is _; 
  type StrictValue = Value is HostValue { .. } | TupleValue { .. };

  // No real subtyping but we can pretend by generating upcast and try downcast impls
  // With real pattern types in rustc no need to declare anything like this
  // StrictValue would be a subtype of FlexValue just from specifying predicates that imply that relation
  #[derive(SubtypingRelation(upcast=to_flex, downcast=try_to_strict))]
  impl StrictValue : FlexValue;
}
// <generated by cargo-derive-doc>
// Macro expansions:
//   pub enum StuckEvaluation
//   pub enum Value<P : PatternFields>
//   pub struct ValueType
//   impl  PatternFields for ValueType
//   pub struct FlexValueType
//   impl  PatternFields for FlexValueType
//   pub struct StrictValueType
//   impl  PatternFields for StrictValueType
//   pub type FlexValue = Value <FlexValueType>
//   pub type StrictValue = Value <StrictValueType>
//   impl  StrictValue
//   impl  FlexValue
// </generated by cargo-derive-doc>
```

`pattern_wishcast!` lets us pretend we have pattern types for enum variants in 2025 stable rust by:

* generating traits with associated types that are either ! or ()
  * which are used to make variants uninhabited
  * we can use `enum Never {}` rather than `!` to avoid depending on an unstable feature
* generating upcast and downcast methods along with ref/mut ref variants where safe
* generating some tests that hopefully fail if future rust makes changes that break the layout assumptions

I'm not confident the generated downcasts and upcasts are sound.  
miri seems happy with transmutes between types that differ only in an unused enum variant swapping from ! to () or vice versa, but I couldn't find any reference to point to and confidently declare it's ok.  
If you find a safety issue please open an issue.

See [pattern-wishcast/examples](https://github.com/LunNova/x/blob/main/pattern-wishcast/examples) for a larger demo.

### Recursive Patterns

`pattern-wishcast` allows recursively applying a pattern with `Self`. In the above example, a `FlexValue::TupleValue`'s elements are `FlexValue`, and a `StrictValue::TupleValue`'s elements are `StrictValue`.

I don't think it's possible to achieve this in the pattern types RFC[^pat_rfc]. It would be great to extend the proposal to allow for this.

Some ideas for extensions to the rfc:

```rs
// Allow recursion in a type alias definition with a predicate?
type StrictValue = Value is HostValue { .. } | TupleValue { elements: Vec<StrictValue> };
// Special Self?
type StrictValue = Value is HostValue { .. } | TupleValue { elements: Vec<Self> };
```

Maybe it's possible with sufficient abuse of the type system (remember `trait TypeFn {type Output<A>;} struct Fix<F: TypeFn>(<F as TypeFn>::Output<Fix<F>>);`?). I haven't worked it out yet and don't have a pattern-type supporting compiler to play with.

## cargo-derive-doc

[![crates.io](https://img.shields.io/crates/v/cargo-derive-doc.svg)](https://crates.io/crates/cargo-derive-doc)
[![GitHub](https://img.shields.io/badge/github-source-blue.svg)](https://github.com/LunNova/x/tree/main/cargo-derive-doc)

While working on `pattern-wishcast` I realized it was hard to tell what a macro does when reviewing diffs and decided to make `cargo-derive-doc`.

`cargo-derive-doc` is a cargo subcommand that maintains comments indicating what types and impls are added by a macro invocation. It's useful anywhere you don't have a functioning IDE with macro expansion, whether that's github's review UI, a minimal editor in a terminal, an LLM code assistant or because rust-analyzer broke and can't expand macros again.

It's almost always because rust-analyzer broke again.  
Why did I try to implement it on top of rust-analyzer's `ra_ap_hir_expand` crate…

Anyway, `cargo-derive-doc` is workable now. It'll probably mess up if you run it on minified code but otherwise should be good enough. It's relying on diffing expanded and original code to map where new items originated since I couldn't get `ra_ap_hir_expand` working.

Check [the README](https://github.com/LunNova/x/tree/main/cargo-derive-doc) for usage instructions.

----

[^pat_rfc]:  [gist joboet/0000-pattern-types.md](https://gist.github.com/joboet/0cecbce925ee2ad1ee3e5520cec81e30)
[^pr_st]: Predicate Subtyping was described in [Subtypes for Specifications: Predicate Subtyping in PVS](https://www.csl.sri.com/papers/tse98/tse98.pdf) <sup>1998</sup>
[^ref_st]: Refinement types were introduced in [Refinement Types for ML](https://www.cs.cmu.edu/~fp/papers/pldi91.pdf) <sup>1991</sup>.
[^rust_pat_pr_wip]: See discussion on github/rust-lang [Pattern types MVP #107606](https://github.com/rust-lang/rust/pull/107606#issuecomment-1422953975)
[^rust_pat_tracking]: github/rust-lang [feature(pattern_types) tracking #123646](https://github.com/rust-lang/rust/issues/123646) and [feature(generic_pattern_types) tracking #136574](https://github.com/rust-lang/rust/issues/136574)
