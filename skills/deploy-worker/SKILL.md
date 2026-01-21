---
description: Deploy a Cloudflare Worker to production. Use when the user wants to deploy, publish, or ship their Worker code.
---

# Deploy Cloudflare Worker

Help the user deploy their Cloudflare Worker to production using the MCP tools.

## Workflow

1. **Verify the project structure**
   - Check for `wrangler.toml` or `wrangler.jsonc` configuration
   - Identify the main entry point file
   - Check for any environment-specific configurations

2. **Pre-deployment checks**
   - Use cloudflare-bindings tools to verify account access
   - Check if the Worker name already exists (update vs create)
   - Verify any required bindings (KV, R2, D1, etc.) exist

3. **Build verification** (if applicable)
   - If using TypeScript, ensure build completes successfully
   - Check for any type errors or linting issues

4. **Deploy the Worker**
   - Use the cloudflare-builds MCP server to trigger deployment
   - Monitor the build status
   - Report success or failure with relevant details

5. **Post-deployment verification**
   - Use cloudflare-observability to check for any immediate errors
   - Verify the Worker is responding correctly
   - Check deployment logs for any warnings

## Important Notes

- Always confirm the target environment (production, staging, preview) before deploying
- Warn about any breaking changes detected in bindings
- Suggest running tests before deployment if test files are present
