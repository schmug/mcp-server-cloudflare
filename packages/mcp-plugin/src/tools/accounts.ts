import { z } from 'zod'

import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

/**
 * Register account management tools
 */
export const registerAccountTools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// Tool to list all accounts
	server.tool(
		'accounts_list',
		'List all accounts in your Cloudflare account',
		{},
		async () => {
			try {
				const accounts = await context.getAccounts()
				return createToolResult({
					accounts,
					count: accounts.length,
				})
			} catch (e) {
				return createErrorResult(e, 'listing accounts')
			}
		}
	)

	// Tool to set active account
	server.tool(
		'set_active_account',
		'Set active account to be used for tool calls that require accountId',
		{
			accountId: z
				.string()
				.describe(
					'The accountId present in the users Cloudflare account, that should be the active accountId.'
				),
		},
		async ({ accountId }) => {
			try {
				context.setAccountId(accountId)
				return createToolResult({
					activeAccountId: accountId,
				})
			} catch (e) {
				return createErrorResult(e, 'setting active account')
			}
		}
	)

	// Tool to get current active account
	server.tool(
		'get_active_account',
		'Get the currently active account ID being used for API calls',
		{},
		async () => {
			try {
				const accountId = await context.getAccountId()
				return createToolResult({
					activeAccountId: accountId,
					isSet: accountId !== null,
				})
			} catch (e) {
				return createErrorResult(e, 'getting active account')
			}
		}
	)
}
