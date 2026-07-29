# Halvor Teigen Resume Website

Static resume and portfolio site built with Astro and Tailwind CSS.

## Development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Run the full local quality gate before submitting changes:

```sh
npm run validate
```

## Structure

- `src/components`: reusable Astro presentation and interaction components
- `src/config`: site-wide identity, metadata, and external links
- `src/content`: schema-validated certification and experience entries
- `src/data`: typed navigation, capability, and project data
- `src/layouts`: shared page shell
- `src/pages`: route entry points
- `tests`: generated-site contract tests

The site is deployed to GitHub Pages from `main`.

## Live site

[halvorteigen.no](https://halvorteigen.no)
