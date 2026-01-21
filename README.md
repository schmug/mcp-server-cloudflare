# Cloudflare Claude Plugin

A [Claude Code plugin](https://code.claude.com/docs/en/plugins) that provides access to Cloudflare's MCP servers for managing Workers, storage, security, and more.

> This is a community plugin that wraps the [official Cloudflare MCP servers](https://github.com/cloudflare/mcp-server-cloudflare). For MCP server source code and bug reports, see the upstream repository.

## Installation

```bash
# Add the marketplace
/plugin marketplace add schmug/cloudflare-claude-plugin

# Install all servers
/plugin install cloudflare@cloudflare-mcp

# Or install only what you need
/plugin install cloudflare-workers@cloudflare-mcp
```

## Available Plugins

Install the full bundle or pick individual components:

| Plugin | Description | Auth |
|--------|-------------|------|
| `cloudflare` | All 15 servers | Yes |
| `cloudflare-docs` | Documentation search | **No** |
| `cloudflare-workers` | KV, R2, D1, Builds, Containers | Yes |
| `cloudflare-observability` | Logs, Analytics, GraphQL | Yes |
| `cloudflare-security` | Radar, CASB, Audit Logs | Yes |
| `cloudflare-ai` | AI Gateway, AutoRAG, Browser | Yes |
| `cloudflare-network` | DNS Analytics, DEX | Yes |

## Authentication

Most plugins require a Cloudflare API token:

```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

### Create an API Token

1. Go to **[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)**
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template (or customize below)
4. Add your account/zone resources
5. Create the token

### Full Access Permissions

For all MCP servers, add these permissions:

| Permission | Access | Plugins |
|------------|--------|---------|
| Account > Workers Scripts | Edit | workers |
| Account > Workers KV Storage | Edit | workers |
| Account > Workers R2 Storage | Edit | workers |
| Account > D1 | Edit | workers |
| Account > Workers Tail | Read | observability |
| Account > Account Analytics | Read | observability |
| Account > Logs | Edit | observability |
| Account > AI Gateway | Read | ai |
| Account > Account Audit Logs | Read | security |
| Account > Access: Organizations... | Read | security, network |
| Zone > DNS | Read | network |
| Zone > Analytics | Read | observability, network |
| User > User Details | Read | all |

## Included MCP Servers

| Server | Description |
|--------|-------------|
| `cloudflare-docs` | Search Cloudflare documentation |
| `cloudflare-bindings` | KV, R2, D1, Durable Objects, Queues, Hyperdrive |
| `cloudflare-builds` | Workers builds and deployments |
| `cloudflare-observability` | Logs and analytics |
| `cloudflare-radar` | Internet traffic and URL scanning |
| `cloudflare-containers` | Sandbox environments |
| `cloudflare-browser` | Screenshots and page rendering |
| `cloudflare-logs` | Logpush management |
| `cloudflare-ai-gateway` | AI Gateway analytics |
| `cloudflare-autorag` | AutoRAG document search |
| `cloudflare-auditlogs` | Audit log queries |
| `cloudflare-dns-analytics` | DNS performance |
| `cloudflare-dex` | Digital Experience Monitoring |
| `cloudflare-casb` | SaaS security |
| `cloudflare-graphql` | GraphQL API analytics |

## Skills

The plugin includes workflow skills:

- `/cloudflare:setup` - Configure authentication
- `/cloudflare:deploy-worker` - Deploy Workers
- `/cloudflare:debug-worker` - Troubleshoot issues
- `/cloudflare:analyze-traffic` - Radar traffic analysis

## Manual Configuration

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "cloudflare-mcp": {
      "source": {
        "source": "github",
        "repo": "schmug/cloudflare-claude-plugin"
      }
    }
  },
  "enabledPlugins": {
    "cloudflare-workers@cloudflare-mcp": true
  }
}
```

## Troubleshooting

**"Claude's response was interrupted..."**

This usually means context length was exceeded. Try:
- Being more specific in queries
- Breaking requests into smaller steps

**Authentication errors**

- Verify `CLOUDFLARE_API_TOKEN` is set
- Check token has required permissions
- Ensure token hasn't expired

## Links

- [Upstream MCP Servers](https://github.com/cloudflare/mcp-server-cloudflare) - Source code and contributions
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins) - Plugin documentation
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) - Create tokens

## License

Apache-2.0
