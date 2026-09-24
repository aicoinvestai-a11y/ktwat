/**
 * فهرس المهارات — كل بند من الاستمارة له سجل مهارة واحد على الأقل.
 */
import type { Category, DomainId, Skill } from '../types';
import { CATEGORIES, DOMAINS, categoryById } from '../taxonomy';
import { allSourceItems, sourceById } from '../source/inventory';
import { foodSkills, hygieneSkills, clothesSkills, safetySkills, shoppingSkills } from './self-care';
import { languageSkills } from './communication-language';
import { socialSkills } from './communication-social';
import { sensorySkills } from './cognitive-sensory';
import { readingSkills, writingSkills, mathSkills, scienceSkills } from './cognitive-academic';
import { religionSkills } from './religion';
import { fineMotorSkills, grossMotorSkills } from './motor';
import { vocationalPrepSkills, computerSkills } from './vocational';

export const allSkills: Skill[] = [
  ...foodSkills,
  ...hygieneSkills,
  ...clothesSkills,
  ...safetySkills,
  ...shoppingSkills,
  ...languageSkills,
  ...socialSkills,
  ...sensorySkills,
  ...readingSkills,
  ...writingSkills,
  ...mathSkills,
  ...scienceSkills,
  ...religionSkills,
  ...fineMotorSkills,
  ...grossMotorSkills,
  ...vocationalPrepSkills,
  ...computerSkills,
];

export const skillById = Object.fromEntries(allSkills.map((s) => [s.id, s]));

export const skillsOfDomain = (domain: DomainId) =>
  allSkills.filter((s) => s.domain === domain);

export const skillsOfCategory = (categoryId: string) =>
  allSkills.filter((s) => s.category === categoryId);

export const categoriesWithCounts = (): (Category & { count: number })[] =>
  CATEGORIES.map((c) => ({ ...c, count: skillsOfCategory(c.id).length }));

export const supervisedSkills = allSkills.filter((s) => s.supervisorRequired);
export const safetySensitiveSkills = allSkills.filter((s) => s.safetyLevel === 'safety-sensitive');
export const needsReviewSkills = allSkills.filter((s) => s.needsReview);

/** بحث عربي بسيط في النص الأصلي والعنوان والكلمات المفتاحية */
export function searchSkills(query: string, limit = 60): Skill[] {
  const q = query.trim();
  if (!q) return [];
  const normalize = (s: string) =>
    s
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase();
  const nq = normalize(q);
  const words = nq.split(/\s+/).filter(Boolean);
  const scored = allSkills
    .map((s) => {
      const title = normalize(s.childFriendlyTitle);
      const original = normalize(s.originalText);
      const keywords = normalize(s.keywords.join(' '));
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 4;
        if (keywords.includes(w)) score += 3;
        if (original.includes(w)) score += 2;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
  return scored;
}

export { DOMAINS, CATEGORIES, categoryById, allSourceItems, sourceById };
