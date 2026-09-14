import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const homePageUrl = new URL("../dist/index.html", import.meta.url);
const certificationContentUrl = new URL(
  "../src/content/certifications/",
  import.meta.url,
);
const experienceContentUrl = new URL(
  "../src/content/experience/",
  import.meta.url,
);
const navigationComponentUrl = new URL(
  "../src/components/Navigation.astro",
  import.meta.url,
);
const heroComponentUrl = new URL(
  "../src/components/HeroSection.astro",
  import.meta.url,
);
const globalStylesUrl = new URL("../src/styles/global.css", import.meta.url);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("navigation clears the active section when returning to the hero", async () => {
  // Arrange
  const source = await readFile(navigationComponentUrl, { encoding: "utf8" });
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const compiledScript = ts.transpileModule(script, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  class MockHTMLElement {}
  const sections = ["capabilities", "experience", "personal-projects"].map(
    (id) => Object.assign(new MockHTMLElement(), { id }),
  );
  const links = sections.map(({ id }) => ({
    dataset: { sectionLink: id },
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  }));
  let observerCallback;
  class MockIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}
  }
  const document = {
    querySelector: () => null,
    querySelectorAll: () => links,
    getElementById: (id) => sections.find((section) => section.id === id),
    documentElement: { addEventListener() {} },
    addEventListener() {},
  };
  vm.runInNewContext(compiledScript, {
    document,
    HTMLElement: MockHTMLElement,
    IntersectionObserver: MockIntersectionObserver,
    window: {
      addEventListener() {},
      history: { replaceState() {}, state: null },
      IntersectionObserver: MockIntersectionObserver,
      location: { hash: "", pathname: "/", search: "" },
    },
  });

  // Act
  observerCallback([
    { target: sections[0], isIntersecting: true, intersectionRatio: 0.4 },
  ]);
  const activeInSkills = links[0].attributes.get("aria-current");
  observerCallback([
    { target: sections[0], isIntersecting: false, intersectionRatio: 0 },
  ]);

  // Assert
  assert.equal(activeInSkills, "location");
  assert.equal(links[0].attributes.has("aria-current"), false);
});

test("navigation syncs the section hash with the active section", async () => {
  // Arrange
  const source = await readFile(navigationComponentUrl, { encoding: "utf8" });
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const compiledScript = ts.transpileModule(script, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  class MockHTMLElement {}
  const section = Object.assign(new MockHTMLElement(), { id: "experience" });
  const link = {
    dataset: { sectionLink: section.id },
    setAttribute() {},
    removeAttribute() {},
  };
  let observerCallback;
  class MockIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}
  }
  const replacedUrls = [];
  const document = {
    querySelector: () => null,
    querySelectorAll: () => [link],
    getElementById: () => section,
    documentElement: { addEventListener() {} },
    addEventListener() {},
  };
  const window = {
    addEventListener() {},
    history: {
      state: { existing: "state" },
      replaceState: (_state, _unused, url) => {
        replacedUrls.push(url);
        window.location.hash = new URL(url, "https://example.com").hash;
      },
    },
    location: {
      hash: "",
      pathname: "/",
      search: "?language=en",
    },
    IntersectionObserver: MockIntersectionObserver,
  };
  vm.runInNewContext(compiledScript, {
    document,
    HTMLElement: MockHTMLElement,
    IntersectionObserver: MockIntersectionObserver,
    window,
  });

  // Act
  observerCallback([
    { target: section, isIntersecting: true, intersectionRatio: 0.4 },
  ]);
  observerCallback([
    { target: section, isIntersecting: false, intersectionRatio: 0 },
  ]);

  // Assert
  assert.deepEqual(replacedUrls, ["/?language=en#experience", "/?language=en"]);
});

