---
description: Set up Cloudflare authentication and verify MCP server connectivity. Use when first setting up the plugin or troubleshooting connection issues.
---

# Cloudflare Setup

Help the user set up their Cloudflare authentication and verify connectivity to the MCP servers.

## Steps

1. **Check for existing configuration**
   - Look for `CLOUDFLARE_API_TOKEN` environment variable
   - Check if `.env` file exists with the token

2. **Guide API token creation** (if needed)
   - Direct user to: https://dash.cloudflare.com/profile/api-tokens
   - Recommend using "Edit Cloudflare Workers" template for Workers development
   - For full access, suggest creating a custom token with appropriate permissions

3. **Verify connectivity**
   - Use the cloudflare-docs MCP server (no auth required) to verify basic connectivity
   - Test an authenticated server like cloudflare-bindings to verify the token works

4. **Common token scopes needed**
   - `account:read` - List accounts
   - `workers:write` - Deploy and manage Workers
   - `workers_kv:write` - Manage KV namespaces
   - `d1:write` - Manage D1 databases
   - `r2:write` - Manage R2 buckets
   - `workers_scripts:write` - Upload Worker scripts

## Environment Setup

Tell the user to set their token:

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

Or add to `.env` file:
```
CLOUDFLARE_API_TOKEN=your-token-here
```
