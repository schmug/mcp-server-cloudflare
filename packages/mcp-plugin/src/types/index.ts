import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type Cloudflare from 'cloudflare'

/**
 * Configuration options for the Cloudflare MCP Plugin
 */
export interface CloudflarePluginConfig {
	/**
	 * Cloudflare API token for authentication.
	 * Get one at https://dash.cloudflare.com/profile/api-tokens
	 */
	apiToken: string

	/**
	 * Optional account ID to use for API calls.
	 * If not provided, tools will use the first available account
	 * or require explicit account selection.
	 */
	accountId?: string

	/**
	 * Enable specific tool categories. If not specified, all tools are enabled.
	 */
	enabledCategories?: ToolCategory[]

	/**
	 * Disable specific tool categories.
	 */
	disabledCategories?: ToolCategory[]
}

/**
 * Tool categories available in the plugin
 */
export type ToolCategory =
	| 'accounts'
	| 'workers'
	| 'kv'
	| 'r2'
	| 'd1'
	| 'hyperdrive'
	| 'zones'
	| 'radar'
	| 'url-scanner'
	| 'browser'
	| 'ai-gateway'
	| 'workers-builds'
	| 'workers-observability'
	| 'auditlogs'
	| 'logpush'
	| 'dns-analytics'
	| 'graphql'
	| 'autorag'
	| 'casb'
	| 'dex'

/**
 * Context object passed to all tool handlers
 */
export interface PluginContext {
	/**
	 * Cloudflare SDK client instance
	 */
	client: Cloudflare

	/**
	 * The API token being used
	 */
	apiToken: string

	/**
	 * Get the current active account ID
	 */
	getAccountId(): Promise<string | null>

	/**
	 * Set the active account ID
	 */
	setAccountId(accountId: string): void

	/**
	 * Get accounts list (cached after first call)
	 */
	getAccounts(): Promise<Array<{ id: string; name: string }>>
}

/**
 * Tool registration function type
 */
export type ToolRegistrar = (server: McpServer, context: PluginContext) => void

/**
 * Plugin metadata
 */
export interface PluginInfo {
	name: string
	version: string
	description: string
	categories: ToolCategory[]
}

/**
 * Tool result type for MCP tools - uses SDK's CallToolResult type
 */
export type ToolResult = CallToolResult

/**
 * Helper to create a successful tool result
 */
export function createToolResult(data: unknown): ToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(data),
			},
		],
	}
}

/**
 * Helper to create an error tool result
 */
export function createErrorResult(error: unknown, context: string): ToolResult {
	const message = error instanceof Error ? error.message : String(error)
	return {
		content: [
			{
				type: 'text',
				text: `Error ${context}: ${message}`,
			},
		],
	}
}
