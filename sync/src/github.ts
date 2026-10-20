// A thin GitHub API client: GraphQL and REST over fetch. No retry, no pagination, no logging.
export interface GraphQLError { message: string; type?: string; path?: (string | number)[] }
export interface GitHubClient {
  graphql<T>(query: string, variables: Record<string, unknown>): Promise<{ data: T; errors: GraphQLError[] }>;
  request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T>;
}

const BASE = 'https://api.github.com';

export function createClient(token: string, fetchImpl: typeof fetch = fetch): GitHubClient {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'wcpos-roadmap-sync',
  };

  async function send(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<unknown> {
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      init.headers = { ...headers, 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }
    const res = await fetchImpl(`${BASE}${path}`, init);
    // The message names the call only, never the response body (it may hold issue text).
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
    return res.json();
  }

  return {
    async graphql<T>(query: string, variables: Record<string, unknown>) {
      const json = (await send('POST', '/graphql', { query, variables })) as { data?: unknown; errors?: GraphQLError[] } | null;
      if (json === null || typeof json !== 'object' || json.data === null || typeof json.data !== 'object') {
        throw new Error('POST /graphql: no data');
      }
      return { data: json.data as T, errors: Array.isArray(json.errors) ? json.errors : [] };
    },
    async request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown) {
      return (await send(method, path, body)) as T;
    },
  };
}
