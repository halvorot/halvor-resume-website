import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("home page keeps its content and landmark contract", async () => {
  // Arrange
  const html = await readFile(new URL("../dist/index.html", import.meta.url), {
    encoding: "utf8",
  });

  // Act
  const mainCount = html.match(/<main(?:\s|>)/g)?.length ?? 0;

  // Assert
  assert.equal(mainCount, 1);
  assert.match(html, /id="capabilities"/);
  assert.match(html, /id="experience"/);
  assert.match(html, /id="personal-projects"/);
  assert.match(html, /Hi, I(?:&#39;|')m/);
});

test("every generated page has canonical social metadata", async () => {
  // Arrange
  const pagePaths = [
    "../dist/index.html",
    "../dist/404.html",
    "../dist/privacy-policy/index.html",
  ];

  // Act
  const pages = await Promise.all(
    pagePaths.map((pagePath) =>
      readFile(new URL(pagePath, import.meta.url), { encoding: "utf8" }),
    ),
  );

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
});

test("generated links do not contain nested interactive controls", async () => {
  // Arrange
  const html = await readFile(new URL("../dist/index.html", import.meta.url), {
    encoding: "utf8",
  });

  // Act
  const nestedControl = /<button\b[^>]*>\s*<a\b/i.test(html);

  // Assert
  assert.equal(nestedControl, false);
});

test("analytics loads only through the consent-controlled script", async () => {
  // Arrange
  const html = await readFile(new URL("../dist/index.html", import.meta.url), {
    encoding: "utf8",
  });

  // Act
  const hasNoScriptTracker = /<noscript>[\s\S]*googletagmanager/i.test(html);
  const hasConsentApi = html.includes("grantAnalyticsConsent");

  // Assert
  assert.equal(hasNoScriptTracker, false);
  assert.equal(hasConsentApi, true);
});

test("home page keeps its responsive visual contract", async () => {
  // Arrange
  const assetsUrl = new URL("../dist/_astro/", import.meta.url);
  const assetNames = await readdir(assetsUrl);
  const cssName = assetNames.find((name) => name.endsWith(".css"));
  assert.ok(cssName);

  // Act
  const [html, css] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), {
      encoding: "utf8",
    }),
    readFile(new URL(cssName, assetsUrl), { encoding: "utf8" }),
  ]);

  // Assert
  assert.match(html, /--section-background-opacity: 0\.2/);
  assert.match(html, /--section-background-opacity: 0\.15/);
  assert.match(html, /--section-background-opacity: 0\.22/);
  assert.match(html, /isolation:isolate/);
  assert.match(html, /md:grid-cols-2/);
  assert.match(html, /lg:hidden/);
  assert.match(css, /--color-dark-blue:#111724/);
  assert.match(css, /@media \(width>=48rem\)/);
  assert.match(css, /@media \(width>=64rem\)/);
});
