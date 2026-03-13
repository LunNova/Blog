+++
title = "A model for mapped dependencies in Gradle which you can't use fully (yet)"
date = 2022-10-31
description = "A model for mapped dependencies in Gradle which you can't use fully (yet)"

[taxonomies]
tags = ["gradle", "minecraft", "modding"]
+++

## What's a mapped dependency?

A mapped dependency is one which has had classes, fields, methods or variables renamed such that they no longer match the original form.

There are two usecases for mapped dependencies I know of:

* Avoiding conflicts when shadowing a dependency into your jar
* Obfuscating code

This article focuses on the second use case.

## What do we have now?

Currently projects involving minecraft using mapped artifacts represent them with either a different artifact identifier, a classifier, or no change at all.

## What could we do differently?

We should store the mapping information for a dependency as a gradle attribute.

For example, `net.minecraft:minecraft:1.10` with srg mappings could have the attribute `mapping:net.minecraft` set to `srg` to indicate which mappings are used. In a real use case it would be best to have that mapping identifier also be the maven coordinate the mappings were retrieved from, if one exists.

## Does this work?

You can create artifacts which have a custom attribute set to indicate the mapping right now in your Gradle project, and it works fine. It does require that you publish [Gradle Module Metadata](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html).

Due to limitations in Gradle's dependency resolution you can't take full advantage of this later when you want to consume these artifacts with custom attributes.

## What isn't working?

[Gradle has a way to register an artifact transform](https://docs.gradle.org/current/userguide/artifact_transforms.html) which is able to transform between an input attribute value to an output attribute value. For example, you can register a transform capable of transforming from `mapping:net.minecraft`=`obfuscated-1.14` to `srg`.

This sounds like a great solution which could handle automatically mapping any of your input dependencies if required.

If you do this, it won't work. Artifact transforms are only called to transform from the default value of an attribute. If you register a transform from any other value and a dependency explicitly has that attribute value it is never called and resolution fails.

There is an open issue [gradle#8386](https://github.com/gradle/gradle/issues/8386) about support for this but it has been pending since 2019. The documentation for transforms does not currently explain this limitation which has lead to at least a few people trying to use it and running into it not working.

See also [gradle#18978](https://github.com/gradle/gradle/issues/18978) and [gradle#15642](https://github.com/gradle/gradle/issues/15642).

## Are there any other problems that impact this modding usecase?

### N^2 registrations required for N known mappings

Registering a large number of transforms on a 1:1 basis only isn't scalable as the number of mappings you support increases. If the above issues are fixed this could still limit the usage of this technique.

Allowing registration of a generic transform which can signal both whether it can handle inputs with particular attribute values and outputs with particular attribute values would avoid N^2 scaling with the number of known mappings.

Here is an example of what registering a transform capable of multiple input and attribute values could look like:

```groovy
registerManyToManyTransform(Mapper::class) {
    from.attributeList(minified,  Lists.of("srg", "obfuscated-1.4", "net.minecraft:mojmap:1.4")).attribute(artifactType, "jar")
    to.attributeList(minified, Lists.of("srg", "net.minecraft:mojmap:1.4")).attribute(artifactType, "jar")
}
```

Compare this with the example from the gradle docs:

```groovy
dependencies {
    registerTransform(Minify::class) {
        from.attribute(minified, false).attribute(artifactType, "jar")
        to.attribute(minified, true).attribute(artifactType, "jar")
    }
}
```

My suggested approach is likely not the most gradley way of doing this, and mostly intended as an example.

### Component Metadata Rules are ignored for SelfResolvingDependency

[gradle#13044](https://github.com/gradle/gradle/issues/13044) makes it hard to have a dependency which is not in any maven repo (for example the minecraft game jar) and attach custom attributes to it.

Due to copyright issues it may not be plausible for someone to publish every dependency that needs an attribute set to a maven repo.

## Why is this worth doing?

I'm not sure it is worth doing in a business sense.
The subset of Gradle users who could benefit from this is probably non-paying, as I expect modders don't often sign up for Gradle Enterprise!
