import { z } from 'zod'

import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants.js'
import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

// Zod schemas for Workers operations
const WorkerNameSchema = z.string().describe('The name of the worker script')

/**
 * Register Workers management tools
 */
export const registerWorkersTools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// List all workers
	server.tool(
		'workers_list',
		`List all Workers in your Cloudflare account.
If you only need details of a single Worker, use workers_get_worker.`,
		{},
		async () => {
			const accountId = await context.getAccountId()
			if (!accountId) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}

			try {
				const results = await context.client.workers.scripts.list({
					account_id: accountId,
				})

				const workers = (results.result ?? [])
					.map((worker) => ({
						name: worker.id,
						modified_on: worker.modified_on || null,
						created_on: worker.created_on || null,
					}))
					.sort((a, b) => {
						if (!a.created_on) return 1
						if (!b.created_on) return -1
						return new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
					})

				return createToolResult({
					workers,
					count: workers.length,
				})
			} catch (error) {
				return createErrorResult(error, 'listing workers')
			}
		}
	)

	// Get worker script content
	server.tool(
		'workers_get_worker_code',
		'Get the source code of a Cloudflare Worker. Note: This may be a bundled version of the worker.',
		{ scriptName: WorkerNameSchema },
		async ({ scriptName }) => {
			const accountId = await context.getAccountId()
			if (!accountId) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}

			try {
				const scriptContent = await context.client.workers.scripts.get(scriptName, {
					account_id: accountId,
				})
				return createToolResult({ code: scriptContent })
			} catch (error) {
				return createErrorResult(error, 'retrieving worker script')
			}
		}
	)

	// Delete worker
	server.tool(
		'workers_delete',
		'Delete a Worker script from your Cloudflare account',
		{ scriptName: WorkerNameSchema },
		async ({ scriptName }) => {
			const accountId = await context.getAccountId()
			if (!accountId) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}

			try {
				await context.client.workers.scripts.delete(scriptName, {
					account_id: accountId,
				})
				return createToolResult({ success: true, deleted: scriptName })
			} catch (error) {
				return createErrorResult(error, 'deleting worker')
			}
		}
	)
}
