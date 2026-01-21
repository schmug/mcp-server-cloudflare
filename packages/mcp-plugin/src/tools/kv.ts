import { z } from 'zod'

import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants.js'
import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

// Zod schemas for KV operations
const KvNamespaceIdSchema = z.string().describe('The ID of the KV namespace')
const KvNamespaceTitleSchema = z
	.string()
	.describe('The human-readable name/title of the KV namespace')

const KvNamespacesListParamsSchema = z
	.object({
		direction: z
			.enum(['asc', 'desc'])
			.optional()
			.describe('Direction to order namespaces (asc/desc)'),
		order: z.enum(['id', 'title']).optional().describe('Field to order namespaces by (id/title)'),
		page: z.number().int().positive().optional().describe('Page number of results (starts at 1)'),
		per_page: z
			.number()
			.int()
			.min(1)
			.max(100)
			.optional()
			.describe('Number of namespaces per page (1-100)'),
	})
	.optional()

/**
 * Register KV namespace management tools
 */
export const registerKVTools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// List KV namespaces
	server.tool(
		'kv_namespaces_list',
		`List all of the KV namespaces in your Cloudflare account.
Returns a list of KV namespaces with id and title properties.`,
		{ params: KvNamespacesListParamsSchema },
		async ({ params }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const response = await context.client.kv.namespaces.list({
					account_id,
					...params,
				})

				const namespaces = (response.result ?? []).map((ns) => ({
					id: ns.id,
					title: ns.title,
				}))

				return createToolResult({
					namespaces,
					count: namespaces.length,
				})
			} catch (error) {
				return createErrorResult(error, 'listing KV namespaces')
			}
		}
	)

	// Create KV namespace
	server.tool(
		'kv_namespace_create',
		'Create a new KV namespace in your Cloudflare account',
		{ title: KvNamespaceTitleSchema },
		async ({ title }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespace = await context.client.kv.namespaces.create({
					account_id,
					title,
				})
				return createToolResult(namespace)
			} catch (error) {
				return createErrorResult(error, 'creating KV namespace')
			}
		}
	)

	// Delete KV namespace
	server.tool(
		'kv_namespace_delete',
		'Delete a KV namespace in your Cloudflare account',
		{ namespace_id: KvNamespaceIdSchema },
		async ({ namespace_id }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const result = await context.client.kv.namespaces.delete(namespace_id, {
					account_id,
				})
				return createToolResult(result ?? { success: true })
			} catch (error) {
				return createErrorResult(error, 'deleting KV namespace')
			}
		}
	)

	// Get KV namespace details
	server.tool(
		'kv_namespace_get',
		`Get details of a KV namespace in your Cloudflare account.
Returns id, title, supports_url_encoding, and beta properties.`,
		{ namespace_id: KvNamespaceIdSchema },
		async ({ namespace_id }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespace = await context.client.kv.namespaces.get(namespace_id, {
					account_id,
				})
				return createToolResult(namespace)
			} catch (error) {
				return createErrorResult(error, 'getting KV namespace')
			}
		}
	)

	// Update KV namespace
	server.tool(
		'kv_namespace_update',
		'Update the title of a KV namespace in your Cloudflare account',
		{
			namespace_id: KvNamespaceIdSchema,
			title: KvNamespaceTitleSchema,
		},
		async ({ namespace_id, title }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const result = await context.client.kv.namespaces.update(namespace_id, {
					account_id,
					title,
				})
				return createToolResult(result ?? { success: true })
			} catch (error) {
				return createErrorResult(error, 'updating KV namespace')
			}
		}
	)
}
