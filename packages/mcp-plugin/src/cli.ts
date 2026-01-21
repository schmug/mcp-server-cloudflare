#!/usr/bin/env node
/**
 * CLI entry point for the Cloudflare MCP Plugin
 *
 * This can be used directly with MCP clients that support stdio transport.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=xxx npx @cloudflare/mcp-server-cloudflare-plugin
 *
 * Or in your MCP client configuration:
 *   {
 *     "mcpServers": {
 *       "cloudflare": {
 *         "command": "npx",
 *         "args": ["@cloudflare/mcp-server-cloudflare-plugin"],
 *         "env": {
 *           "CLOUDFLARE_API_TOKEN": "your-api-token"
 *         }
 *       }
 *     }
 *   }
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createCloudflareServer } from './index.js'

async function main(): Promise<void> {
	// Get API token from environment
	const apiToken = process.env.CLOUDFLARE_API_TOKEN

	if (!apiToken) {
		console.error('Error: CLOUDFLARE_API_TOKEN environment variable is required')
		console.error('')
		console.error('Usage:')
		console.error('  CLOUDFLARE_API_TOKEN=xxx npx @cloudflare/mcp-server-cloudflare-plugin')
		console.error('')
		console.error('Get your API token at: https://dash.cloudflare.com/profile/api-tokens')
		process.exit(1)
	}

	// Get optional account ID from environment
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

	// Parse enabled categories from environment if provided
	const enabledCategoriesEnv = process.env.CLOUDFLARE_ENABLED_CATEGORIES
	const enabledCategories = enabledCategoriesEnv
		? (enabledCategoriesEnv.split(',').map((s) => s.trim()) as any[])
		: undefined

	// Create the server
	const { server } = createCloudflareServer(
		{
			apiToken,
			accountId,
			enabledCategories,
		},
		{
			name: 'cloudflare-mcp-plugin',
			version: '0.1.0',
		}
	)

	// Create stdio transport
	const transport = new StdioServerTransport()

	// Connect the server to the transport
	await server.connect(transport)

	// Log startup to stderr (stdout is used for MCP communication)
	console.error('Cloudflare MCP Plugin started')
	if (accountId) {
		console.error(`Using account ID: ${accountId}`)
	}
	if (enabledCategories) {
		console.error(`Enabled categories: ${enabledCategories.join(', ')}`)
	}
}

// Run the main function
main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
