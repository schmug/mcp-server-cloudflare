/**
 * Cloudflare MCP Plugin
 *
 * A plugin that exposes Cloudflare tools for use with any MCP server.
 *
 * @example Basic usage with MCP SDK
 * ```typescript
 * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
 * import { registerCloudflareTools } from '@cloudflare/mcp-server-cloudflare-plugin'
 *
 * const server = new McpServer({ name: 'my-server', version: '1.0.0' })
 *
 * registerCloudflareTools(server, {
 *   apiToken: process.env.CLOUDFLARE_API_TOKEN!,
 *   accountId: process.env.CLOUDFLARE_ACCOUNT_ID, // optional
 * })
 * ```
 *
 * @example Selective tool registration
 * ```typescript
 * registerCloudflareTools(server, {
 *   apiToken: process.env.CLOUDFLARE_API_TOKEN!,
 *   enabledCategories: ['workers', 'kv', 'd1'], // only these tools
 * })
 * ```
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { createPluginContext } from './context.js'
import { defaultCategories, registerTools, toolRegistrars } from './tools/index.js'

import type { CloudflarePluginConfig, PluginContext, PluginInfo, ToolCategory } from './types/index.js'

// Re-export types
export type {
	CloudflarePluginConfig,
	PluginContext,
	PluginInfo,
	ToolCategory,
	ToolRegistrar,
	ToolResult,
} from './types/index.js'

// Re-export utilities
export { createToolResult, createErrorResult } from './types/index.js'
export { createPluginContext, getCloudflareClient } from './context.js'

// Re-export individual tool registrars for selective use
export {
	registerAccountTools,
	registerD1Tools,
	registerKVTools,
	registerR2Tools,
	registerWorkersTools,
	registerZoneTools,
	toolRegistrars,
	defaultCategories,
} from './tools/index.js'

/**
 * Plugin information
 */
export const pluginInfo: PluginInfo = {
	name: '@cloudflare/mcp-server-cloudflare-plugin',
	version: '0.1.0',
	description: 'Cloudflare MCP tools as a plugin for any MCP server',
	categories: Object.keys(toolRegistrars) as ToolCategory[],
}

/**
 * Register all Cloudflare tools with an MCP server
 *
 * @param server - The MCP server instance to register tools with
 * @param config - Configuration including API token and optional settings
 * @returns The plugin context for advanced usage
 *
 * @example
 * ```typescript
 * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
 * import { registerCloudflareTools } from '@cloudflare/mcp-server-cloudflare-plugin'
 *
 * const server = new McpServer({ name: 'my-server', version: '1.0.0' })
 *
 * const context = registerCloudflareTools(server, {
 *   apiToken: process.env.CLOUDFLARE_API_TOKEN!,
 * })
 * ```
 */
export function registerCloudflareTools(
	server: McpServer,
	config: CloudflarePluginConfig
): PluginContext {
	const context = createPluginContext(config)

	registerTools(server, context, {
		enabledCategories: config.enabledCategories,
		disabledCategories: config.disabledCategories,
	})

	return context
}

/**
 * Create a fully configured MCP server with Cloudflare tools
 *
 * @param config - Configuration including API token and optional settings
 * @param serverOptions - Optional MCP server configuration
 * @returns Object containing the server and context
 *
 * @example
 * ```typescript
 * import { createCloudflareServer } from '@cloudflare/mcp-server-cloudflare-plugin'
 * import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
 *
 * const { server } = createCloudflareServer({
 *   apiToken: process.env.CLOUDFLARE_API_TOKEN!,
 * })
 *
 * const transport = new StdioServerTransport()
 * await server.connect(transport)
 * ```
 */
export function createCloudflareServer(
	config: CloudflarePluginConfig,
	serverOptions?: {
		name?: string
		version?: string
	}
): { server: McpServer; context: PluginContext } {
	const server = new McpServer({
		name: serverOptions?.name ?? 'cloudflare-mcp-server',
		version: serverOptions?.version ?? '0.1.0',
	})

	const context = registerCloudflareTools(server, config)

	return { server, context }
}

/**
 * Default export for convenience
 */
export default {
	registerCloudflareTools,
	createCloudflareServer,
	pluginInfo,
}
