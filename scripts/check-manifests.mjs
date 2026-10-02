// Checks the things no single host's validator sees: that the per-host
// manifests agree with each other and point at files that exist.
// Run with: node scripts/check-manifests.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const expect = (ok, message) => ok || errors.push(message);

const manifests = {
  'plugin.json': read('plugin.json'),
  '.claude-plugin/plugin.json': read('.claude-plugin/plugin.json'),
  '.cursor-plugin/plugin.json': read('.cursor-plugin/plugin.json'),
  '.codex-plugin/plugin.json': read('.codex-plugin/plugin.json'),
};
const { name, version } = manifests['plugin.json'];

for (const [file, manifest] of Object.entries(manifests)) {
  for (const field of ['name', 'version', 'license']) {
    const want = manifests['plugin.json'][field];
    expect(manifest[field] === want, `${file}: ${field} is "${manifest[field]}", plugin.json says "${want}"`);
  }

  // Every plugin-relative path a manifest references has to exist.
  const paths = JSON.stringify(manifest).match(/"\.\/[^"]*"/g) ?? [];
  for (const path of paths.map((p) => JSON.parse(p))) {
    expect(existsSync(path), `${file}: ${path} does not exist`);
  }
}

for (const file of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json']) {
  expect(read(file).plugins.some((p) => p.name === name), `${file}: no plugin named "${name}"`);
}

// Codex only accepts Agent Plugins 1.0.0. Any other agent-plugins.org $schema
// still wins over .codex-plugin/plugin.json and then fails to load, so Codex
// shows "Plugin not found" with no name or icon.
for (const [file, kind] of [['plugin.json', 'plugin'], ['mcp.json', 'mcp']]) {
  const want = `https://agent-plugins.org/schemas/1.0.0/${kind}.schema.json`;
  expect(read(file).$schema === want, `${file}: $schema must be ${want} for Codex`);
}

// Codex takes its interface (display name, logo) from plugin.json's
// com.openai extension; older Codex builds read .codex-plugin/plugin.json.
expect(
  JSON.stringify(manifests['plugin.json'].extensions?.['com.openai']?.interface) ===
    JSON.stringify(manifests['.codex-plugin/plugin.json'].interface),
  'plugin.json extensions["com.openai"].interface differs from .codex-plugin/plugin.json interface',
);

// The same MCP server is spelled three ways: mcp.json (Agent Plugins, Codex),
// .mcp.json (Claude Code), and inline in the Cursor manifest. Only the
// transport field differs, so the servers and URLs must match.
const servers = (mcpServers) =>
  Object.entries(mcpServers).map(([id, server]) => `${id} ${server.url ?? server.command}`).sort().join('\n');
const expected = servers(read('mcp.json').mcpServers);
expect(servers(read('.mcp.json').mcpServers) === expected, '.mcp.json describes different servers than mcp.json');
expect(
  servers(manifests['.cursor-plugin/plugin.json'].mcpServers) === expected,
  '.cursor-plugin/plugin.json mcpServers describe different servers than mcp.json',
);

// Agent Skills requires the frontmatter name to match the skill's directory.
for (const dir of readdirSync('skills')) {
  const skill = readFileSync(`skills/${dir}/SKILL.md`, 'utf8');
  expect(new RegExp(`^---[\\s\\S]*?\\r?\\nname: ${dir}\\r?\\n`).test(skill), `skills/${dir}/SKILL.md: frontmatter name is not "${dir}"`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`${name}@${version}: manifests agree`);
