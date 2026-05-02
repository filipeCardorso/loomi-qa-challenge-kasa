import { faker } from '@faker-js/faker';

/**
 * TestDataFactory — gera dados sintéticos pra testes (nomes de times genéricos,
 * strings de busca, etc). Usado por fixtures e testes E2E.
 *
 * Mantido simples por design — para credenciais reais use process.env.
 */
export class TestDataFactory {
  randomTeamName(): string {
    return `${faker.location.city()} FC`;
  }

  randomChampionship(): string {
    return faker.helpers.arrayElement(['MLS', 'Premier League', 'Brasileirão', 'La Liga']);
  }

  randomEmail(): string {
    return faker.internet.email().toLowerCase();
  }

  randomPassword(): string {
    return faker.internet.password({ length: 16, memorable: false });
  }

  /** String inócua que dificilmente bate com nome real. */
  unmatchedSearchTerm(): string {
    return `nonexistent_${faker.string.alphanumeric(10)}`;
  }
}

export const testDataFactory = new TestDataFactory();
