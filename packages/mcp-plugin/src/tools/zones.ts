import { z } from 'zod'

import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants.js'
import { createErrorResult, createToolResult } from '../types/index.js'

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { PluginContext, ToolRegistrar } from '../types/index.js'

/**
 * Register Zone management tools
 */
export const registerZoneTools: ToolRegistrar = (
	server: McpServer,
	context: PluginContext
): void => {
	// List all zones
	server.tool(
		'zones_list',
		'List all zones under a Cloudflare account',
		{
			name: z.string().optional().describe('Filter zones by name'),
			status: z
				.string()
				.optional()
				.describe('Filter zones by status (active, pending, initializing, moved, deleted, deactivated, read only)'),
			page: z.number().min(1).default(1).optional().describe('Page number for pagination'),
			per_page: z.number().min(5).max(1000).default(50).optional().describe('Number of zones per page'),
			order: z.enum(['name', 'status', 'account.name']).default('name').optional().describe('Field to order results by'),
			direction: z.enum(['asc', 'desc']).default('desc').optional().describe('Direction to order results'),
		},
		async ({ name, status, page, per_page, order, direction }) => {
			const accountId = await context.getAccountId()
			if (!accountId) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}

			try {
				const response = await context.client.zones.list({
					account: { id: accountId },
					name: name ?? undefined,
					status: status as 'active' | 'pending' | undefined ?? undefined,
					page: page ?? 1,
					per_page: per_page ?? 50,
					order: order ?? 'name',
					direction: direction ?? 'desc',
				})

				const zones = (response.result ?? []).map((zone) => ({
					id: zone.id,
					name: zone.name,
					status: zone.status,
					paused: zone.paused,
					type: zone.type,
					development_mode: zone.development_mode,
					name_servers: zone.name_servers,
					created_on: zone.created_on,
					modified_on: zone.modified_on,
				}))

				return createToolResult({
					zones,
					count: zones.length,
					page: page ?? 1,
					per_page: per_page ?? 50,
					accountId,
				})
			} catch (error) {
				return createErrorResult(error, 'listing zones')
			}
		}
	)

	// Get zone details
	server.tool(
		'zone_details',
		'Get details for a specific Cloudflare zone',
		{
			zoneId: z.string().describe('The ID of the zone to get details for'),
		},
		async ({ zoneId }) => {
			const accountId = await context.getAccountId()
			if (!accountId) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}

			try {
				const response = await context.client.zones.get({ zone_id: zoneId })
				return createToolResult({ zone: response })
			} catch (error) {
				return createErrorResult(error, 'fetching zone details')
			}
		}
	)

	// List DNS records for a zone
	server.tool(
		'zone_dns_records_list',
		'List DNS records for a specific Cloudflare zone',
		{
			zoneId: z.string().describe('The ID of the zone'),
			type: z.string().optional().describe('Filter by record type (A, AAAA, CNAME, TXT, MX, etc.)'),
			page: z.number().min(1).default(1).optional().describe('Page number'),
			per_page: z.number().min(5).max(1000).default(50).optional().describe('Records per page'),
		},
		async ({ zoneId, type, page, per_page }) => {
			try {
				const response = await context.client.dns.records.list({
					zone_id: zoneId,
					type: type as 'A' | 'AAAA' | 'CNAME' | undefined,
					page: page ?? 1,
					per_page: per_page ?? 50,
				})

				return createToolResult({
					records: response.result,
					count: response.result?.length ?? 0,
				})
			} catch (error) {
				return createErrorResult(error, 'listing DNS records')
			}
		}
	)
}
