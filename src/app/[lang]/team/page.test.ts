import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TeamPage from "./page";

const originalTeamFeature = process.env.TEAM_FEATURE_ENABLED;
const originalPaidCheckout = process.env.TEAM_PAID_CHECKOUT_ENABLED;

afterEach(() => {
  if (originalTeamFeature === undefined) delete process.env.TEAM_FEATURE_ENABLED;
  else process.env.TEAM_FEATURE_ENABLED = originalTeamFeature;
  if (originalPaidCheckout === undefined) delete process.env.TEAM_PAID_CHECKOUT_ENABLED;
  else process.env.TEAM_PAID_CHECKOUT_ENABLED = originalPaidCheckout;
});

describe("Team page availability gate", () => {
  it("renders an explicit unavailable state by default without mounting Team API clients", async () => {
    delete process.env.TEAM_FEATURE_ENABLED;
    const page = await TeamPage({ params: Promise.resolve({ lang: "es" }) });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Team se está preparando");
    expect(markup).toContain("Tus planes Pro y Max no cambian");
    expect(markup).not.toContain("Cargando");
  });

  it("does not mount paid-roster reads for the no-card Team rollout", async () => {
    process.env.TEAM_FEATURE_ENABLED = "1";
    delete process.env.TEAM_PAID_CHECKOUT_ENABLED;

    const page = await TeamPage({ params: Promise.resolve({ lang: "en" }) });
    expect(page.props.paidRosterEnabled).toBe(false);

    process.env.TEAM_PAID_CHECKOUT_ENABLED = "1";
    const paidPage = await TeamPage({ params: Promise.resolve({ lang: "en" }) });
    expect(paidPage.props.paidRosterEnabled).toBe(true);
  });
});
