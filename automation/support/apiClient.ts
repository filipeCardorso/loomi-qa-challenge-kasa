import type { APIRequestContext, APIResponse } from '@playwright/test';
import { KASA_API_BASE_URL, type GetMatchesParams } from './api-schemas';

/**
 * KasaApiClient — wrapper fino sobre o `request` fixture do Playwright pra
 * conversar com a API DEV pública do kasa.live.
 *
 * Os schemas Zod (contract) ficam em `./api-schemas.ts` — separação intencional
 * pra permitir importar schemas sem acoplar com `@playwright/test` (mocks,
 * scripts CLI, geração de fixtures, etc).
 *
 * Re-exporta tudo de `api-schemas` pra compat com imports antigos.
 */
export * from './api-schemas';

export class KasaApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string = KASA_API_BASE_URL,
  ) {}

  /**
   * GET /match/ com query params arbitrários.
   *
   * Os params booleanos são serializados como `"true"` / `"false"` (string),
   * porque é assim que o frontend kasa.live envia.
   */
  async getMatches(params: GetMatchesParams = {}): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}/match/`, {
      params: this.normalize(params),
    });
  }

  /**
   * GET /team/?name=... typeahead descoberto na Phase 3.
   * Disparado pelo input "Qual time?" da home (sem debounce visível).
   */
  async getTeams(name: string): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}/team/`, {
      params: { name },
    });
  }

  private normalize(params: GetMatchesParams): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      out[k] = typeof v === 'boolean' ? String(v) : String(v);
    }
    return out;
  }
}
