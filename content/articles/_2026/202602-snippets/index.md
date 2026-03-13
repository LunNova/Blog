+++
title = "202602 Snippets"
date = 2026-02-15
description = "Site update, linkpost for February 2026. Student loan discharge, chickenpox vaccines, realistic birth lottery."
tags = ["snippets"]
+++

## Site update

Experimenting with a new [quick reference handbook](/qrh) section which collates tagged snippets and extracts from articles.  
Plan to iterate on how this is presented and loaded somewhat over the coming days. Not sure if the feature will stick around.

## Links

- [Send your name around the moon](https://www3.nasa.gov/send-your-name-with-artemis/) — nasa.gov  
  You can sign up to have your name as data on an SD card that's going on [Artemis II](https://en.wikipedia.org/wiki/Artemis_II)
- [The UK is finally giving all children chickenpox vaccines](https://www.gov.uk/government/news/free-chickenpox-vaccination-offered-for-first-time-to-children) — gov.uk  
  Welcome to the 20th? century. Sucked having chickenpox when I grew up in the UK, glad this has been fixed.
- [No, it's not The Incentives — it's you](https://talyarkoni.org/blog/2018/10/02/no-its-not-the-incentives-its-you/) — talyarkoni.org  
  The existence of perverse incentives should not be seen as an acceptable reason to misbehave.
- [Birth Lottery](https://birth-lottery.thetetra.space/) — thetetra.space  
  "Draw again from the birth lottery to take a different sample from the way those circumstances outside your control go for living beings on Earth today."
  I'm an isopod!
- [The US has too many bus stops within walking distance of each other](https://worksinprogress.co/issue/the-united-states-needs-fewer-bus-stops/) — worksinprogress.co  
  Comparing with European cities with functioning public transit, their bus networks are sparser than many US cities. Too many stops close together wastes riders' time and adds costs. The same resources could be used to have better coverage elsewhere.
- [US student loans are more often dischargeable in bankruptcy since 2022 changes to procedure](https://www.justice.gov/archives/opa/pr/justice-department-and-department-education-announce-fairer-and-more-accessible-bankruptcy) — justice.gov  
  87% of filings to discharge student loans succeeded in a [dataset collected since the 2022 reforms](https://www.ablj.org/wp-content/uploads/2025/12/Iuliano_ABLJ_99-3.pdf), but people rarely ask for them to be discharged. Most people still think that student loans can't be wiped during bankruptcy. If you know someone with student loans who's struggling, make sure they know! It could be a big deal.
- [Signed, Sealed, Stolen: How We Patched Critical Vulnerabilities Under Fire [FOSDEM 2026]](https://www.youtube.com/watch?v=CZ4nk9aWzYM) — youtube.com  
  [Slides](https://fosdem.org/2026/events/attachments/ETMLM8-signed_sealed_stolen_how_we_patched_critical_vulnerabilities_under_fire/slides/267683/slides-ex_msapjhv.pdf). Great fosdem talk by Jade Ellis on reacting in real time to a hack.
- [Gyre](https://vgel.me/fiction/gyre/) — vgel.me  
  Short piece of fiction by Theia

## Dev

[pattern-wishcast](https://crates.io/crates/pattern-wishcast) is getting a major rework to allow intersecting patterns when recursively storing Self to handle my usecase for it in a dependently typed language's evaluator. It will likely look like this:

```rs
pattern_wishcast! {
    enum Value {
        Number { value: i32 },
        Slot { name: String, size: Box<Self & Number> },
        StuckValue,
    };

    restriction Number of Value = Value::Number | Value::StuckValue;
    restriction Strict of Value = _ - Value::StuckValue;
}
```

`Strict::Slot`'s size field can only be `Strict::Number`, `Value::Slot`'s size field can be `StuckValue` or `Number`.  
If rust had a nicer way of enforcing having checked constructors/asserts on construct without messing with visibility I might not have bothered working out how to represent this in the type system properly, but it's fun to have an excuse to use type level fix again.
