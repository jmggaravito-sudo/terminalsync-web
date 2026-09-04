/**
 * GitHub REST orchestration for the "Corregir" loop (S3): branch off
 * `release/v0.2.18-lab` in `jmggaravito-sudo/terminal-sync`, edit
 * `docs/sync-bot-knowledge.md`, open a draft PR back onto that same base.
 *
 * Mirrors the shape of `src/app/api/admin/integraciones/candidate/route.ts`
 * (branch → PUT file → POST pulls against THIS repo) but targets a
 * DIFFERENT repo (`terminal-sync`, not `terminalsync-web`) and a DIFFERENT
 * base (`release/v0.2.18-lab` — `main` is frozen there, see that repo's
 * CLAUDE.md) and edits an existing file instead of creating a new one.
 *
 * Kept in its own module (rather than inlined in route.ts, unlike the
 * candidate route) so route.test.ts can mock `fetch` once and exercise the
 * whole GitHub round trip without also re-deriving the Supabase wiring.
 */

export const CORRECTIONS_OWNER = "jmggaravito-sudo";
export const CORRECTIONS_REPO = "terminal-sync";
export const CORRECTIONS_BASE_BRANCH = "release/v0.2.18-lab";
export const CORRECTIONS_KNOWLEDGE_PATH = "docs/sync-bot-knowledge.md";

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
    "User-Agent": "terminalsync-web-admin-soporte-correcciones",
  };
}

async function ghJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}${text ? `: ${text.slice(0, 500)}` : ""}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export interface OpenCorrectionPrParams {
  token: string;
  branch: string;
  commitMessage: string;
  bullet: string;
  appendBullet: (fileContent: string, bullet: string) => string;
  prTitle: string;
  prBody: string;
}

export interface OpenCorrectionPrResult {
  branch: string;
  prUrl: string;
  prNumber: number;
}

/** Thrown when the branch already exists (GitHub 422 on ref creation) —
 *  the route can catch this specifically to retry once with a suffixed
 *  branch name instead of treating it as a generic failure. */
export class BranchExistsError extends Error {}

export async function openCorrectionPr(params: OpenCorrectionPrParams): Promise<OpenCorrectionPrResult> {
  const { token, branch, commitMessage, bullet, appendBullet, prTitle, prBody } = params;
  const base = `https://api.github.com/repos/${CORRECTIONS_OWNER}/${CORRECTIONS_REPO}`;

  // 1. SHA of the base branch.
  const refRes = await fetch(`${base}/git/ref/heads/${CORRECTIONS_BASE_BRANCH}`, {
    headers: ghHeaders(token),
    cache: "no-store",
  });
  const refJson = await ghJson<{ object: { sha: string } }>(refRes);
  const baseSha = refJson.object.sha;

  // 2. Create the correction branch off that sha.
  const createRefRes = await fetch(`${base}/git/refs`, {
    method: "POST",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  });
  if (createRefRes.status === 422) {
    throw new BranchExistsError(`branch "${branch}" already exists`);
  }
  await ghJson(createRefRes);

  // 3. Current file content + sha (file may not exist yet — 404 is fine).
  const getFileRes = await fetch(`${base}/contents/${CORRECTIONS_KNOWLEDGE_PATH}?ref=${encodeURIComponent(branch)}`, {
    headers: ghHeaders(token),
    cache: "no-store",
  });
  let currentContent = "";
  let currentSha: string | undefined;
  if (getFileRes.status !== 404) {
    const fileJson = await ghJson<{ content: string; encoding: string; sha: string }>(getFileRes);
    currentContent = fileJson.encoding === "base64" ? Buffer.from(fileJson.content, "base64").toString("utf8") : fileJson.content;
    currentSha = fileJson.sha;
  }

  // 4. Build + write the new content.
  const newContent = appendBullet(currentContent, bullet);
  const putRes = await fetch(`${base}/contents/${CORRECTIONS_KNOWLEDGE_PATH}`, {
    method: "PUT",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(newContent, "utf8").toString("base64"),
      branch,
      ...(currentSha ? { sha: currentSha } : {}),
    }),
  });
  await ghJson(putRes);

  // 5. Open the draft PR.
  const prRes = await fetch(`${base}/pulls`, {
    method: "POST",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: prTitle,
      head: branch,
      base: CORRECTIONS_BASE_BRANCH,
      body: prBody,
      draft: true,
    }),
  });
  const pr = await ghJson<{ html_url: string; number: number }>(prRes);

  return { branch, prUrl: pr.html_url, prNumber: pr.number };
}