test("navigation activates contact at the bottom of the page", async () => {
  // Arrange
  const source = await readFile(navigationComponentUrl, { encoding: "utf8" });
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const compiledScript = ts.transpileModule(script, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  class MockHTMLElement {}
  const sections = ["personal-projects", "contact"].map((id) =>
    Object.assign(new MockHTMLElement(), { id }),
  );
  const links = sections.map(({ id }) => ({
    dataset: { sectionLink: id },
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
  }));
  let observerCallback;
  let scrollListener;
  class MockIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe() {}
  }
  const document = {
    querySelector: () => null,
    querySelectorAll: () => links,
    getElementById: (id) => sections.find((section) => section.id === id),
    documentElement: { addEventListener() {}, scrollHeight: 1_000 },
    addEventListener() {},
  };
  const window = {
    addEventListener(name, listener) {
      if (name === "scroll") scrollListener = listener;
    },
    history: { replaceState() {}, state: null },
    innerHeight: 200,
    IntersectionObserver: MockIntersectionObserver,
    location: { hash: "", pathname: "/", search: "" },
    scrollY: 500,
  };
  vm.runInNewContext(compiledScript, {
    document,
    HTMLElement: MockHTMLElement,
    IntersectionObserver: MockIntersectionObserver,
    window,
  });

  // Act
  observerCallback([
    { target: sections[0], isIntersecting: true, intersectionRatio: 0.4 },
  ]);
  window.scrollY = 800;
  scrollListener();

  // Assert
  assert.equal(links[0].attributes.has("aria-current"), false);
  assert.equal(links[1].attributes.get("aria-current"), "location");
});

test("home page keeps ordered landmarks and editorial content", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });
  const requiredIds = [
    "capabilities",
    "experience",
    "personal-projects",
    "contact",
  ];

  // Act
  const mainCount = html.match(/<main(?:\s|>)/g)?.length ?? 0;
  const sectionPositions = requiredIds.map((id) => html.indexOf(`id="${id}"`));

  // Assert
  assert.equal(mainCount, 1);
  assert.ok(sectionPositions.every((position) => position >= 0));
  assert.deepEqual(
    sectionPositions,
    [...sectionPositions].sort((a, b) => a - b),
  );
  assert.match(html, /Hi, I(?:&#39;|’)m/);
  assert.match(html, />View experience</);
  assert.match(html, /href="#contact"[^>]*>\s*Contact\s*</);
  assert.match(html, /aria-label="Professional overview"/);
  assert.match(html, /Kotlin · Platform · DevEx/);
});

test("skills and certifications use semantic grouped content", async () => {
  // Arrange
  const [html, certificationFiles] = await Promise.all([
    readFile(homePageUrl, { encoding: "utf8" }),
    readdir(certificationContentUrl),
  ]);

  // Act
  const certificationCount = certificationFiles.filter((file) =>
    file.endsWith(".yml"),
  ).length;
  const featuredNames = [
    "AWS Solutions Architect",
    "Azure Developer Associate",
    "Kotlin for Java Developers",
    "PRINCE2",
    "Professional Scrum Master I",
    "ISTQB CTFL Agile",
  ];
  const featuredPositions = featuredNames.map((name) =>
    html.indexOf(`>${name}<`),
  );
  const secondaryAzureNames = [
    "Azure Fundamentals",
    "Azure Data Fundamentals",
    "Azure Data Scientist Associate",
    "Azure AI Fundamentals",
  ];
  const secondaryAzurePositions = secondaryAzureNames.map((name) =>
    html.indexOf(`>${name}<`),
  );

  // Assert
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.doesNotMatch(html, /aria-valuenow=/);
  assert.match(html, />Backend</);
  assert.match(html, />Cloud &amp; Platform</);
  assert.match(html, />APIs &amp; Integration</);
  assert.match(html, />Engineering Practice</);
  assert.match(html, /<details\b/);
  assert.match(html, /<summary\b/);
  assert.match(
    html,
    new RegExp(
      `<span data-certification-count(?:\\s[^>]*)?>${certificationCount}</span>`,
    ),
  );
  assert.ok(featuredPositions.every((position) => position >= 0));
  assert.deepEqual(
    featuredPositions,
    [...featuredPositions].sort((left, right) => left - right),
  );
  assert.ok(
    featuredPositions.every((position) => position < html.indexOf("<details")),
  );
  assert.deepEqual(
    secondaryAzurePositions,
    [...secondaryAzurePositions].sort((left, right) => left - right),
  );
  assert.ok(
    secondaryAzurePositions.every(
      (position) => position > html.indexOf("<details"),
    ),
  );
});

test("experience renders once in descending start-date order", async () => {
  // Arrange
  const [html, fileNames] = await Promise.all([
    readFile(homePageUrl, { encoding: "utf8" }),
    readdir(experienceContentUrl),
  ]);
  const entries = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".yml"))
      .map(async (fileName) => {
        const content = await readFile(
          new URL(fileName, experienceContentUrl),
          {
            encoding: "utf8",
          },
        );
        return {
          date: content.match(/^startDate:\s*(.+)$/m)?.[1] ?? "",
          heading: content.match(/^heading:\s*(.+)$/m)?.[1] ?? "",
        };
      }),
  );
  const expected = entries.sort((left, right) =>
    right.date.localeCompare(left.date),
  );

  // Act
  const positions = expected.map(({ heading }) => html.indexOf(`>${heading}<`));

  // Assert
  for (const { heading } of expected) {
    assert.equal(
      html.match(new RegExp(`>${escapeRegExp(heading)}<`, "g"))?.length ?? 0,
      1,
    );
  }
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  assert.doesNotMatch(html, />Timeline</);
});

