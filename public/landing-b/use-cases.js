(function () {
  "use strict";
  const CATEGORIES = [{"id":"ventas","es":"Ventas","en":"Sales","areas":["clientes","ecommerce"]},{"id":"marketing","es":"Marketing","en":"Marketing","areas":["marketing"]},{"id":"atencion","es":"Atención al cliente","en":"Customer service","areas":["atencion"]},{"id":"operaciones","es":"Operaciones","en":"Operations","areas":["operaciones","continuidad"]},{"id":"equipo","es":"Equipo","en":"Team","areas":["rrhh"]},{"id":"administracion","es":"Administración","en":"Administration","areas":["finanzas","legal"]},{"id":"tecnologia","es":"Tecnología","en":"Technology","areas":["software"]},{"id":"direccion","es":"Dirección","en":"Leadership","areas":["direccion"]}];
  const CASES = [{"id":"propuesta","area":"clientes","es":{"t":"Crear propuesta comercial","d":"Genera una propuesta profesional lista para enviar a un cliente.","p":"Ayúdame a crear una propuesta comercial para mi empresa.\n\nMi empresa vende: [describir tu producto o servicio].\nMi cliente ideal es: [tipo de cliente].\nEl objetivo de la propuesta es: [cerrar venta / agendar reunión / firmar contrato].\n\nIncluye: resumen ejecutivo, propuesta de valor, alcance del servicio, beneficios, precio sugerido, condiciones y próximos pasos."},"en":{"t":"Create a business proposal","d":"Generate a professional proposal ready to send to a client.","p":"Help me create a business proposal for my company.\n\nMy company sells: [describe your product or service].\nMy ideal client is: [type of client].\nThe goal of the proposal is: [close a sale / book a meeting / sign a contract].\n\nInclude: executive summary, value proposition, scope of service, benefits, suggested price, terms and next steps."}},{"id":"seguimiento","area":"clientes","es":{"t":"Hacer seguimiento a prospectos","d":"Mensajes de seguimiento que reactivan conversaciones sin sonar insistente.","p":"Necesito hacer seguimiento a un prospecto que no responde hace [días/semanas].\n\nContexto: [última conversación].\nMi tono: [cercano / formal].\n\nEscríbeme 3 mensajes distintos: uno breve, uno con valor agregado y uno de última llamada."},"en":{"t":"Follow up with prospects","d":"Follow-up messages that revive conversations without sounding pushy.","p":"I need to follow up with a prospect who hasn’t replied in [days/weeks].\n\nContext: [last conversation].\nMy tone: [friendly / formal].\n\nWrite 3 different messages: one short, one adding value and one final call."}},{"id":"calendario","area":"marketing","es":{"t":"Armar calendario de contenido","d":"Un mes de contenido alineado a tus objetivos, listo para producir.","p":"Arma un calendario de contenido de 4 semanas.\n\nMi negocio: [descripción].\nCanales: [Instagram / LinkedIn / blog...].\nObjetivo del mes: [ventas / awareness / comunidad].\n\nPor pieza: fecha, canal, formato, tema y gancho."},"en":{"t":"Build a content calendar","d":"A month of content aligned to your goals, ready to produce.","p":"Build a 4-week content calendar.\n\nMy business: [description].\nChannels: [Instagram / LinkedIn / blog...].\nGoal for the month: [sales / awareness / community].\n\nPer piece: date, channel, format, topic and hook."}},{"id":"campana","area":"marketing","es":{"t":"Lanzar una campaña completa","d":"Copies, piezas y secuencia de correos de una sola vez.","p":"Quiero lanzar una campaña para [producto / oferta].\n\nAudiencia: [quién].\nPresupuesto: [monto o \"orgánico\"].\nDuración: [semanas].\n\nEntrega: mensaje central, 5 copies para anuncios, 3 correos de secuencia y el plan de publicación."},"en":{"t":"Launch a full campaign","d":"Copy, assets and an email sequence in one pass.","p":"I want to launch a campaign for [product / offer].\n\nAudience: [who].\nBudget: [amount or \"organic\"].\nDuration: [weeks].\n\nDeliver: core message, 5 ad copies, a 3-email sequence and the publishing plan."}},{"id":"faq-clientes","area":"atencion","es":{"t":"Responder preguntas frecuentes","d":"Respuestas listas en tu tono para las dudas de siempre.","p":"Estas son las 10 preguntas que más me hacen los clientes: [lista].\n\nMi tono: [cercano / formal].\nMi negocio: [descripción].\n\nEscribe una respuesta modelo para cada una, breve y en mi voz."},"en":{"t":"Answer frequent questions","d":"Ready-made answers in your tone for the usual questions.","p":"These are the 10 questions clients ask me most: [list].\n\nMy tone: [friendly / formal].\nMy business: [description].\n\nWrite a model answer for each one, short and in my voice."}},{"id":"cliente-molesto","area":"atencion","es":{"t":"Responder a un cliente molesto","d":"Baja la tensión, protege la relación y resuelve.","p":"Un cliente está molesto por: [motivo].\n\nSu mensaje: [pegar mensaje].\nLo que puedo ofrecer: [opciones reales].\n\nEscribe una respuesta que reconozca el problema, baje la tensión y proponga una solución concreta."},"en":{"t":"Reply to an upset customer","d":"Lower the tension, protect the relationship and resolve it.","p":"A customer is upset about: [reason].\n\nTheir message: [paste message].\nWhat I can offer: [real options].\n\nWrite a reply that acknowledges the problem, lowers the tension and proposes a concrete solution."}},{"id":"sop","area":"operaciones","es":{"t":"Documentar un proceso (SOP)","d":"Convierte lo que haces de memoria en un manual paso a paso.","p":"Quiero documentar este proceso: [nombre].\n\nAsí lo hago hoy: [describir pasos como salgan].\n\nConviértelo en un SOP claro: objetivo, responsable, pasos numerados, herramientas y errores comunes."},"en":{"t":"Document a process (SOP)","d":"Turn what you do from memory into a step-by-step manual.","p":"I want to document this process: [name].\n\nThis is how I do it today: [describe steps roughly].\n\nTurn it into a clear SOP: goal, owner, numbered steps, tools and common mistakes."}},{"id":"reporte-semanal","area":"operaciones","es":{"t":"Automatizar el reporte semanal","d":"Un script que arma el reporte solo, cada semana.","p":"Quiero automatizar mi reporte semanal.\n\nDatos que uso: [fuentes: hojas de cálculo / sistema].\nLo que debe mostrar: [métricas].\nFormato: [correo / PDF / hoja].\n\nConstruye la herramienta y explícame cómo correrla cada lunes."},"en":{"t":"Automate the weekly report","d":"A script that builds the report by itself, every week.","p":"I want to automate my weekly report.\n\nData sources: [spreadsheets / system].\nWhat it must show: [metrics].\nFormat: [email / PDF / sheet].\n\nBuild the tool and explain how to run it every Monday."}},{"id":"job-post","area":"rrhh","es":{"t":"Escribir una oferta de empleo","d":"Descripción del cargo que atrae al perfil correcto.","p":"Necesito publicar una vacante.\n\nCargo: [nombre].\nResponsabilidades: [lista].\nMi empresa: [descripción breve].\nRango salarial: [opcional].\n\nEscribe la oferta: título atractivo, misión del rol, responsabilidades, requisitos y beneficios."},"en":{"t":"Write a job posting","d":"A role description that attracts the right profile.","p":"I need to post a job opening.\n\nRole: [name].\nResponsibilities: [list].\nMy company: [short description].\nSalary range: [optional].\n\nWrite the posting: attractive title, role mission, responsibilities, requirements and benefits."}},{"id":"onboarding","area":"rrhh","es":{"t":"Crear plan de onboarding","d":"Los primeros 30 días de un empleado nuevo, organizados.","p":"Crea el plan de onboarding para: [cargo].\n\nMi empresa hace: [descripción].\nHerramientas que usamos: [lista].\n\nOrganiza los primeros 30 días: semana a semana, con objetivos, accesos y a quién conocer."},"en":{"t":"Create an onboarding plan","d":"A new hire’s first 30 days, organized.","p":"Create the onboarding plan for: [role].\n\nMy company does: [description].\nTools we use: [list].\n\nOrganize the first 30 days: week by week, with goals, access and who to meet."}},{"id":"flujo-caja","area":"finanzas","es":{"t":"Analizar el flujo de caja","d":"Entiende a dónde se va la plata y qué viene.","p":"Analiza mi flujo de caja.\n\nPego los movimientos: [datos / CSV].\nPeriodo: [rango].\n\nDame: entradas vs salidas por categoría, gastos que crecen, meses de riesgo y 3 acciones para mejorar la caja."},"en":{"t":"Analyze cash flow","d":"Understand where the money goes and what’s coming.","p":"Analyze my cash flow.\n\nHere are the transactions: [data / CSV].\nPeriod: [range].\n\nGive me: inflows vs outflows by category, growing expenses, risky months and 3 actions to improve cash."}},{"id":"contrato","area":"legal","es":{"t":"Redactar un contrato de servicios","d":"Borrador claro para revisar con tu abogado.","p":"Redacta un borrador de contrato de servicios.\n\nServicio: [qué haré].\nPartes: [mi empresa] y [cliente].\nCondiciones clave: [pago, plazos, entregables].\n\nIncluye: alcance, pagos, confidencialidad, propiedad del trabajo y terminación. Nota: es un borrador para revisión legal."},"en":{"t":"Draft a services contract","d":"A clear draft to review with your lawyer.","p":"Draft a services contract.\n\nService: [what I’ll do].\nParties: [my company] and [client].\nKey terms: [payment, deadlines, deliverables].\n\nInclude: scope, payments, confidentiality, work ownership and termination. Note: this is a draft for legal review."}},{"id":"dashboard","area":"software","es":{"t":"Construir un dashboard del negocio","d":"Tus números clave en una sola pantalla, siempre al día.","p":"Construye un dashboard para mi negocio.\n\nFuentes de datos: [hojas / sistemas].\nMétricas clave: [ventas, caja, clientes...].\nQuién lo ve: [yo / equipo].\n\nHazlo claro y visual, y explícame cómo se actualiza."},"en":{"t":"Build a business dashboard","d":"Your key numbers on one screen, always up to date.","p":"Build a dashboard for my business.\n\nData sources: [sheets / systems].\nKey metrics: [sales, cash, customers...].\nWho sees it: [me / team].\n\nMake it clear and visual, and explain how it updates."}},{"id":"portal-clientes","area":"software","es":{"t":"Crear un portal para clientes","d":"Un lugar donde tus clientes ven avances, archivos y estados.","p":"Crea un portal simple para mis clientes.\n\nDeben poder ver: [avances / archivos / facturas].\nMis clientes son: [tipo].\nAcceso: [link privado / clave].\n\nConstrúyelo paso a paso y dime cómo darle acceso a cada cliente."},"en":{"t":"Create a client portal","d":"A place where clients see progress, files and statuses.","p":"Create a simple portal for my clients.\n\nThey should see: [progress / files / invoices].\nMy clients are: [type].\nAccess: [private link / password].\n\nBuild it step by step and tell me how to grant each client access."}},{"id":"plan-trimestre","area":"direccion","es":{"t":"Planear el próximo trimestre","d":"Convierte tus metas en un plan con dueños y fechas.","p":"Ayúdame a planear el próximo trimestre.\n\nMi negocio: [descripción].\nResultados del trimestre pasado: [resumen].\nMetas: [3 objetivos].\n\nEntrega: prioridades, iniciativas por meta, responsable sugerido y qué NO hacer este trimestre."},"en":{"t":"Plan next quarter","d":"Turn your goals into a plan with owners and dates.","p":"Help me plan next quarter.\n\nMy business: [description].\nLast quarter’s results: [summary].\nGoals: [3 objectives].\n\nDeliver: priorities, initiatives per goal, suggested owner and what NOT to do this quarter."}},{"id":"decision","area":"direccion","es":{"t":"Pensar una decisión difícil","d":"Un segundo cerebro que te muestra ángulos que no viste.","p":"Tengo que tomar una decisión difícil: [describirla].\n\nOpciones que veo: [A, B, C].\nLo que me preocupa: [riesgos].\n\nAyúdame: pros y contras reales, riesgos que no estoy viendo, qué haría falta para decidir con datos y tu recomendación con argumentos."},"en":{"t":"Think through a hard decision","d":"A second brain that shows you angles you missed.","p":"I have a hard decision to make: [describe it].\n\nOptions I see: [A, B, C].\nWhat worries me: [risks].\n\nHelp me: real pros and cons, risks I’m not seeing, what data would settle it and your recommendation with reasoning."}}];
  const lang = location.pathname.startsWith("/en") ? "en" : "es";
  const labels = lang === "en"
    ? { categories: "Business categories", show: "See example", prompt: "A starting point", copy: "Copy text", copied: "Copied", copyAria: "Copy example: " }
    : { categories: "Categorías de negocio", show: "Ver ejemplo", prompt: "Texto para empezar", copy: "Copiar texto", copied: "Copiado", copyAria: "Copiar ejemplo: " };
  const categoriesEl = document.getElementById("useCasesCategories");
  const countEl = document.getElementById("useCasesCount");
  const gridEl = document.getElementById("useCasesGrid");
  if (!categoriesEl || !countEl || !gridEl) return;

  let activeCategory = CATEGORIES[0].id;
  function escapeHtml(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return String(value == null ? "" : value).replace(/[&<>\"']/g, function (char) { return entities[char]; });
  }

  categoriesEl.setAttribute("aria-label", labels.categories);
  categoriesEl.innerHTML = CATEGORIES.map(function (category) {
    const pressed = category.id === activeCategory;
    return '<button type="button" class="uc-category" data-case-category="' + escapeHtml(category.id) + '" aria-pressed="' + pressed + '">' + escapeHtml(category[lang]) + '</button>';
  }).join("");

  function renderExamples() {
    const category = CATEGORIES.find(function (item) { return item.id === activeCategory; }) || CATEGORIES[0];
    const examples = CASES.filter(function (item) { return category.areas.includes(item.area); });
    countEl.textContent = lang === "en"
      ? examples.length + (examples.length === 1 ? " practical example" : " practical examples")
      : examples.length + (examples.length === 1 ? " ejemplo práctico" : " ejemplos prácticos");
    gridEl.innerHTML = examples.map(function (item) {
      const text = item[lang];
      return '<article class="uc-card" aria-labelledby="uc-title-' + escapeHtml(item.id) + '">' +
        '<p class="uc-card-label">' + escapeHtml(category[lang]) + '</p>' +
        '<h3 id="uc-title-' + escapeHtml(item.id) + '">' + escapeHtml(text.t) + '</h3>' +
        '<p class="uc-card-desc">' + escapeHtml(text.d) + '</p>' +
        '<details class="uc-details"><summary>' + escapeHtml(labels.show) + '</summary>' +
        '<div class="uc-prompt-label">' + escapeHtml(labels.prompt) + '</div>' +
        '<pre class="uc-prompt">' + escapeHtml(text.p) + '</pre>' +
        '<button type="button" class="uc-copy" data-copy-case="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(labels.copyAria + text.t) + '">' + escapeHtml(labels.copy) + '</button>' +
        '</details></article>';
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
    const button = event.target.closest("button[data-copy-case]");
    if (!button) return;
    const item = CASES.find(function (candidate) { return candidate.id === button.dataset.copyCase; });
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
    if (ok) {
      button.textContent = labels.copied;
      button.classList.add("is-copied");
      window.setTimeout(function () {
        if (!button.isConnected) return;
        button.textContent = labels.copy;
        button.classList.remove("is-copied");
      }, 1600);
    }
  });

  renderExamples();
})();
