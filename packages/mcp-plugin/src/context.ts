import Cloudflare from 'cloudflare'

import type { CloudflarePluginConfig, PluginContext } from './types/index.js'

/**
 * Creates a plugin context with Cloudflare API client and account management
 */
export function createPluginContext(config: CloudflarePluginConfig): PluginContext {
	// Create Cloudflare client with API token
	const client = new Cloudflare({
		apiToken: config.apiToken,
	})

	// State for account management
	let activeAccountId: string | null = config.accountId ?? null
	let cachedAccounts: Array<{ id: string; name: string }> | null = null

	const context: PluginContext = {
		client,
		apiToken: config.apiToken,

		async getAccountId(): Promise<string | null> {
			// Return explicit account ID if set
			if (activeAccountId) {
				return activeAccountId
			}

			// Try to auto-select first account
			const accounts = await context.getAccounts()
			if (accounts.length === 1) {
				activeAccountId = accounts[0].id
				return activeAccountId
			}

			return null
		},

		setAccountId(accountId: string): void {
			activeAccountId = accountId
		},

		async getAccounts(): Promise<Array<{ id: string; name: string }>> {
			if (cachedAccounts) {
				return cachedAccounts
			}

			const accounts: Array<{ id: string; name: string }> = []

			// Fetch all accounts with pagination
			for await (const account of client.accounts.list()) {
				accounts.push({
					id: account.id,
					name: account.name,
				})
			}

			// Sort by created date (newest first) if available, otherwise by name
			accounts.sort((a, b) => a.name.localeCompare(b.name))

			cachedAccounts = accounts
			return accounts
		},
	}

	return context
}

/**
 * Creates a Cloudflare API client from an access token
 */
export function getCloudflareClient(apiToken: string): Cloudflare {
	return new Cloudflare({
		apiToken,
	})
}
