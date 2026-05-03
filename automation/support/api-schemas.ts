import { z } from 'zod';

/**
 * Schemas Zod do contrato (observado) da API DEV pública do kasa.live.
 *
 * Os endpoints conhecidos foram descobertos empiricamente durante a
 * exploração da Phase 3 (ver `docs/exploration-notes.md`). Os schemas aqui
 * documentam o contrato observado e servem como contract tests — qualquer
 * mudança breaking no shape será detectada pelos `safeParse` dos specs.
 *
 * Separação de schemas vs cliente HTTP é proposital: schemas podem ser
 * importados sem trazer junto a dependência de `@playwright/test` (útil pra
 * mocks Vitest, scripts CLI, geração de fixtures, etc).
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

export type Match = z.infer<typeof matchSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Channel = z.infer<typeof channelSchema>;
export type Championship = z.infer<typeof championshipSchema>;
