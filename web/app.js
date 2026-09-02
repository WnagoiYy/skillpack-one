const translations = {
  "zh-CN": {
    eyebrow: "开放 · 可组合 · 可进化",
    title: "一个包，找到每一种能力。",
    subtitle: "浏览当前仓库的分类路由、原子能力和演进治理 Skill。分类来自开放层级，并不局限于固定的四类。",
    allSkills: "全部 Skills",
    searchLabel: "搜索 Skill",
    searchPlaceholder: "搜索名称、能力、触发词…",
    all: "全部",
    category: "能力分类",
    allCategories: "全部分类",
    results: "项结果",
    emptyTitle: "没有匹配的 Skill",
    emptyBody: "换一个关键词，或清除筛选条件。",
    reset: "重置筛选",
    source: "查看源文件 ↗",
    copy: "复制 Skill ID",
    copied: "已复制",
    outcome: "能力产出",
    triggers: "触发提示",
    boundaries: "不适用边界",
    confusable: "易混淆 Skill",
    markdown: "SKILL.md 原文",
    version: "版本",
    risk: "风险",
    categoryFact: "主分类",
    origin: "来源",
    noItems: "未声明"
  },
  en: {
    eyebrow: "OPEN · COMPOSABLE · EVOLVABLE",
    title: "One pack. Every capability in view.",
    subtitle: "Explore the repository's Category routers, Atomic capabilities, and Meta governance Skills. The hierarchy is open, not limited to four fixed classes.",
    allSkills: "All Skills",
    searchLabel: "Search Skills",
    searchPlaceholder: "Search names, capabilities, triggers…",
    all: "All",
    category: "Capability category",
    allCategories: "All categories",
    results: "results",
    emptyTitle: "No matching Skills",
    emptyBody: "Try another term or clear the filters.",
    reset: "Reset filters",
    source: "View source ↗",
    copy: "Copy Skill ID",
    copied: "Copied",
    outcome: "Outcomes",
    triggers: "Positive triggers",
    boundaries: "Negative boundaries",
    confusable: "Confusable Skills",
    markdown: "SKILL.md source",
    version: "Version",
    risk: "Risk",
    categoryFact: "Primary category",
    origin: "Origin",
    noItems: "Not declared"
  }
};

const state = {
  data: null,
  locale: localStorage.getItem("skill-browser-locale") || (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en"),
  query: "",
  kind: "all",
  category: "all",
  selectedId: new URLSearchParams(location.search).get("skill")
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  list: $("#skill-list"),
  detail: $("#skill-detail"),
  empty: $("#empty-state"),
  resultCount: $("#result-count"),
  search: $("#search-input"),
  category: $("#category-select")
};

function t(key) { return translations[state.locale][key] || key; }
function localized(value) { return value?.[state.locale] || value?.en || Object.values(value || {})[0] || ""; }
function normalize(value) { return String(value ?? "").toLocaleLowerCase().normalize("NFKC"); }
function kindLabel(kind) { return kind === "atom" ? "Atom" : kind === "meta" ? "Meta" : "Category"; }

function element(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "htmlFor") node.htmlFor = value;
    else if (key.startsWith("aria")) node.setAttribute(key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), value);
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function applyLocale() {
  document.documentElement.lang = state.locale;
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-locale]").forEach((button) => button.classList.toggle("active", button.dataset.locale === state.locale));
  if (!state.data) return;
  populateCategories();
  render();
}

function categoryLabel(id) {
  const category = state.data.categories.find((item) => item.id === id);
  return category ? localized(category.label) : id;
}

function populateCategories() {
  const used = new Set(state.data.skills.map((skill) => skill.taxonomy.primaryCategory));
  const current = state.category;
  elements.category.replaceChildren(element("option", { value: "all", text: t("allCategories") }));
  for (const category of state.data.categories.filter((item) => used.has(item.id)).sort((a, b) => localized(a.label).localeCompare(localized(b.label), state.locale))) {
    elements.category.append(element("option", { value: category.id, text: localized(category.label) }));
  }
  elements.category.value = [...elements.category.options].some((option) => option.value === current) ? current : "all";
}

function searchableText(skill) {
  return normalize([
    skill.id,
    ...Object.values(skill.name),
    ...Object.values(skill.summary),
    skill.taxonomy.primaryCategory,
    ...(skill.taxonomy.secondaryCategories || []),
    ...Object.values(skill.routing.positiveTriggers).flat(),
    ...Object.values(skill.routing.negativeTriggers).flat(),
    ...skill.outcomes,
    skill.markdown
  ].join(" "));
}

function filteredSkills() {
  const terms = normalize(state.query).split(/\s+/u).filter(Boolean);
  return state.data.skills.filter((skill) => {
    if (state.kind !== "all" && skill.kind !== state.kind) return false;
    if (state.category !== "all" && skill.taxonomy.primaryCategory !== state.category) return false;
    const haystack = searchableText(skill);
    return terms.every((term) => haystack.includes(term));
  });
}

function badge(kind) { return element("span", { className: `badge ${kind}`, text: kindLabel(kind) }); }

