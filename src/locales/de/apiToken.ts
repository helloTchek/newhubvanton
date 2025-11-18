export const apiToken = {
  title: 'API Tokens',
  singular: 'API Token',
  fields: {
    name: 'Token Name',
    token: 'Token',
    scope: 'Scope',
    expiresAt: 'Expires At',
    createdAt: 'Created At',
    lastUsed: 'Last Used',
    status: 'Status',
  },
  actions: {
    createToken: 'Create Token',
    revokeToken: 'Revoke Token',
    regenerateToken: 'Regenerate Token',
    copyToken: 'Copy Token',
  },
  messages: {
    noTokens: 'No API tokens found',
    tokenCreated: 'API token created successfully',
    tokenRevoked: 'API token revoked successfully',
    tokenCopied: 'Token copied to clipboard',
    tokenWarning: 'Store this token securely. You won\'t be able to see it again.',
  },
  scopes: {
    read: 'Read',
    write: 'Write',
    delete: 'Delete',
    admin: 'Admin',
  },
} as const;
