import type { ToolResult } from './types/index.js'

/**
 * Response when account ID is required but not set
 */
export const MISSING_ACCOUNT_ID_RESPONSE: ToolResult = {
	content: [
		{
			type: 'text',
			text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
		},
	],
}
