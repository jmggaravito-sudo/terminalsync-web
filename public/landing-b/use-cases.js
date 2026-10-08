(function () {
  "use strict";

  const catalog = window.TS_LIVE_SEARCH_CASES;
  const CATEGORIES = catalog && Array.isArray(catalog.categories) ? catalog.categories : [];
  const CASES = catalog && Array.isArray(catalog.cases) ? catalog.cases : [];
  const lang = location.pathname.startsWith("/en") ? "en" : "es";
  const labels = lang === "en"
    ? {
        categories: "Business categories",
        show: "See example",
        prompt: "A starting point",
        use: "Use this case",
        useDone: "Text copied. Paste it in TerminalSync.",
        useFail: "Could not copy; select the example text.",
        useAria: "Use this case: ",
        useDoneAria: "Text copied for: ",
        available: "In TerminalSync, each case appears when the required tools are available.",
      }
    : {
        categories: "Categorías de negocio",
        show: "Ver ejemplo",
        prompt: "Texto para empezar",
        use: "Usar este caso",
        useDone: "Texto copiado. Pégalo en TerminalSync.",
        useFail: "No se pudo copiar; selecciona el texto del ejemplo.",
        useAria: "Usar este caso: ",
        useDoneAria: "Texto copiado para: ",
        available: "En TerminalSync, cada caso aparece cuando las herramientas necesarias están disponibles.",
      };

  const categoriesEl = document.getElementById("useCasesCategories");
  const countEl = document.getElementById("useCasesCount");
  const availabilityEl = document.getElementById("useCasesAvailability");
  const gridEl = document.getElementById("useCasesGrid");
  if (!categoriesEl || !countEl || !gridEl || CATEGORIES.length === 0 || CASES.length === 0) return;

  let activeCategory = CATEGORIES[0].id;

  function escapeHtml(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return entities[char];
    });
  }

  categoriesEl.setAttribute("aria-label", labels.categories);
  if (CATEGORIES.length === 1) {
    categoriesEl.innerHTML = '<span class="uc-category uc-category-static" aria-current="true">' +
      escapeHtml(CATEGORIES[0][lang]) + '</span>';
  } else {
    categoriesEl.innerHTML = CATEGORIES.map(function (category) {
      const pressed = category.id === activeCategory;
      return '<button type="button" class="uc-category" data-case-category="' +
        escapeHtml(category.id) + '" aria-pressed="' + pressed + '">' +
        escapeHtml(category[lang]) + '</button>';
    }).join("");
  }

  if (availabilityEl) availabilityEl.textContent = labels.available;

  function renderExamples() {
    const category = CATEGORIES.find(function (item) { return item.id === activeCategory; }) || CATEGORIES[0];
    const areas = Array.isArray(category.areas) ? category.areas : [category.id];
    const examples = CASES.filter(function (item) { return areas.includes(item.area); });
    countEl.textContent = lang === "en"
      ? examples.length + (examples.length === 1 ? " use case" : " use cases")
      : examples.length + (examples.length === 1 ? " caso de uso" : " casos de uso");

    gridEl.innerHTML = examples.map(function (item) {
      const text = item[lang];
      return '<article class="uc-card" aria-labelledby="uc-title-' + escapeHtml(item.id) + '">' +
        '<p class="uc-card-label">' + escapeHtml(category[lang]) + '</p>' +
        '<h3 id="uc-title-' + escapeHtml(item.id) + '">' + escapeHtml(text.t) + '</h3>' +
        '<p class="uc-card-desc">' + escapeHtml(text.d) + '</p>' +
        '<details class="uc-details"><summary>' + escapeHtml(labels.show) + '</summary>' +
        '<div class="uc-prompt-label">' + escapeHtml(labels.prompt) + '</div>' +
        '<pre class="uc-prompt">' + escapeHtml(text.p) + '</pre>' +
        '</details>' +
        '<button type="button" class="btn btn-primary btn-sm uc-use" data-use-case="' +
        escapeHtml(item.id) + '" aria-label="' + escapeHtml(labels.useAria + text.t) +
        '" aria-live="polite">' + escapeHtml(labels.use) + '</button>' +
        '</article>';
    }).join("");
  }

  categoriesEl.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-case-category]");
    if (!button) return;
    activeCategory = button.dataset.caseCategory;
    categoriesEl.querySelectorAll("button[data-case-category]").forEach(function (item) {
      item.setAttribute("aria-pressed", String(item.dataset.caseCategory === activeCategory));
    });
    renderExamples();
  });

  function fallbackCopy(value) {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    area.remove();
    return ok;
  }

  gridEl.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-use-case]");
    if (!button) return;
    const item = CASES.find(function (candidate) { return candidate.id === button.dataset.useCase; });
    if (!item) return;

    const prompt = item[lang].p;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt);
        ok = true;
      } else {
        ok = fallbackCopy(prompt);
      }
    } catch (_) {
      ok = fallbackCopy(prompt);
    }

    button.textContent = ok ? labels.useDone : labels.useFail;
    if (ok) button.classList.add("is-copied");
    button.setAttribute("aria-label", ok ? labels.useDoneAria + item[lang].t : labels.useFail);
    window.setTimeout(function () {
      if (!button.isConnected) return;
      button.textContent = labels.use;
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", labels.useAria + item[lang].t);
    }, 1600);
  });

  renderExamples();
})();
