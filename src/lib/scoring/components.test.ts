import { describe, expect, test } from "vitest";
import {
  accessScore,
  geographyScore,
  govGeographyScore,
  historyScore,
  keywordScore,
  missionScore,
  womenScore,
} from "./components";

describe("keywordScore", () => {
  test("counts distinct keyword hits, case-insensitive, whole words", () => {
    const r = keywordScore("Supports WORKFORCE development and digital skills for moms", ["workforce", "digital skills", "mom"], 2);
    expect(r.hits).toEqual(["workforce", "digital skills"]);
    expect(r.score).toBe(1);
  });

  test("does not match keywords inside other words", () => {
    expect(keywordScore("momentum and stemware", ["mom", "stem"], 2).hits).toEqual([]);
  });

  test("returns null score for empty text", () => {
    expect(keywordScore("", ["a"], 1).score).toBeNull();
    expect(keywordScore(null, ["a"], 1).score).toBeNull();
  });
});

describe("missionScore", () => {
  test("mixes keyword and AI read 50/50", () => {
    // 2 of 4 saturation hits = 0.5; AI 3/3 = 1 -> 0.75
    const r = missionScore("workforce and coding programs", 3);
    expect(r.score).toBeCloseTo(0.75);
  });

  test("uses keyword alone when AI rating is missing", () => {
    expect(missionScore("workforce coding reskilling upskilling", null).score).toBe(1);
  });

  test("uses AI alone when text is missing", () => {
    expect(missionScore(null, 2).score).toBeCloseTo(2 / 3);
  });

  test("null when neither is available", () => {
    expect(missionScore(null, null).score).toBeNull();
  });
});

describe("womenScore", () => {
  test("credits keyword hits in purpose or past grantee names", () => {
    const r = womenScore("General charitable purposes", ["Utah Women in Tech", "Girls Who Code"]);
    expect(r.score).toBe(1);
  });

  test("zero when text exists but nothing matches", () => {
    expect(womenScore("Arts and culture", ["Symphony"]).score).toBe(0);
  });
});

describe("geographyScore", () => {
  test("full credit when Utah share reaches threshold", () => {
    const r = geographyScore([
      { state: "UT", amount: 60_000 },
      { state: "CA", amount: 40_000 },
    ]);
    expect(r.score).toBe(1);
    expect(r.utahShare).toBeCloseTo(0.6);
  });

  test("partial credit for Mountain West dollars", () => {
    const r = geographyScore([
      { state: "CO", amount: 50_000 },
      { state: "NY", amount: 50_000 },
    ]);
    // 0.5 regional share * 0.5 credit / 0.5 full-credit threshold = 0.5
    expect(r.score).toBeCloseTo(0.5);
  });

  test("null with no grants", () => {
    expect(geographyScore([]).score).toBeNull();
  });

  test("Utah-focused funder (state UT, no grants) gets full credit", () => {
    expect(geographyScore([], "UT").score).toBe(1);
  });
});

describe("govGeographyScore", () => {
  test("Utah-specific or national eligibility", () => {
    expect(govGeographyScore("State of Utah nonprofits")).toBe(1);
    expect(govGeographyScore("Nationwide")).toBe(0.6);
    expect(govGeographyScore(null)).toBeNull();
  });
});

describe("historyScore", () => {
  test("rewards grants in the 5K-30K sweet spot and peer overlap", () => {
    const r = historyScore({ grantAmounts: [10_000, 20_000, 15_000], totalGiving: 500_000, peerGrantCount: 2 });
    expect(r.score).toBeCloseTo(1);
  });

  test("penalizes funders whose grants are all far outside the sweet spot", () => {
    const r = historyScore({ grantAmounts: [500, 1_000_000], totalGiving: 2_000_000, peerGrantCount: 0 });
    expect(r.score!).toBeLessThan(0.4);
  });

  test("null with no data", () => {
    expect(historyScore({ grantAmounts: [], totalGiving: null, peerGrantCount: 0 }).score).toBeNull();
  });

  test("government award range scored by overlap with sweet spot", () => {
    const r = historyScore({ grantAmounts: [], totalGiving: null, peerGrantCount: 0, awardRange: { min: 10_000, max: 50_000 } });
    expect(r.score).toBeGreaterThan(0.4);
  });
});

describe("accessScore", () => {
  test("sums access points", () => {
    expect(accessScore({ openCall: true, acceptsUnsolicited: true, route: "loi", warmIntro: true }).score).toBeCloseTo(1);
  });

  test("null when everything is unknown", () => {
    expect(accessScore({ openCall: null, acceptsUnsolicited: null, route: "unknown", warmIntro: null }).score).toBeNull();
  });
});
