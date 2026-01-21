/**
 * Tool registration modules for Cloudflare MCP Plugin
 */

export { registerAccountTools } from './accounts.js'
export { registerD1Tools } from './d1.js'
export { registerKVTools } from './kv.js'
export { registerR2Tools } from './r2.js'
export { registerWorkersTools } from './workers.js'
export { registerZoneTools } from './zones.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolCategory, ToolRegistrar } from '../types/index.js'

import { registerAccountTools } from './accounts.js'
import { registerD1Tools } from './d1.js'
import { registerKVTools } from './kv.js'
import { registerR2Tools } from './r2.js'
import { registerWorkersTools } from './workers.js'
import { registerZoneTools } from './zones.js'

/**
 * Map of tool category to registrar function
 */
export const toolRegistrars: Record<ToolCategory, ToolRegistrar> = {
	accounts: registerAccountTools,
	workers: registerWorkersTools,
	kv: registerKVTools,
	r2: registerR2Tools,
	d1: registerD1Tools,
	hyperdrive: () => {}, // Placeholder
	zones: registerZoneTools,
	radar: () => {}, // Placeholder - advanced tools
	'url-scanner': () => {}, // Placeholder
	browser: () => {}, // Placeholder
	'ai-gateway': () => {}, // Placeholder
	'workers-builds': () => {}, // Placeholder
	'workers-observability': () => {}, // Placeholder
	auditlogs: () => {}, // Placeholder
	logpush: () => {}, // Placeholder
	'dns-analytics': () => {}, // Placeholder
	graphql: () => {}, // Placeholder
	autorag: () => {}, // Placeholder
	casb: () => {}, // Placeholder
	dex: () => {}, // Placeholder
}

/**
 * Default categories to enable when none are specified
 */
export const defaultCategories: ToolCategory[] = [
	'accounts',
	'workers',
	'kv',
	'r2',
	'd1',
	'zones',
]

/**
 * Register all tools from specified categories
 */
export function registerTools(
	server: McpServer,
	context: PluginContext,
	options: {
		enabledCategories?: ToolCategory[]
		disabledCategories?: ToolCategory[]
	} = {}
): void {
	const { enabledCategories, disabledCategories = [] } = options

	// Determine which categories to enable
	const categories = enabledCategories ?? defaultCategories

	// Filter out disabled categories
	const activeCategories = categories.filter(
		(category) => !disabledCategories.includes(category)
	)

	// Register tools for each active category
	for (const category of activeCategories) {
		const registrar = toolRegistrars[category]
		if (registrar) {
			registrar(server, context)
		}
	}
}
