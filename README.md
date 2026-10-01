# ShareCube plugin

Lets coding agents publish, edit, and comment on ShareCube artifacts. One tree, several hosts:

| Host | Reads |
| --- | --- |
| [Agent Plugins](https://agent-plugins.org) clients | `plugin.json`, `mcp.json`, `skills/` |
| Claude Code | `.claude-plugin/`, `.mcp.json`, `skills/` |
| Cursor | `.cursor-plugin/plugin.json` |
| Codex | `.codex-plugin/plugin.json` |

The MCP server is `https://app.sharecube.io/mcp`. Sign-in is OAuth, so there are no keys to configure.

`mcp.json` and `.mcp.json` describe the same server. They are separate because the Agent Plugins schema calls the transport `streamable-http` and the other hosts call it `http`. Keep the versions in all four manifests in sync.

## Try it locally

```
claude --plugin-dir .
```
