# Extension Audit — 2026-07-05

## Status: COMPLETE

**28/28 tests pass.** 17 tools (8 desktop + 9 browser) + 15 OctoCode-compatible wrappers.

## Architecture

```
src/octocode-desktop/    # Core tools (Effect Schema, standalone)
tools/                   # OctoCode-compatible wrappers (Zod, plugin interface)
browser-server.cjs       # Node subprocess for Playwright (Bun can't spawn browsers)
img-util.ts              # Raw PNG conversion (nut.js → base64)
tool.ts                  # Tool.define() helper
lazy-dep.ts              # Auto-install npm deps
```

## Two tool layers

1. **Core tools** (`src/octocode-desktop/*.ts`) — Effect Schema, standalone, works without OctoCode
2. **OctoCode tools** (`tools/*.ts`) — Zod args, matches OctoCode's `ToolDefinition` interface

## Tools

### Desktop (6 tools)
| Tool | Backend | RAM |
|------|---------|-----|
| desktop_screenshot | nut.js screen.grab() | ~2MB |
| desktop_control | nut.js mouse/keyboard | ~1MB |
| desktop_clipboard | clipboardy | ~1MB |
| desktop_window | nut.js getWindows() | ~2MB |
| desktop_open_app | child_process | ~0MB |
| desktop_screen_record | nut.js interval | ~5MB |

### Browser (9 tools via Node bridge)
| Tool | Backend | RAM |
|------|---------|-----|
| browser_navigate | Playwright Chromium | ~80MB |
| browser_click | Playwright | shared |
| browser_type | Playwright | shared |
| browser_screenshot | Playwright | shared |
| browser_evaluate | Playwright | shared |
| browser_wait | Playwright | shared |
| browser_hover | Playwright | shared |
| browser_select | Playwright | shared |
| browser_drag | Playwright | shared |

**Total RAM:** ~90MB (desktop ~10MB + browser ~80MB)

## Why Node bridge?

Playwright's process spawning hangs under Bun runtime. Node subprocess handles browser operations via stdin/stdout JSON. Transparent to the extension — Bun runs the main process, Node handles Chromium.

## Installation

```bash
npm install -g octocode-desktop-ext
```

OctoCode will discover tools in `{tool,tools}/` directories. Copy `tools/*.ts` to your OctoCode config dir.

## Deleted files

agent.ts, platform.ts, index.ts, desktop_record.ts, desktop_replay.ts, desktop_workflow.ts

## Known limitations

- `window.minimize` unsupported on Windows (libnut)
- First browser launch ~3s cold start
- Browser requires Playwright Chromium (116MB download on first use)
