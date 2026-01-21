import { z } from 'zod'

import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants.js'
import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

// Zod schemas for D1 operations
const D1DatabaseIdSchema = z.string().describe('The ID of the D1 database')
const D1DatabaseNameSchema = z.string().describe('The name of the D1 database')
const D1DatabasePrimaryLocationHintSchema = z
	.enum(['wnam', 'enam', 'weur', 'eeur', 'apac', 'oc'])
	.optional()
	.describe('Primary location hint for the database (wnam, enam, weur, eeur, apac, oc)')

/**
 * Register D1 database management tools
 */
export const registerD1Tools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// List D1 databases
	server.tool(
		'd1_databases_list',
		'List all of the D1 databases in your Cloudflare account',
		{
			name: D1DatabaseNameSchema.optional().describe('Filter by database name'),
			page: z.number().optional().describe('Page number'),
			per_page: z.number().optional().describe('Number of results per page'),
		},
		async ({ name, page, per_page }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const listResponse = await context.client.d1.database.list({
					account_id,
					name: name ?? undefined,
					page: page ?? undefined,
					per_page: per_page ?? undefined,
				})

				return createToolResult({
					result: listResponse.result,
					result_info: listResponse.result_info,
				})
			} catch (error) {
				return createErrorResult(error, 'listing D1 databases')
			}
		}
	)

	// Create D1 database
	server.tool(
		'd1_database_create',
		'Create a new D1 database in your Cloudflare account',
		{
			name: D1DatabaseNameSchema,
			primary_location_hint: D1DatabasePrimaryLocationHintSchema,
		},
		async ({ name, primary_location_hint }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const d1Database = await context.client.d1.database.create({
					account_id,
					name,
					primary_location_hint: primary_location_hint ?? undefined,
				})
				return createToolResult(d1Database)
			} catch (error) {
				return createErrorResult(error, 'creating D1 database')
			}
		}
	)

	// Delete D1 database
	server.tool(
		'd1_database_delete',
		'Delete a D1 database in your Cloudflare account',
		{ database_id: D1DatabaseIdSchema },
		async ({ database_id }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const deleteResponse = await context.client.d1.database.delete(database_id, {
					account_id,
				})
				return createToolResult(deleteResponse)
			} catch (error) {
				return createErrorResult(error, 'deleting D1 database')
			}
		}
	)

	// Get D1 database
	server.tool(
		'd1_database_get',
		'Get a D1 database in your Cloudflare account',
		{ database_id: D1DatabaseIdSchema },
		async ({ database_id }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const d1Database = await context.client.d1.database.get(database_id, {
					account_id,
				})
				return createToolResult(d1Database)
			} catch (error) {
				return createErrorResult(error, 'getting D1 database')
			}
		}
	)

	// Query D1 database
	server.tool(
		'd1_database_query',
		'Query a D1 database in your Cloudflare account',
		{
			database_id: D1DatabaseIdSchema,
			sql: z.string().describe('The SQL query to execute'),
			params: z
				.array(z.string())
				.optional()
				.describe('Query parameters for parameterized queries (as strings)'),
		},
		async ({ database_id, sql, params }) => {
			const account_id = await context.getAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const queryResult = await context.client.d1.database.query(database_id, {
					account_id,
					sql,
					params: params ?? undefined,
				})
				return createToolResult(queryResult.result)
			} catch (error) {
				return createErrorResult(error, 'querying D1 database')
			}
		}
	)
}
