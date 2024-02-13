+++
title = "flat_map and indexed flat map"
date = 2024-02-12
description = "Sometimes a list is a map. Sometimes a list with a list of partitions is a map."

[taxonomies]
tags = ["performance"]
+++

A flat map* is a map that is backed by flat sorted backing storage rather than separate buckets.  
Flat maps have slow insertion as they need to move data, or in some cases are read only.  
Flat maps have great cache locality and are very dense. Looking up a value in a flat map requires a binary search.

*Outside of C++ land flat_map probably means map and flatten. This needs a better name.

## Isn't this just a sorted list?

Yeah! A flat map is in some sense just a sorted list with a map interface.

## Why not use a standard hashmap?

Despite "just" being a sorted list, a flat map can often perform better than a more traditional hash map.

The O(1) lookup behavior for hashmaps is a simplification that ignores real world issues with memory hierarchies. Random Access Memory is only approximately uniform and due to caching it becomes more expensive to access data that is far away or hasn't been accessed recently.
Standard hashmaps use more memory per entry than a flat hashmap and use more separate heap allocations, both contributing to cache locality issues.

Please see the [linked resources](#resources) for some more information.

## Why use a standard hashmap?

If you need to frequently insert or remove from the map a basic flat map performs quite poorly, as this is equivalent to inserting in the middle of a sorted list.

# Indexed Flat Map

## Can I add an index too?

If you can cheaply extract a prefix from your keys it can make sense to combine aspects of a bucketed hashmap and a flat map.

First construct your sorted list backing your flat_map. Next, record an index of ranges within the backing array which have a particular prefix.

You can think of those indexes as partition points for virtual buckets in the backing array.  
This optimization sounds like it only removes a small fixed number of steps from the binary search if analyzed in terms of steps, but in practice is more impactful due to reducing how spread out each check is.  
This optimization is particularly important if your flat map is large, stored on disk and the binary search could cause many different sectors to be fetched unnecessarily.  

## Example indexed flat map mmaped file data format

Flat maps can be a great fit for a file format intended to be mmaped directly into memory and never updated as they are very compact and provide good lookup performance. This approach is popular with game devs, I've seen an indexed flat map used multiple times in this industry.

For an indexed flat map with only one prefix bit (two virtual buckets):

```sh
Index = [
    (0, 6), # keys with msb 0 are in the range 0..=5
    (6, 11) # keys with msb 1 are in the range 6..=10
]
Entries = [
    (0001, value),
    (0010, value),
    .....,
    (1111, value),
]
```

To look up an entry in this map by key:

```
Lookup key:   0010
Prefix:       msb = 0.
Search range: Index[0] = (0, 6)
Binary search for key 0010 in Entries[0..6] ->
  finds (0010, value)
```

A real implementation would use more prefix bits and a bigger vector of entries.  
It may also need to derive the key to use in indexing with a hash function, if the data you are storing does not already have a unique reasonably sized integer key.

# Footnotes

## Resources

C++ flat_map proposal: https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/p0429r3.pdf

Talk which discusses memory locality with examples in C++ and includes flat_maps: [What Do You Mean by "Cache Friendly"? - Björn Fahller - C++ on Sea 2022](https://www.youtube.com/watch?v=yyNWKHoDtMs)

## Why are you ignoring Big O? Binary search is worse than a hash lookup

Big O operations given for most data structures ignore cache locality and can be very misleading. I don't recommend memorising Big O tables as your only reference for data structure performance. Becoming familiar with more nuanced characteristics of data structures on real hardware and aggressively profiling to find out when you're wrong will allow you to write faster code.
