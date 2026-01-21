---
description: Debug and troubleshoot Cloudflare Workers issues. Use when a Worker is throwing errors, performing slowly, or behaving unexpectedly.
---

# Debug Cloudflare Worker

Help the user diagnose and fix issues with their Cloudflare Workers.

## Diagnostic Workflow

1. **Gather context**
   - Ask for the Worker name and environment
   - Ask about the symptoms (errors, slow response, unexpected behavior)
   - Get the approximate time range when issues started

2. **Check observability data**
   - Use cloudflare-observability MCP tools to query recent logs
   - Look for error patterns, exceptions, and stack traces
   - Check request/response metrics for anomalies

3. **Analyze error patterns**
   - Group errors by type and frequency
   - Identify if errors are related to:
     - Code issues (exceptions, type errors)
     - External dependencies (API calls, database queries)
     - Resource limits (CPU, memory, subrequests)
     - Configuration issues (bindings, environment variables)

4. **Check bindings and dependencies**
   - Use cloudflare-bindings to verify KV, R2, D1 connectivity
   - Check if any bound services are experiencing issues
   - Verify environment variables are set correctly

5. **Performance analysis** (if slow responses)
   - Check CPU time and wall time metrics
   - Look for slow external API calls
   - Identify any blocking operations

6. **Recommend fixes**
   - Provide specific code changes if issues are identified
   - Suggest configuration updates if needed
   - Recommend monitoring setup to catch future issues

## Common Issues to Check

- Unhandled promise rejections
- KV/R2/D1 connection timeouts
- Exceeded CPU limits
- Invalid response formats
- CORS configuration issues
- Environment variable misconfigurations
