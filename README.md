<div align="center">

<img src="assets/logo-transparent.png" alt="ShareCube" width="120" height="120">

# ShareCube plugin

**Publish, edit, and comment on shareable HTML and Markdown artifacts from your coding agent.**

[![Validate](https://github.com/infragate/sharecube-plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/infragate/sharecube-plugin/actions/workflows/validate.yml)
[![Agent Plugins 1.0.0](https://img.shields.io/badge/Agent%20Plugins-1.0.0-6249b5)](https://agent-plugins.org)
[![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-6249b5)](https://docs.infragate.ai/sharecube/mcp/)
<br>
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-a99ad9)](#claude-code)
[![Cursor](https://img.shields.io/badge/Cursor-plugin-a99ad9)](#cursor)
[![Codex](https://img.shields.io/badge/Codex-plugin-a99ad9)](#codex)
[![License: MIT](https://img.shields.io/badge/License-MIT-a99ad9)](LICENSE)

[Website](https://sharecube.io) · [Docs](https://docs.infragate.ai/sharecube/) · [MCP setup](https://docs.infragate.ai/sharecube/mcp/)

</div>

---

## What it does

Your agent writes a report, a plan, or a page. ShareCube turns it into a link your team can open, comment on, and edit. The plugin gives the agent:

- **The ShareCube MCP server** at `https://app.sharecube.io/mcp`, for creating, finding, editing, and commenting on artifacts. Sign-in is OAuth, so there are no keys to configure.
- **A `sharecube` skill** that tells the agent when to reach for ShareCube and how to use it safely: targeted edits that never overwrite changes people made in the web app, HTML that works in ShareCube's sandboxed viewer, anchored and resolved comments, and confirming before a permanent delete.

## Install

### Claude Code

```
/plugin marketplace add infragate/sharecube-plugin
/plugin install sharecube@sharecube
```

The first ShareCube tool call opens a browser window to sign in.

### Cursor

1. Open **Cursor Settings → Plugins**.
2. Search for **ShareCube**.
3. Click **Install**, then sign in to ShareCube when Cursor prompts you.

Or run `/add-plugin sharecube` in chat.

To run it from source instead, clone it into Cursor's local plugins folder and restart Cursor:

```
git clone https://github.com/infragate/sharecube-plugin ~/.cursor/plugins/local/sharecube
```

### Codex

```
codex plugin marketplace add infragate/sharecube-plugin
codex plugin add sharecube@sharecube
```

In the ChatGPT desktop app, add `infragate/sharecube-plugin` as a marketplace and install **ShareCube** from it.

### Hosts

One tree serves every host. Each reads its own manifest and shares the same skill and MCP server.

| Host | Manifest | MCP config |
| --- | --- | --- |
| [Agent Plugins](https://agent-plugins.org) clients | `plugin.json` | `mcp.json` |
| Claude Code | `.claude-plugin/plugin.json` | `.mcp.json` |
| Cursor | `.cursor-plugin/plugin.json` | inline in its `plugin.json` |
| Codex | `plugin.json`, with its display name and logo under `extensions["com.openai"]` | `mcp.json` |

All three describe the same server. They are separate because each host spells the transport differently: `streamable-http` for Agent Plugins and Codex, `http` for Claude Code, and no type at all for Cursor, which infers it from the URL.

Keep `plugin.json` and `mcp.json` on Agent Plugins **1.0.0**. Codex rejects any other version and the plugin fails to load. Codex lists the plugin from `.agents/plugins/marketplace.json`, and older Codex builds read `.codex-plugin/plugin.json`.

## Development

Try your working copy in Claude Code:

```
claude --plugin-dir .
```

Check the manifests before you push:

```
node scripts/check-manifests.mjs
```

It fails if the manifests disagree on name, version, or license, reference a file that does not exist, or describe different MCP servers. CI runs it on every push and pull request, along with the Agent Plugins 1.0.0 schemas, a real install with the Codex CLI, Cursor's validator from [cursor/plugin-template](https://github.com/cursor/plugin-template), and `claude plugin validate`.

To release, bump `version` in all four manifests together and add an entry to [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
