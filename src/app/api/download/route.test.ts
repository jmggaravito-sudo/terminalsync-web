import { describe, expect, it } from "vitest";

import { GET } from "./route";

/**
 * Hasta el 2026-09-23 este endpoint le servía un DMG a todo el mundo. El héroe
 * decía "macOS · Linux · Windows" justo abajo del botón, así que el visitante
 * de Windows leía que su sistema estaba soportado, apretaba "Empieza gratis",
 * y se bajaba un archivo que su computadora no sabe abrir. El componente de
 * lista de espera existía desde hacía meses y no se pintaba en ninguna parte.
 */
const UA_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const UA_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";

function pedir(ua: string, url = "https://terminalsync.ai/api/download") {
  return GET(new Request(url, { headers: { "user-agent": ua } }));
}

describe("/api/download", () => {
  it("manda a la lista de espera a quien entra desde Windows, no a un DMG", async () => {
    const res = await pedir(UA_WINDOWS);
    const destino = res.headers.get("location") ?? "";
    expect(destino).toContain("#windows");
    expect(destino).not.toContain(".dmg");
  });

  it("respeta el idioma cuando viene dicho", async () => {
    const res = await pedir(UA_WINDOWS, "https://terminalsync.ai/api/download?lang=en");
    expect(res.headers.get("location") ?? "").toContain("/en#windows");
  });

  it("a quien entra desde una Mac le sigue dando el instalador", async () => {
    const res = await pedir(UA_MAC);
    expect(res.headers.get("location") ?? "").toContain(".dmg");
  });
});
