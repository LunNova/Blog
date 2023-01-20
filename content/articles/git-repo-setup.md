+++
title = "Sensible Git Repo Initialization"
date = 2023-01-19
description = "Quick tutorial which sets up a git repo that avoids future line endings pain"

[taxonomies]
tags = ["git", "tutorial"]
+++

This mini tutorial is dedicated to my wife, who never remembers to add a .gitattributes file.

## How to set up a sensible git repo

* init the repo with `git init`
* add a `.gitattributes` file which enforces LF line endings for most filetypes
* add a `.gitignore` which ignores compiled or temporary files
* make an initial commit

## Sample .gitattributes file

```.gitattributes
# Handle line endings automatically for files detected as text
# and leave all files detected as binary untouched.
* text=auto eol=lf

# .bat must be crlf to work
*.bat text eol=crlf
```

## Why is .gitattributes important?

Setting up a .gitattributes file like the one above will ensure commited files always have the same line
endings, regardless of the user's OS or local git `core.autocrlf` setting.

## Why is .gitignore important?

If your working directory contains any temporary files .gitignore is important to avoid
accidentally checking them in.
