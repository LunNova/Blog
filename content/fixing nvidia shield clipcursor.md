+++
title = "Fixing Nvidia Shield Streaming service locking the cursor to the primary monitor"
date = 2021-10-27

[taxonomies]
tags = ["afternoon project"]
+++

This post describes some details of an afternoon project from 2017.

Nvidia's shield streaming service locks the cursor to the primary monitor when streaming any game. There isn't really any need to do this, but reports over the years had gone unanswered.

Let's fix it.

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