function renderList(skills) {
  elements.list.replaceChildren();
  elements.resultCount.textContent = String(skills.length);
  elements.empty.hidden = skills.length !== 0;
  elements.list.hidden = skills.length === 0;
  for (const skill of skills) {
    const button = element("button", {
      type: "button",
      className: `skill-card${skill.id === state.selectedId ? " active" : ""}`,
      role: "option",
      ariaSelected: String(skill.id === state.selectedId),
      "data-skill-id": skill.id
    }, [
      element("span", { className: "skill-card-title", text: localized(skill.name) }),
      badge(skill.kind),
      element("span", { className: "skill-card-id", text: skill.id }),
      element("p", { className: "skill-card-summary", text: localized(skill.summary) })
    ]);
    button.addEventListener("click", () => selectSkill(skill.id, true));
    elements.list.append(button);
  }
}

function tagList(items) {
  const values = items?.length ? items : [t("noItems")];
  return element("ul", { className: "tag-list" }, values.map((item) => element("li", { text: item })));
}

function detailBlock(title, items, tags = true) {
  return element("section", { className: "detail-block" }, [
    element("h3", { text: title }),
    tags ? tagList(items) : element("ul", { className: "plain-list" }, (items?.length ? items : [t("noItems")]).map((item) => element("li", { text: item })))
  ]);
}

function fact(label, value) {
  return element("div", { className: "fact" }, [element("dt", { text: label }), element("dd", { text: value })]);
}

function renderDetail(skill) {
  const copyButton = element("button", { type: "button", text: t("copy") });
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(skill.id);
    copyButton.textContent = t("copied");
    setTimeout(() => { copyButton.textContent = t("copy"); }, 1400);
  });
  const sourceLink = element("a", { className: "primary", href: skill.sourceUrl, target: "_blank", rel: "noreferrer", text: t("source") });
  const header = element("header", { className: "detail-header" }, [
    element("div", { className: "detail-kicker" }, [badge(skill.kind), element("span", { text: skill.id })]),
    element("h2", { text: localized(skill.name) }),
    element("p", { className: "detail-summary", text: localized(skill.summary) }),
    element("div", { className: "detail-actions" }, [sourceLink, copyButton]),
    element("dl", { className: "facts" }, [
      fact(t("version"), skill.version),
      fact(t("categoryFact"), categoryLabel(skill.taxonomy.primaryCategory)),
      fact(t("risk"), skill.taxonomy.risk),
      fact(t("origin"), skill.provenance.origin)
    ])
  ]);
  const triggers = skill.routing.positiveTriggers[state.locale] || skill.routing.positiveTriggers.en || [];
  const boundaries = skill.routing.negativeTriggers[state.locale] || skill.routing.negativeTriggers.en || [];
  const grid = element("div", { className: "detail-grid" }, [
    detailBlock(t("outcome"), skill.outcomes, false),
    detailBlock(t("triggers"), triggers),
    detailBlock(t("boundaries"), boundaries, false),
    detailBlock(t("confusable"), skill.routing.confusableWith)
  ]);
  const source = element("section", { className: "source-section" }, [
    element("div", { className: "source-heading" }, [element("h3", { text: t("markdown") }), element("span", { text: skill.sourcePath })]),
    element("pre", { className: "markdown-source" }, [element("code", { text: skill.markdown })])
  ]);
  elements.detail.replaceChildren(header, grid, source);
}

function selectSkill(id, updateUrl = false) {
  const skill = state.data.skills.find((item) => item.id === id);
  if (!skill) return;
  state.selectedId = id;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("skill", id);
    history.replaceState(null, "", url);
  }
  renderDetail(skill);
  document.querySelectorAll(".skill-card").forEach((card) => {
    const active = card.dataset.skillId === id;
    card.classList.toggle("active", active);
    card.setAttribute("aria-selected", String(active));
  });
}

function render() {
  const skills = filteredSkills();
  if (!skills.some((skill) => skill.id === state.selectedId)) state.selectedId = skills[0]?.id || null;
  renderList(skills);
  if (state.selectedId) renderDetail(state.data.skills.find((skill) => skill.id === state.selectedId));
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => { state.query = event.target.value; render(); });
  elements.category.addEventListener("change", (event) => { state.category = event.target.value; render(); });
  $("#kind-filter").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-kind]");
    if (!button) return;
    state.kind = button.dataset.kind;
    document.querySelectorAll("[data-kind]").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  $("#reset-filters").addEventListener("click", () => {
    state.query = ""; state.kind = "all"; state.category = "all";
    elements.search.value = ""; elements.category.value = "all";
    document.querySelectorAll("[data-kind]").forEach((item) => item.classList.toggle("active", item.dataset.kind === "all"));
    render();
  });
  document.querySelectorAll("[data-locale]").forEach((button) => button.addEventListener("click", () => {
    state.locale = button.dataset.locale;
    localStorage.setItem("skill-browser-locale", state.locale);
    applyLocale();
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== elements.search) { event.preventDefault(); elements.search.focus(); }
    if (event.key === "Escape" && document.activeElement === elements.search) { elements.search.value = ""; state.query = ""; render(); }
  });
}

async function initialize() {
  try {
    const response = await fetch("./data/skills.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    $("#package-version").textContent = `v${state.data.packageVersion}`;
    $("#taxonomy-version").textContent = `Taxonomy v${state.data.taxonomyVersion} · ${state.data.stats.taxonomyNodes} nodes`;
    $("#repo-link").href = state.data.repository;
    for (const key of ["total", "category", "atom", "meta"]) $(`#stat-${key}`).textContent = state.data.stats[key];
    bindEvents();
    applyLocale();
  } catch (error) {
    elements.detail.textContent = `Unable to load the Skill library: ${error.message}`;
  }
}

initialize();
