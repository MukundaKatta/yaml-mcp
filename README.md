# yaml-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/yaml-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/yaml-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server: convert between YAML and JSON. Two tools — `to_json` and
`to_yaml`. Multi-document YAML streams are supported.

## Tools

### `to_json`

```json
{ "text": "name: Mukunda\nage: 30\ntags:\n  - rust\n  - python" }
```

→ `{ "value": { "name": "Mukunda", "age": 30, "tags": ["rust", "python"] } }`

Set `all_documents: true` for multi-doc streams (`a:1\n---\nb:2`) — returns an array of values.

### `to_yaml`

```json
{ "value": { "name": "x", "tags": ["a", "b"] } }
```

→ multi-line YAML output. `indent` (default 2) controls indent width.

## Configure

```json
{ "mcpServers": { "yaml": { "command": "npx", "args": ["-y", "@mukundakatta/yaml-mcp"] } } }
```

## License

MIT.
