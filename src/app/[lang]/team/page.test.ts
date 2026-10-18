import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TeamPage from "./page";

const originalTeamFeature = process.env.TEAM_FEATURE_ENABLED;

afterEach(() => {
  if (originalTeamFeature === undefined) delete process.env.TEAM_FEATURE_ENABLED;
  else process.env.TEAM_FEATURE_ENABLED = originalTeamFeature;
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
});
