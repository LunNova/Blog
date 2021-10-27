+++
title = "Fixing Nvidia Shield streaming service cursor locking"
date = 2021-10-27
description = "Fixing an Nvidia Shield streaming service bug which locks the cursor to the primary monitor"

[taxonomies]
tags = ["afternoon project"]
+++

This post describes some details of [an afternoon project from 2017](https://github.com/TransLunarInjection/NoCursorLock/releases "NoCursorLock repository").

Nvidia's shield streaming service locks the cursor to the primary monitor when streaming any game and [reports][r1] over [the][r2] years [asking][r3] to turn this off went unanswered.

Let's fix it.

[r1]: https://www.nvidia.com/en-us/geforce/forums/gamestream/19/277489/can-gamestream-not-lock-the-cursor-to-primary-moni/
[r2]: https://www.nvidia.com/en-us/geforce/forums/gamestream/19/304525/please-disable-cursor-lock-to-single-display/
[r3]: https://www.nvidia.com/en-us/geforce/forums/gamestream/19/464574/disable-cursor-lock/

### Detailed problem

The `nvstreamer.exe` process repeatedly calls [ClipCursor](https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-clipcursor) with the coordinates of the full primary monitor.

### Workaround

Let's prevent it from doing this.

[MinHook](https://github.com/TsudaKageyu/minhook) is a simple hooking library for windows, and we can use it to intercept `ClipCursor` calls and set the `rect` to `null` instead.

The boilerplate of this project was handled by using Visual Studio 2017's C++ DLL template.

```cpp
#include "stdafx.h"
#include <Windows.h>
#include "MinHook.h"

typedef int (WINAPI *MESSAGEBOXW)(HWND, LPCWSTR, LPCWSTR, UINT);
typedef int (WINAPI *CLIPCURSOR)(RECT*);
CLIPCURSOR fpClipCursor = NULL;
static bool enable = false;

int WINAPI DetourClipCursor(RECT* rect)
{
	return fpClipCursor(NULL);
}

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
					 )
{
	if (!enable) {
		enable = true;
		if (MH_Initialize() != MH_OK)
		{
			MessageBoxA(NULL, "Failed to initialise MH", "", 0);
			return FALSE;
		}
		if (MH_CreateHook(&ClipCursor, &DetourClipCursor,
			reinterpret_cast<LPVOID*>(&fpClipCursor)) != MH_OK)
		{
			MessageBoxA(NULL, "Failed to create MH", "", 0);
			return FALSE;
		}
		if (MH_EnableHook(&ClipCursor) != MH_OK)
		{
			MessageBoxA(NULL, "Failed to enable MH", "", 0);
			return FALSE;
		}
	}
	return TRUE;
}
```

Injecting this DLL into `nvstreamer.exe` will prevent it from locking the cursor.
