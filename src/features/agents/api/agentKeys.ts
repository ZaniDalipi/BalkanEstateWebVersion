export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  properties: (agentId: string) => [...agentKeys.detail(agentId), 'properties'] as const,
  stats: (agentId: string) => [...agentKeys.detail(agentId), 'stats'] as const,
  teamMembers: (agencyId: string) => [...agentKeys.all, 'team', agencyId] as const,
};
