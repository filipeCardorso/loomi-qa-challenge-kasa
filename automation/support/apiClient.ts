import type { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';

/**
 * KasaApiClient — wrapper fino sobre o `request` fixture do Playwright pra
 * conversar com a API DEV pública do kasa.live.
 *
 * Base URL: https://kasa-live.api.dev.loomi.com.br/api/1.0
 *
 * Os endpoints conhecidos foram descobertos empiricamente durante a
 * exploração da Phase 3 (ver `docs/exploration-notes.md`). Schemas Zod aqui
 * documentam o contrato observado e servem como contract tests — qualquer
 * mudança breaking no shape será detectada pelos `safeParse` dos specs.
 */
export const KASA_API_BASE_URL = 'https://kasa-live.api.dev.loomi.com.br/api/1.0';

/**
 * Status enum textual — empiricamente a API retorna `Ended` capitalizado
 * ("Ended" / "Not Started" / "In Play"), embora aceite o filtro em maiúsculas
 * (`?status=ENDED`). Documentado como bug menor em `bug-reports/`.
 */
export const matchStatusSchema = z.string().min(1);

export const channelSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    is_active: z.boolean().optional(),
    watch_link: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    custom_name: z.string().nullable().optional(),
  })
  .passthrough();

export const teamSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    custom_name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

export const championshipSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    custom_name: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
  })
  .passthrough();

export const matchSchema = z
  .object({
    id: z.number(),
    status: matchStatusSchema,
    datetime: z.string().nullable().optional(),
    team_a: teamSchema.nullable().optional(),
    team_b: teamSchema.nullable().optional(),
    championship: championshipSchema.nullable().optional(),
    channels: z.array(channelSchema).optional(),
    team_a_score: z.number().nullable().optional(),
    team_b_score: z.number().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

/**
 * Envelope paginado padrão do DRF (Django REST Framework): `count`, `next`,
 * `previous`, `results`. A API kasa.live também adiciona `current_page`.
 */
export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(item),
      current_page: z.number().optional(),
    })
    .passthrough();

export const matchListResponseSchema = paginatedSchema(matchSchema);
export const teamListResponseSchema = paginatedSchema(teamSchema);

export type MatchStatus = 'ENDED' | 'NOTSTARTED' | 'INPLAY';

export interface GetMatchesParams {
  status?: MatchStatus;
  with_channel?: boolean;
  page?: number;
  ordering?: 'ASC' | 'DESC';
  date_start?: string;
  date?: string;
  trending?: boolean;
}

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
