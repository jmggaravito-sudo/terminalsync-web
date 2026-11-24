(() => {
  const currentLocale = () => {
    const locale = new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "es";
    return locale.toLowerCase().startsWith("en") ? "en" : "es";
  };

  const syncHomeLinks = () => {
    const href = `/${currentLocale()}#capacidades`;
    document.querySelectorAll("[data-ts-home-link]").forEach((link) => {
      link.setAttribute("href", href);
    });
  };

  syncHomeLinks();
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-lang], #b-es, #b-en")) {
      window.setTimeout(syncHomeLinks, 0);
    }
  });
})();
