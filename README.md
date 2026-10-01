<div align="center">

<img src="assets/logo.png" alt="ShareCube" width="120" height="120">

# ShareCube plugin

**Publish, edit, and comment on shareable HTML and Markdown artifacts from your coding agent.**

[![Validate](https://github.com/infragate/sharecube-plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/infragate/sharecube-plugin/actions/workflows/validate.yml)
[![Agent Plugins 1.1.0](https://img.shields.io/badge/Agent%20Plugins-1.1.0-6249b5)](https://agent-plugins.org)
[![MCP](https://img.shields.io/badge/MCP-Streamable%20HTTP-6249b5)](https://docs.infragate.ai/sharecube/mcp/)
<br>
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-a99ad9)](#claude-code)
[![Cursor](https://img.shields.io/badge/Cursor-plugin-a99ad9)](#hosts)
[![Codex](https://img.shields.io/badge/Codex-plugin-a99ad9)](#hosts)

[Website](https://sharecube.io) · [Docs](https://docs.infragate.ai/sharecube/) · [MCP setup](https://docs.infragate.ai/sharecube/mcp/)

</div>

---

## What it does

Your agent writes a report, a plan, or a page. ShareCube turns it into a link your team can open, comment on, and edit. The plugin gives the agent:

- **The ShareCube MCP server** at `https://app.sharecube.io/mcp`, for creating, finding, editing, and commenting on artifacts. Sign-in is OAuth, so there are no keys to configure.
- **A `sharecube` skill** that tells the agent when to reach for ShareCube and how to use it well: partial edits instead of full rewrites, anchored comments, and real @mentions.

## Install

### Claude Code

```
/plugin marketplace add infragate/sharecube-plugin
/plugin install sharecube@sharecube
```

The first ShareCube tool call opens a browser window to sign in.

### Hosts

One tree serves every host. Each reads its own manifest and shares the same skill and MCP server.

| Host | Manifest | MCP config |
| --- | --- | --- |
| [Agent Plugins](https://agent-plugins.org) clients | `plugin.json` | `mcp.json` |
| Claude Code | `.claude-plugin/plugin.json` | `.mcp.json` |
| Cursor | `.cursor-plugin/plugin.json` | `.mcp.json` |
| Codex | `.codex-plugin/plugin.json` | `.mcp.json` |

`mcp.json` and `.mcp.json` describe the same server. They are separate because the Agent Plugins schema calls the transport `streamable-http` and the other hosts call it `http`.

## Development

Try your working copy in Claude Code:

```
claude --plugin-dir .
```

Check the manifests before you push:

```
node scripts/check-manifests.mjs
```

It fails if the manifests disagree on name or version, reference a file that does not exist, or describe different MCP servers. CI runs it on every push and pull request, along with the Agent Plugins 1.1.0 schemas and `claude plugin validate`.

To release, bump `version` in all four manifests together.
