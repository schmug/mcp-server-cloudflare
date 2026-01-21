# @cloudflare/mcp-server-cloudflare-plugin

A plugin that exposes Cloudflare tools for use with any MCP (Model Context Protocol) server.

## Features

- **Easy Integration**: Register Cloudflare tools with any MCP server with a single function call
- **Selective Tools**: Enable only the tool categories you need
- **CLI Support**: Run as a standalone MCP server with stdio transport
- **Type-Safe**: Full TypeScript support with exported types

## Installation

```bash
npm install @cloudflare/mcp-server-cloudflare-plugin
# or
pnpm add @cloudflare/mcp-server-cloudflare-plugin
```

## Quick Start

### As a Library

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerCloudflareTools } from '@cloudflare/mcp-server-cloudflare-plugin'

const server = new McpServer({ name: 'my-server', version: '1.0.0' })

registerCloudflareTools(server, {
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID, // optional
})
```

### As a Standalone Server

```typescript
import { createCloudflareServer } from '@cloudflare/mcp-server-cloudflare-plugin'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const { server } = createCloudflareServer({
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
})

const transport = new StdioServerTransport()
await server.connect(transport)
```

### CLI Usage

```bash
# Run directly with npx
CLOUDFLARE_API_TOKEN=xxx npx @cloudflare/mcp-server-cloudflare-plugin

# Or install globally
npm install -g @cloudflare/mcp-server-cloudflare-plugin
CLOUDFLARE_API_TOKEN=xxx cloudflare-mcp-plugin
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["@cloudflare/mcp-server-cloudflare-plugin"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Configuration

### CloudflarePluginConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `apiToken` | `string` | Yes | Cloudflare API token |
| `accountId` | `string` | No | Default account ID for API calls |
| `enabledCategories` | `ToolCategory[]` | No | Only enable these tool categories |
| `disabledCategories` | `ToolCategory[]` | No | Disable these tool categories |

### Environment Variables (CLI)

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Required. Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Optional. Default account ID |
| `CLOUDFLARE_ENABLED_CATEGORIES` | Optional. Comma-separated list of categories to enable |

## Available Tool Categories

| Category | Tools |
|----------|-------|
| `accounts` | List accounts, set active account |
| `workers` | List, get, delete Workers |
| `kv` | KV namespace CRUD operations |
| `r2` | R2 bucket CRUD operations |
| `d1` | D1 database CRUD and query |
| `zones` | Zone listing, details, DNS records |

More categories coming soon:
- `radar` - Cloudflare Radar analytics
- `hyperdrive` - Hyperdrive management
- `ai-gateway` - AI Gateway logs
- And more...

## Selective Tool Registration

```typescript
// Only enable specific categories
registerCloudflareTools(server, {
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  enabledCategories: ['workers', 'kv', 'd1'],
})

// Enable all except some
registerCloudflareTools(server, {
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  disabledCategories: ['zones'],
})
```

## Individual Tool Registration

For fine-grained control, you can register individual tool modules:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  createPluginContext,
  registerAccountTools,
  registerWorkersTools,
  registerKVTools,
} from '@cloudflare/mcp-server-cloudflare-plugin'

const server = new McpServer({ name: 'my-server', version: '1.0.0' })
const context = createPluginContext({
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
})

// Register only the tools you need
registerAccountTools(server, context)
registerWorkersTools(server, context)
registerKVTools(server, context)
```

## API Reference

### registerCloudflareTools(server, config)

Register all Cloudflare tools with an MCP server.

- **server**: `McpServer` - The MCP server instance
- **config**: `CloudflarePluginConfig` - Configuration options
- **Returns**: `PluginContext` - Context object for advanced usage

### createCloudflareServer(config, serverOptions?)

Create a fully configured MCP server with Cloudflare tools.

- **config**: `CloudflarePluginConfig` - Configuration options
- **serverOptions**: `{ name?: string, version?: string }` - Optional server config
- **Returns**: `{ server: McpServer, context: PluginContext }`

### createPluginContext(config)

Create a plugin context for manual tool registration.

- **config**: `CloudflarePluginConfig` - Configuration options
- **Returns**: `PluginContext`

## Getting Your API Token

1. Go to [Cloudflare Dashboard API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use a template or create a custom token with the permissions you need
4. Copy the token and use it in your configuration

## License

Apache-2.0

## Contributing

See the main [mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) repository for contribution guidelines.
