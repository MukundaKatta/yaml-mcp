#!/usr/bin/env node
/**
 * yaml MCP server. Two tools: `to_json` and `to_yaml`.
 *
 * Backed by the `yaml` npm package (YAML 1.2). Multi-document YAML loads
 * to an array of documents; single-document YAML loads to a single value.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { parse as yamlParse, parseAllDocuments, stringify as yamlStringify } from 'yaml';

const VERSION = '0.1.0';

export function yamlToJson(text: string, options: { allDocuments?: boolean } = {}): unknown {
  if (options.allDocuments) {
    return parseAllDocuments(text).map((d) => d.toJS());
  }
  return yamlParse(text);
}

export function jsonToYaml(value: unknown, options: { indent?: number } = {}): string {
  return yamlStringify(value, { indent: options.indent ?? 2 });
}

const server = new Server({ name: 'yaml', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'to_json',
    description: 'Parse YAML and return the JSON-compatible value.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'YAML source.' },
        all_documents: {
          type: 'boolean',
          default: false,
          description: 'If true, parse a multi-document YAML stream and return an array of docs.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'to_yaml',
    description: 'Serialize a JSON-compatible value to YAML.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { description: 'JSON value to serialize. Any type.' },
        indent: { type: 'integer', default: 2, description: 'Indent width.' },
      },
      required: ['value'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'to_json') {
      const a = args as unknown as { text: string; all_documents?: boolean };
      return jsonResult({ value: yamlToJson(a.text, { allDocuments: a.all_documents }) });
    }
    if (name === 'to_yaml') {
      const a = args as unknown as { value: unknown; indent?: number };
      return textResult(jsonToYaml(a.value, { indent: a.indent }));
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('yaml tool failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`yaml MCP server v${VERSION} ready on stdio\n`);
}