test("consulting projects identify Sopra Steria", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });

  // Act
  const consultingLabels = html.match(
    />\s*Consulting project at Sopra Steria\s*</g,
  );

  // Assert
  assert.equal(consultingLabels?.length, 3);
});

test("project and certification links remain available", async () => {
  // Arrange
  const [html, projectSource, certificationFiles] = await Promise.all([
    readFile(homePageUrl, { encoding: "utf8" }),
    readFile(new URL("../src/data/projects.ts", import.meta.url), {
      encoding: "utf8",
    }),
    readdir(certificationContentUrl),
  ]);
  const certificationSources = await Promise.all(
    certificationFiles
      .filter((fileName) => fileName.endsWith(".yml"))
      .map((fileName) =>
        readFile(new URL(fileName, certificationContentUrl), {
          encoding: "utf8",
        }),
      ),
  );

  // Act
  const projectLinks = [
    ...projectSource.matchAll(/(?:repoUrl|liveUrl):\s*"([^"]+)"/g),
  ].map((match) => match[1]);
  const certificationLinks = certificationSources.map(
    (source) => source.match(/certificateLink:\s*"([^"]+)"/)?.[1] ?? "",
  );

  // Assert
  for (const link of [...projectLinks, ...certificationLinks]) {
    assert.ok(link);
    assert.ok(html.includes(`href="${link}"`), `Missing link: ${link}`);
  }
});

test("contact offers selectable popup booking types", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });

  // Act
  const bookingButtons = [
    ...html.matchAll(
      /<button\b[^>]*data-calnode-popup="intro-call"[^>]*>[\s\S]*?<\/button>/g,
    ),
  ];
  const consultingButtons = [
    ...html.matchAll(
      /<button\b[^>]*data-calnode-popup="consultation"[^>]*>[\s\S]*?<\/button>/g,
    ),
  ];
  const embedScripts = [
    ...html.matchAll(
      /<script\b[^>]*src="https:\/\/calendar\.halvorteigen\.no\/embed\.js"[^>]*><\/script>/g,
    ),
  ];

  // Assert
  assert.equal(bookingButtons.length, 2);
  assert.match(bookingButtons[0][0], /type="button"/);
  assert.match(bookingButtons[0][0], /aria-haspopup="dialog"/);
  assert.match(bookingButtons[0][0], />\s*Book a call\s*</);
  assert.equal(consultingButtons.length, 1);
  assert.match(consultingButtons[0][0], />\s*<span[^>]*>Technical consulting</);
  assert.match(html, /id="call-type-toggle"/);
  assert.match(html, /aria-controls="call-type-menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /30 minutes · Free/);
  assert.match(html, /1 hour · NOK 1,200/);
  assert.equal(embedScripts.length, 1);
  assert.match(embedScripts[0][0], /\basync(?:="")?/);
  assert.match(html, />\s*LinkedIn\s*</);
});

test("generated pages keep metadata, local fonts, and safe controls", async () => {
  // Arrange
  const pagePaths = [
    "../dist/index.html",
    "../dist/404.html",
    "../dist/privacy-policy/index.html",
  ];
  const pages = await Promise.all(
    pagePaths.map((pagePath) =>
      readFile(new URL(pagePath, import.meta.url), { encoding: "utf8" }),
    ),
  );
  const assetUrl = new URL("../dist/_astro/", import.meta.url);
  const assetNames = await readdir(assetUrl);
  const styles = await Promise.all(
    assetNames
      .filter((name) => name.endsWith(".css"))
      .map((name) => readFile(new URL(name, assetUrl), { encoding: "utf8" })),
  );

  // Act
  const homeHtml = pages[0];
  const combinedOutput = [...pages, ...styles].join("\n");
  const controls = [
    ...homeHtml.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi),
  ];

  // Assert
  for (const html of pages) {
    assert.match(
      html,
      /<link rel="canonical" href="https:\/\/halvorteigen\.no/,
    );
    assert.match(
      html,
      /property="og:image" content="https:\/\/halvorteigen\.no/,
    );
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
  }
  for (const control of controls) {
    assert.doesNotMatch(control[2], /<(?:a|button)\b/i);
  }
  assert.match(combinedOutput, /Manrope Variable/);
  assert.match(combinedOutput, /:focus-visible/);
  assert.match(combinedOutput, /prefers-reduced-motion/);
  assert.match(combinedOutput, /\.interactive-target\{[^}]*min-height:44px/);
  assert.match(homeHtml, /bg-primary text-on-accent/);
  assert.doesNotMatch(
    combinedOutput,
    /fonts\.(?:googleapis|gstatic)\.com|use\.typekit\.net/i,
  );
});

