import { z } from 'zod'

import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants.js'
import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

// Zod schemas for R2 operations
const BucketNameSchema = z.string().describe('The name of the R2 bucket')

/**
 * Register R2 bucket management tools
 */
export const registerR2Tools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// List R2 buckets
	server.tool(
		'r2_buckets_list',
		'List R2 buckets in your Cloudflare account',
		{
			cursor: z.string().optional().describe('Cursor for pagination'),
			direction: z.enum(['asc', 'desc']).optional().describe('Direction to order buckets'),
			name_contains: z.string().optional().describe('Filter by bucket name containing this string'),
			per_page: z.number().optional().describe('Number of buckets per page'),
			start_after: z.string().optional().describe('Start listing after this bucket name'),
		},
		async ({ cursor, direction, name_contains, per_page, start_after }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const listResponse = await context.client.r2.buckets.list({
					account_id,
					cursor: cursor ?? undefined,
					direction: direction ?? undefined,
					name_contains: name_contains ?? undefined,
					per_page: per_page ?? undefined,
					start_after: start_after ?? undefined,
				})

				return createToolResult({
					buckets: listResponse.buckets,
					count: listResponse.buckets?.length ?? 0,
				})
			} catch (error) {
				return createErrorResult(error, 'listing R2 buckets')
			}
		}
	)

	// Create R2 bucket
	server.tool(
		'r2_bucket_create',
		'Create a new R2 bucket in your Cloudflare account',
		{ name: BucketNameSchema },
		async ({ name }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const bucket = await context.client.r2.buckets.create({
					account_id,
					name,
				})
				return createToolResult(bucket)
			} catch (error) {
				return createErrorResult(error, 'creating R2 bucket')
			}
		}
	)

	// Get R2 bucket details
	server.tool(
		'r2_bucket_get',
		'Get details about a specific R2 bucket',
		{ name: BucketNameSchema },
		async ({ name }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const bucket = await context.client.r2.buckets.get(name, { account_id })
				return createToolResult(bucket)
			} catch (error) {
				return createErrorResult(error, 'getting R2 bucket')
			}
		}
	)

	// Delete R2 bucket
	server.tool(
		'r2_bucket_delete',
		'Delete an R2 bucket',
		{ name: BucketNameSchema },
		async ({ name }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const result = await context.client.r2.buckets.delete(name, { account_id })
				return createToolResult(result)
			} catch (error) {
				return createErrorResult(error, 'deleting R2 bucket')
			}
		}
	)
}
