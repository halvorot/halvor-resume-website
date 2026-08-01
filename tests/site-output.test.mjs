import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const homePageUrl = new URL("../dist/index.html", import.meta.url);
const certificationContentUrl = new URL(
  "../src/content/certifications/",
  import.meta.url,
);
const experienceContentUrl = new URL(
  "../src/content/experience/",
  import.meta.url,
);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("home page keeps ordered landmarks and editorial content", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });
  const requiredIds = ["capabilities", "experience", "personal-projects"];

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
  assert.match(html, />Contact on LinkedIn</);
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
  assert.match(html, />Cloud &amp; Platform Interests</);
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
  assert.match(homeHtml, /bg-primary text-dark/);
  assert.doesNotMatch(
    combinedOutput,
    /fonts\.(?:googleapis|gstatic)\.com|use\.typekit\.net/i,
  );
});

test("analytics remains consent controlled", async () => {
  // Arrange
  const html = await readFile(homePageUrl, { encoding: "utf8" });

  // Act
  const hasNoScriptTracker = /<noscript>[\s\S]*googletagmanager/i.test(html);
  const hasStaticTagManagerScript =
    /<script[^>]+src="https:\/\/www\.googletagmanager\.com/i.test(html);

  // Assert
  assert.equal(hasNoScriptTracker, false);
  assert.equal(hasStaticTagManagerScript, false);
  assert.match(html, /grantAnalyticsConsent/);
  assert.match(html, /id="cookie-banner"/);
  assert.match(html, /id="decline-cookies"/);
  assert.match(html, /id="accept-cookies"/);
});