test("analytics remains consent controlled", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });
  const consentScript = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .find((script) => script.includes("grantAnalyticsConsent"));
  const appendedScripts = [];
  const expiredCookies = [];
  const document = {
    cookie: "_ga=existing; cookie-consent=denied",
    head: { append: (script) => appendedScripts.push(script) },
    querySelector: () => null,
    createElement: () => ({ dataset: {} }),
  };
  Object.defineProperty(document, "cookie", {
    get: () => "_ga=existing; cookie-consent=denied",
    set: (cookie) => expiredCookies.push(cookie),
  });
  const window = {
    dataLayer: [],
    location: { hostname: "www.halvorteigen.no", protocol: "https:" },
  };

  // Act
  const hasNoScriptTracker = /<noscript>[\s\S]*googletagmanager/i.test(html);
  const hasStaticTagManagerScript =
    /<script[^>]+src="https:\/\/www\.googletagmanager\.com/i.test(html);
  vm.runInNewContext(consentScript, { document, window, Date });
  const scriptsBeforeConsent = appendedScripts.length;
  window.grantAnalyticsConsent();

  // Assert
  assert.ok(consentScript);
  assert.equal(hasNoScriptTracker, false);
  assert.equal(hasStaticTagManagerScript, false);
  assert.equal(scriptsBeforeConsent, 0);
  assert.equal(appendedScripts.length, 1);
  assert.match(appendedScripts[0].src, /^https:\/\/www\.googletagmanager\.com/);
  assert.ok(expiredCookies.some((cookie) => cookie.startsWith("_ga=;")));
  assert.match(html, /grantAnalyticsConsent/);
  assert.match(html, /id="cookie-banner"/);
  assert.match(html, /id="decline-cookies"/);
  assert.match(html, /id="accept-cookies"/);
});

