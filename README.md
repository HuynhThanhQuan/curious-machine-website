# Curious Machine — official website

The official website of Curious Machine. This repository replaces the archived
[`landing_page`](https://github.com/HuynhThanhQuan/landing_page) repo (full history kept).

Applied Data & AI public site: English/Vietnamese home, eleven experiment packages,
three field notes and collaboration/contact information. Next.js static export.
See [DELIVERY.md](DELIVERY.md) for scope, checks, language policy and limitations.

## Local preview

```bash
npm ci
npm run lint
npm run build
python3 -m http.server 3031 --bind 127.0.0.1 --directory out
```

Open [localhost:3031](http://127.0.0.1:3031/). For editing use `npm run dev`.
Run `npm run smoke` after `npm run build` to check the export.

## Edit content

- Home sections: `src/components/home/`; shared copy: `src/lib/content.ts`; notes: `src/lib/notes.ts`. Styles: `src/styles/lab/`. Motion primitives: `src/components/motion/`.
- Fonts are system fonts; no remote font request at build or runtime.
- From the umbrella root, `node scripts/publish-labs.mjs` refreshes the public lab
  packages in both sites. Rebuild afterward. No Studio data is included.

## Publish separately

Only `out/` should be served publicly. The existing `deploy.sh` publishes to the VPS;
run it only when the release is approved. This local release did not deploy anything.

CI checks lint, build, types and the smoke script. It has no deployment step and needs no secrets.
