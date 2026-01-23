# Cloudflare Claude Plugin

A [Claude Code plugin](https://code.claude.com/docs/en/plugins) for Cloudflare's MCP servers. Choose plugins by workflow - only install what you need.

> This is a community plugin wrapping the [official Cloudflare MCP servers](https://github.com/cloudflare/mcp-server-cloudflare).

## Installation

```bash
# Add the marketplace
/plugin marketplace add schmug/cloudflare-claude-plugin

# Install by workflow (recommended)
/plugin install cloudflare-dev@cloudflare-mcp      # Workers/Pages development
/plugin install cloudflare-docs@cloudflare-mcp     # Documentation (no auth needed)

# Or install everything
/plugin install cloudflare@cloudflare-mcp
```

## Choose Your Workflow

| Plugin | Use Case | MCP Servers | Auth |
|--------|----------|-------------|------|
| `cloudflare-dev` | Workers/Pages development | bindings, builds, observability, containers | Yes |
| `cloudflare-docs` | Learning & reference | docs | **No** |
| `cloudflare-security` | Security operations | radar, casb, auditlogs | Yes |
| `cloudflare-ai` | AI/ML development | ai-gateway, autorag, browser | Yes |
| `cloudflare-analytics` | Deep analytics | graphql, dns-analytics, dex, logs | Yes |
| `cloudflare` | Everything | All 15 servers | Yes |

### What's in each plugin?

**`cloudflare-dev`** - Most developers start here
- **bindings**: KV, R2, D1, Durable Objects, Queues, Hyperdrive
- **builds**: Deploy and manage Workers/Pages
- **observability**: Logs, errors, analytics
- **containers**: Sandbox dev environments

**`cloudflare-docs`** - No API token required
- Search Cloudflare documentation with AI

**`cloudflare-security`** - Security & compliance teams
- **radar**: URL scanning, threat intelligence, traffic insights
- **casb**: SaaS security misconfigurations
- **auditlogs**: Compliance and audit trails

**`cloudflare-ai`** - AI/ML workflows
- **ai-gateway**: Monitor AI API usage and costs
- **autorag**: Search documents in your RAG pipelines
- **browser**: Screenshots, page rendering, web scraping

**`cloudflare-analytics`** - Deep data analysis
- **graphql**: Full Cloudflare GraphQL API access
- **dns-analytics**: DNS query patterns and performance
- **dex**: Digital Experience Monitoring
- **logs**: Logpush job management

## Authentication

```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

### Create an API Token

1. Go to **[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)**
2. Click **Create Token**
3. Choose a template based on your workflow:

| Workflow | Template | Additional Permissions |
|----------|----------|----------------------|
| `cloudflare-dev` | Edit Cloudflare Workers | Workers Tail (Read) |
| `cloudflare-security` | Account Audit Logs (Read) | Radar (Read) |
| `cloudflare-ai` | AI Gateway (Read) | - |
| `cloudflare-analytics` | Account Analytics (Read) | Logs (Read) |

### Full Access (all plugins)

| Permission | Access |
|------------|--------|
| Account > Workers Scripts | Edit |
| Account > Workers KV/R2/D1 | Edit |
| Account > Workers Tail | Read |
| Account > AI Gateway | Read |
| Account > Logs | Edit |
| Account > Audit Logs | Read |
| Zone > DNS | Read |
| Zone > Analytics | Read |

## Skills

Workflow helpers included with the full plugin:

- `/cloudflare:setup` - Configure authentication
- `/cloudflare:deploy-worker` - Deploy Workers
- `/cloudflare:debug-worker` - Troubleshoot issues
- `/cloudflare:analyze-traffic` - Radar analysis

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
    "cloudflare-dev@cloudflare-mcp": true
  }
}
```

## Troubleshooting

**High context usage?** Install only the workflow plugin you need instead of `cloudflare` (all).

**"Response interrupted"?** Be more specific in queries, or break into smaller steps.

**Auth errors?** Check `CLOUDFLARE_API_TOKEN` is set and has required permissions.

## Links

- [Upstream MCP Servers](https://github.com/cloudflare/mcp-server-cloudflare)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)

## License

Apache-2.0