test("light-mode hero uses semantic light tokens for readable copy", async () => {
  // Arrange
  const [hero, styles] = await Promise.all([
    readFile(heroComponentUrl, { encoding: "utf8" }),
    readFile(globalStylesUrl, { encoding: "utf8" }),
  ]);

  // Act
  const lightThemeBlock = styles.match(
    /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/,
  )?.[1];
  const systemLightBlock = styles.match(
    /@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme\]\)\s*\{([\s\S]*?)\n\s*\}/,
  )?.[1];

  // Assert
  assert.match(lightThemeBlock, /--hero-text:\s*#172033;/);
  assert.match(lightThemeBlock, /--hero-text-muted:\s*#4b5b6c;/);
  assert.match(systemLightBlock, /--hero-text:\s*#172033;/);
  assert.match(systemLightBlock, /--hero-text-muted:\s*#4b5b6c;/);
  assert.match(hero, /\.hero-name\s*\{[\s\S]*?color: var\(--hero-text\);/);
  assert.match(
    hero,
    /class="mt-7 text-xl font-semibold text-hero-text sm:text-2xl"/,
  );
  assert.match(
    hero,
    /class="text-hero-text-muted mt-5 max-w-\[38rem\] leading-7"/,
  );
  assert.match(hero, /<strong class="text-hero-text font-semibold">/);
});

test("light-mode hero replaces the dark photo treatment with a branded gradient", async () => {
  // Arrange
  const [hero, styles] = await Promise.all([
    readFile(heroComponentUrl, { encoding: "utf8" }),
    readFile(globalStylesUrl, { encoding: "utf8" }),
  ]);

  // Act
  const lightThemeBlock = styles.match(
    /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/,
  )?.[1];
  const systemLightBlock = styles.match(
    /@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme\]\)\s*\{([\s\S]*?)\n\s*\}/,
  )?.[1];

  // Assert
  for (const lightTokens of [lightThemeBlock, systemLightBlock]) {
    assert.match(lightTokens, /--hero-background:\s*linear-gradient\(/);
    assert.match(lightTokens, /--hero-image-opacity:\s*0;/);
    assert.match(lightTokens, /--hero-overlay:\s*none;/);
    assert.match(lightTokens, /--hero-mobile-overlay:\s*none;/);
  }
  assert.match(hero, /background:\s*var\(--hero-background\);/);
  assert.match(hero, /opacity:\s*var\(--hero-image-opacity\);/);
  assert.match(hero, /background:\s*var\(--hero-overlay\);/);
  assert.match(hero, /background:\s*var\(--hero-mobile-overlay\);/);
});

test("theme toggle stays with the site identity instead of competing with Download CV", async () => {
  // Arrange
  const navigation = await readFile(navigationComponentUrl, {
    encoding: "utf8",
  });

  // Assert
  assert.match(
    navigation,
    /<div class="flex items-center gap-1">\s*<a[\s\S]*?aria-label="Halvor Ødegård Teigen, home"[\s\S]*?<\/a>\s*<button\s*id="theme-toggle"/,
  );
  assert.match(
    navigation,
    /id="theme-toggle"[\s\S]*?class="interactive-target text-light-accent hover:bg-light\/8 inline-flex h-11 items-center justify-center rounded-lg transition-colors"[\s\S]*?aria-label="Theme: choose light or dark appearance"[\s\S]*?aria-pressed="false"/,
  );
  assert.match(
    navigation,
    /<div class="hidden items-center gap-1 lg:flex">[\s\S]*?Download CV[\s\S]*?<\/div>/,
  );
  assert.doesNotMatch(
    navigation,
    /<div class="flex items-center gap-1">\s*<button\s*id="theme-toggle"[\s\S]*?id="menu-btn"/,
  );
});

test("primary controls and the hero kicker retain contrast in light mode", async () => {
  // Arrange
  const primaryControlComponentUrls = [
    new URL("../src/layouts/MainLayout.astro", import.meta.url),
    new URL("../src/components/Footer.astro", import.meta.url),
    navigationComponentUrl,
    heroComponentUrl,
    new URL("../src/components/CookieConsent.astro", import.meta.url),
  ];
  const [styles, hero, ...primaryControlComponents] = await Promise.all([
    readFile(globalStylesUrl, { encoding: "utf8" }),
    readFile(heroComponentUrl, { encoding: "utf8" }),
    ...primaryControlComponentUrls.map((url) =>
      readFile(url, { encoding: "utf8" }),
    ),
  ]);
  const lightThemeBlock = styles.match(
    /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/,
  )?.[1];
  const systemLightBlock = styles.match(
    /@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme\]\)\s*\{([\s\S]*?)\n\s*\}/,
  )?.[1];

  // Act
  const primaryControls = primaryControlComponents.flatMap((component) =>
    [...component.matchAll(/class="[^"]*\bbg-primary\b[^"]*"/g)].map(
      (match) => match[0],
    ),
  );

  // Assert
  assert.match(styles, /--on-accent:\s*#(?:fff|ffffff);/i);
  assert.match(styles, /--color-on-accent:\s*var\(--on-accent\);/);
  for (const lightTokens of [lightThemeBlock, systemLightBlock]) {
    assert.match(lightTokens, /--accent:\s*#c64b0c;/i);
    assert.match(lightTokens, /--accent-hover:\s*#b8400c;/i);
  }
  assert.doesNotMatch(lightThemeBlock, /--on-accent:/);
  assert.doesNotMatch(systemLightBlock, /--on-accent:/);
  assert.equal(primaryControls.length, 7);
  for (const control of primaryControls) {
    assert.match(control, /\btext-on-accent\b/);
    assert.doesNotMatch(control, /\btext-dark\b/);
  }
  assert.match(styles, /--hero-accent:\s*#f97316;/i);
  assert.match(styles, /--color-hero-accent:\s*var\(--hero-accent\);/);
  assert.match(lightThemeBlock, /--hero-accent:\s*#c64b0c;/i);
  assert.match(systemLightBlock, /--hero-accent:\s*#c64b0c;/i);
  assert.match(hero, /class="section-kicker hero-kicker"/);
  assert.match(
    hero,
    /\.hero-kicker\s*\{[\s\S]*?color:\s*var\(--hero-accent\);/,
  );
});

test("theme preference applies a saved choice before rendering", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });
  const themeScript = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .find((script) => script.includes("theme-preference"));
  const document = { documentElement: { dataset: {} } };
  const localStorage = {
    getItem: () => "light",
    setItem() {},
  };

  // Act
  vm.runInNewContext(themeScript, { document, localStorage, window: {} });

  // Assert
  assert.equal(document.documentElement.dataset.theme, "light");
});
