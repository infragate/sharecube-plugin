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
  expect(manifest.name === name, `${file}: name is "${manifest.name}", plugin.json says "${name}"`);
  expect(manifest.version === version, `${file}: version is "${manifest.version}", plugin.json says "${version}"`);

  // Every plugin-relative path a manifest references has to exist.
  const paths = JSON.stringify(manifest).match(/"\.\/[^"]*"/g) ?? [];
  for (const path of paths.map((p) => JSON.parse(p))) {
    expect(existsSync(path), `${file}: ${path} does not exist`);
  }
}

for (const file of ['.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json']) {
  expect(read(file).plugins.some((p) => p.name === name), `${file}: no plugin named "${name}"`);
}

// The same MCP server is spelled three ways: mcp.json (Agent Plugins),
// .mcp.json (Claude Code, Codex), and inline in the Cursor manifest. Only the
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
