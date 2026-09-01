import type {
  Locale,
  Localized,
  RouteCandidate,
  RouteTrace,
  SkillContract,
  Taxonomy,
  TaxonomyNode
} from "./types.js";

export interface RouteOptions {
  locale?: string;
  categoryLimit?: number;
  atomLimit?: number;
  ambiguityDelta?: number;
}

const WORD_PATTERN = /[\p{L}\p{N}]+/gu;

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).match(WORD_PATTERN) ?? []);
}

function localeChain(locale: string): string[] {
  const base = locale.split("-")[0] ?? locale;
  return [...new Set([locale, base, "en"])];
}

function localizedValues<T>(value: Localized<T> | undefined, locale: string): T[] {
  if (!value) return [];
  const values: T[] = [];
  for (const candidate of localeChain(locale)) {
    const localized = value[candidate as Locale];
    if (localized !== undefined && !values.includes(localized)) values.push(localized);
  }
  return values;
}

function phraseMatches(prompt: string, promptTokens: Set<string>, phrase: string): boolean {
  const normalizedPhrase = normalize(phrase);
  if (prompt.includes(normalizedPhrase)) return true;
  const phraseTokens = [...tokens(normalizedPhrase)];
  if (phraseTokens.length === 0) return false;
  const overlap = phraseTokens.filter((token) => promptTokens.has(token)).length;
  return overlap / phraseTokens.length >= 0.75;
}

function positiveTriggerScore(prompt: string, promptTokens: Set<string>, phrase: string): number {
  const normalizedPhrase = normalize(phrase);
  if (prompt.includes(normalizedPhrase)) return 8;
  const phraseTokens = [...tokens(normalizedPhrase)];
  if (phraseTokens.length === 0) return 0;
  const overlap = phraseTokens.filter((token) => promptTokens.has(token)).length / phraseTokens.length;
  return overlap >= 0.75 ? 4 * overlap : 0;
}

function lexicalScore(promptTokens: Set<string>, values: string[]): number {
  let score = 0;
  for (const value of values) {
    const valueTokens = [...tokens(value)];
    if (valueTokens.length === 0) continue;
    const overlap = valueTokens.filter((token) => promptTokens.has(token)).length;
    score += Math.min(2, overlap / valueTokens.length);
  }
  return score;
}

function sortCandidates(candidates: RouteCandidate[]): RouteCandidate[] {
  return candidates.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function scoreCategory(prompt: string, promptTokens: Set<string>, node: TaxonomyNode, locale: string): RouteCandidate {
  let score = 0;
  const matched: string[] = [];
  const penalties: string[] = [];
  const keywords = localizedValues(node.keywords, locale).flat();

  for (const keyword of keywords) {
    if (phraseMatches(prompt, promptTokens, keyword)) {
      score += 3;
      matched.push(`keyword:${keyword}`);
    }
  }

  const labels = localizedValues(node.label, locale);
  score += lexicalScore(promptTokens, [...labels, ...node.includes]);

  for (const exclusion of node.excludes) {
    if (phraseMatches(prompt, promptTokens, exclusion)) {
      score -= 4;
      penalties.push(`exclusion:${exclusion}`);
    }
  }

  return { id: node.id, score: Number(score.toFixed(4)), matched, penalties };
}

function scoreContract(
  prompt: string,
  promptTokens: Set<string>,
  contract: SkillContract,
  locale: string,
  categoryScores: Map<string, number>
): RouteCandidate {
  let score = Math.max(0, categoryScores.get(contract.taxonomy.primaryCategory) ?? 0) * 0.2;
  const matched: string[] = [];
  const penalties: string[] = [];

  for (const triggerList of localizedValues(contract.routing.positiveTriggers, locale)) {
    for (const trigger of triggerList) {
      const triggerScore = positiveTriggerScore(prompt, promptTokens, trigger);
      if (triggerScore > 0) {
        score += triggerScore;
        matched.push(`positive:${trigger}`);
      }
    }
  }

  const descriptiveValues = [
    ...localizedValues(contract.name, locale),
    ...localizedValues(contract.summary, locale),
    ...contract.outcomes,
    ...contract.artifacts
  ];
  score += lexicalScore(promptTokens, descriptiveValues);

  for (const triggerList of localizedValues(contract.routing.negativeTriggers, locale)) {
    for (const trigger of triggerList) {
      if (phraseMatches(prompt, promptTokens, trigger)) {
        score -= 6;
        penalties.push(`negative:${trigger}`);
      }
    }
  }

  return { id: contract.id, score: Number(score.toFixed(4)), matched, penalties };
}

export function detectLocale(prompt: string): string {
  return /[\u3400-\u9fff]/u.test(prompt) ? "zh-CN" : "en";
}

export function routeRequest(
  rawPrompt: string,
  taxonomy: Taxonomy,
  contracts: SkillContract[],
  options: RouteOptions = {}
): RouteTrace {
  const prompt = normalize(rawPrompt);
  const promptTokens = tokens(prompt);
  const locale = options.locale ?? detectLocale(rawPrompt);
  const categoryLimit = options.categoryLimit ?? 3;
  const atomLimit = options.atomLimit ?? 5;
  const ambiguityDelta = options.ambiguityDelta ?? 4;

  const allCategories = sortCandidates(
    taxonomy.nodes.map((node) => scoreCategory(prompt, promptTokens, node, locale))
  );
  const categoryScores = new Map(allCategories.map((candidate) => [candidate.id, candidate.score]));
  const allAtoms = sortCandidates(
    contracts
      .filter((contract) => contract.kind === "atom")
      .map((contract) => scoreContract(prompt, promptTokens, contract, locale, categoryScores))
  );
  const special = sortCandidates(
    contracts
      .filter((contract) => contract.kind === "meta")
      .map((contract) => scoreContract(prompt, promptTokens, contract, locale, categoryScores))
  );

  const first = allCategories[0];
  const second = allCategories[1];
  const ambiguous =
    first === undefined ||
    first.score <= 0 ||
    (second !== undefined && second.score > 0 && first.score - second.score <= ambiguityDelta);

  return {
    prompt: rawPrompt,
    locale,
    categories: allCategories.slice(0, categoryLimit),
    atoms: allAtoms.slice(0, atomLimit),
    special: special.slice(0, atomLimit),
    ambiguous
  };
}
