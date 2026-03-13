+++
title = "WoW's bag upgrade indicator addon API was removed"
date = 2024-05-07
description = "World of Warcraft's UpdateItemUpgradeIcon API was removed in patch 10.0.2"

[taxonomies]
tags = ["gamedev", "game modding", "world of warcraft"]
+++

WoW had an API to allow displaying an indicator on items in your bag when they are an upgrade to your currently equipped item or for other custom conditions.

This API was called `ContainerFrameItemButton_UpdateItemUpgradeIcon` in Legion through Shadowlands, and briefly `UpdateItemUpgradeIcon` on `ContainerFrameItemButtonMixin` in Dragonflight.  
In Dragonflight patch 10.0.2 which was released November 15, 2022 this API was completely removed.

It is no longer possible to hook UpgradeItemUpgradeIcon and display upgrade indicators in vanilla bags.
This change was not previously documented anywhere so I'm writing this article to help future addon developers save time.

# Third Party Bag Addons

## ElvUI

ElvUI's bags support upgrade indicators. This integration is intended to interact directly with the Pawn addon, and accesses a function in the global environment.

```lua
-- We need to use the Pawn function here to show actually the icon, as Blizzard API doesnt seem to work.
if _G.PawnIsContainerItemAnUpgrade then itemIsUpgrade = _G.PawnIsContainerItemAnUpgrade(containerID, slotID) end
```

It would be possible to use this hook in an addon that isn't Pawn by reusing that name.  
If you do this please call out the incompatibility in your addon description, or consider asking the ElvUI team to add a more generic way to hook this.

## AdiBags

Like ElvUI, AdiBags directly integrates with Pawn's upgrade function in the global environment.

```lua
-- Blizzard removed their implementation, so rely on Pawn's (third-party addon) if present.
local PawnIsContainerItemAnUpgrade = _G.PawnIsContainerItemAnUpgrade
local itemIsUpgrade = PawnIsContainerItemAnUpgrade and PawnIsContainerItemAnUpgrade(self.bag, self.slot)
```

## BetterBags

BetterBags integrates with Pawn directly. Its integration is more complex and relies on multiple Pawn functions.

See [BetterBags/blob/main/integrations/pawn.lua](https://github.com/Cidan/BetterBags/blob/main/integrations/pawn.lua) for more info.

## Other Bag Addons

I'm not aware of other bag addons with support for an upgrade arrow indicator at this time.
