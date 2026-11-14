/**
 * Turns stored facts into fit-score inputs with human-readable evidence.
 * Pure functions: no DB, no AI. Every evidence string cites real numbers or names.
 */
import { GEOGRAPHY, WOMEN_KEYWORDS } from "@/config/scoring";
import {
  accessScore,
  geographyScore,
  govGeographyScore,
  historyScore,
  keywordScore,
  missionScore,
  womenScore,
} from "@/lib/scoring/components";
import { foundationGates, governmentGates } from "@/lib/scoring/gates";
import type { ComponentResult, FitInput } from "@/lib/scoring/types";
import { normalizeOrgName } from "@/lib/irs/normalize";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const MAX_KEYWORDS_SHOWN = 3;

function comp(score: number | null, evidence: string | null, sourceUrl: string | null): ComponentResult {
  return score === null ? { score: null, evidence: null, sourceUrl: null } : { score, evidence, sourceUrl };
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface OpenCallFact {
  deadline: string | null;
  route: "loi" | "direct" | "unknown";
  sourceUrl: string;
}

export interface FoundationFacts {
  funder: {
    ein: string | null;
    name: string;
    type: string;
    state: string | null;
    acceptsUnsolicited: boolean | null;
    latestFilingYear: number | null;
  };
  filing: { taxYear: number; totalGiving: number | null; sourceUrl: string } | null;
  grants: { recipientName: string; recipientState: string | null; amount: number | null; purpose: string | null }[];
  peerNames: Set<string>;
  latestAvailableYear: number;
  missionAiRating: number | null;
  /** Extracted text from the funder's website, if read. */
  websiteText: string | null;
  openCall: OpenCallFact | null;
}

function accessComponent(
  openCall: OpenCallFact | null,
  acceptsUnsolicited: boolean | null,
  warmIntro: boolean | null,
  fallbackUrl: string | null,
): ComponentResult {
  const r = accessScore({
    openCall: openCall ? true : null,
    acceptsUnsolicited,
    route: openCall?.route ?? "unknown",
    warmIntro,
  });
  const notes: string[] = [];
  if (openCall) {
    const route = openCall.route === "unknown" ? "" : ` (${openCall.route.toUpperCase()})`;
    notes.push(`Open call${route}${openCall.deadline ? ` due ${openCall.deadline}` : ""}`);
  }
  if (acceptsUnsolicited) notes.push("Accepts unsolicited requests");
  if (warmIntro) notes.push("family foundation (warm-intro path)");
  return comp(r.score, notes.join("; ") || "No open call or unsolicited route found", openCall?.sourceUrl ?? fallbackUrl);
}

export function foundationFitInput(f: FoundationFacts): FitInput {
  const src = f.filing?.sourceUrl ?? null;
  const ty = f.filing ? ` (TY${f.filing.taxYear})` : "";
  const purposes = f.grants.map((g) => g.purpose ?? "").join(" \n ");
  const missionText = [purposes, f.websiteText ?? ""].join(" \n ").trim() || null;

  // Mission
  const m = missionScore(missionText, f.missionAiRating);
  const missionEvidence = m.hits.length
    ? `Past grants mention ${m.hits.slice(0, MAX_KEYWORDS_SHOWN).map((h) => `"${h}"`).join(", ")}`
    : f.missionAiRating !== null
      ? `Stated purpose rated ${f.missionAiRating}/3 for mission fit`
      : "No mission keywords in grant purposes";

  // Women & girls
  const names = f.grants.map((g) => g.recipientName);
  const w = womenScore(purposes || null, names);
  const exampleGrantee = names.find((n) => keywordScore(n, WOMEN_KEYWORDS, 1).hits.length > 0);
  const womenEvidence = exampleGrantee
    ? `Funded women-focused grantees, e.g. ${exampleGrantee}`
    : w.hits.length
      ? `Grant purposes mention ${w.hits.slice(0, MAX_KEYWORDS_SHOWN).map((h) => `"${h}"`).join(", ")}`
      : "No women/girls focus found in grants";

  // Geography
  const g = geographyScore(
    f.grants.map((x) => ({ state: x.recipientState, amount: x.amount })),
    f.funder.state,
  );
  const geoEvidence =
    g.utahShare !== null
      ? g.utahShare > 0
        ? `${pct(g.utahShare)} of grant dollars went to Utah${ty}`
        : `${pct(g.regionShare ?? 0)} of grant dollars to the Mountain West, none to Utah${ty}`
      : f.funder.state === GEOGRAPHY.homeState
        ? "Utah-based funder"
        : null;

  // Giving history
  const amounts = f.grants.map((x) => x.amount ?? 0).filter((a) => a > 0);
  const peerHits = f.grants.filter((x) => f.peerNames.has(normalizeOrgName(x.recipientName)));
  const h = historyScore({ grantAmounts: amounts, totalGiving: f.filing?.totalGiving ?? null, peerGrantCount: peerHits.length });
  const historyNotes: string[] = [];
  if (amounts.length) historyNotes.push(`Typical grant ${usd(median(amounts))}`);
  if (f.filing?.totalGiving) historyNotes.push(`gave ${usd(f.filing.totalGiving)} in TY${f.filing.taxYear}`);
  if (peerHits.length) historyNotes.push(`funded peer ${[...new Set(peerHits.map((p) => p.recipientName))].slice(0, 2).join(", ")}`);

  const warmIntro = f.funder.type === "family_foundation" ? true : null;

  return {
    components: {
      mission: comp(m.score, missionEvidence, f.openCall?.sourceUrl ?? src),
      women: comp(w.score, womenEvidence, src),
      geography: comp(g.score, geoEvidence, src),
      history: comp(h.score, historyNotes.join("; ") || null, src),
      access: accessComponent(f.openCall, f.funder.acceptsUnsolicited, warmIntro, src),
    },
    gates: foundationGates({
      latestGrantYear: f.grants.length ? (f.filing?.taxYear ?? f.funder.latestFilingYear) : null,
      latestAvailableYear: f.latestAvailableYear,
      preselectedOnly: f.funder.acceptsUnsolicited === null ? null : !f.funder.acceptsUnsolicited,
    }),
  };
}

export interface GovListing {
  title: string;
  description: string | null;
  eligibility: string | null;
  geography: string | null;
  awardMin: number | null;
  awardMax: number | null;
  deadline: string | null;
  route: "loi" | "direct" | "unknown";
  sourceUrl: string;
  missionAiRating?: number | null;
}

export function governmentFitInput(l: GovListing, today: Date = new Date()): FitInput {
  const text = [l.title, l.description, l.eligibility].filter(Boolean).join(" \n ");
  const m = missionScore(text, l.missionAiRating ?? null);
  const w = womenScore(text, []);
  const geo = govGeographyScore(l.geography ?? l.eligibility);
  const h = historyScore({ grantAmounts: [], totalGiving: null, peerGrantCount: 0, awardRange: { min: l.awardMin, max: l.awardMax } });
  const range =
    l.awardMin !== null || l.awardMax !== null
      ? `Awards ${[l.awardMin, l.awardMax].filter((x): x is number => x !== null).map(usd).join("–")}`
      : null;

  return {
    components: {
      mission: comp(m.score, m.hits.length ? `Listing mentions ${m.hits.slice(0, MAX_KEYWORDS_SHOWN).map((x) => `"${x}"`).join(", ")}` : "Listing has no mission keywords", l.sourceUrl),
      women: comp(w.hits.length ? w.score : null, w.hits.length ? `Listing targets ${w.hits.slice(0, 2).join(", ")}` : null, l.sourceUrl),
      geography: comp(geo, l.geography ? `Eligible area: ${l.geography}` : null, l.sourceUrl),
      history: comp(h.score, range, l.sourceUrl),
      access: accessComponent({ deadline: l.deadline, route: l.route, sourceUrl: l.sourceUrl }, null, null, l.sourceUrl),
    },
    gates: governmentGates({ hasListing: true, deadline: l.deadline }, today),
  };
}
