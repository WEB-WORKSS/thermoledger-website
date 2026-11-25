# ThermoLedger website

Static, multi-page company website with an in-browser demo on sample data. No framework, no dependencies: Node 18+ only.

```
node build.mjs
```

- `dist/` is the deployable site, with clean URLs (`/product/`, `/demo/shipments/demo-s102/`, `/404.html`).
- `preview/` is the same site with relative links, so it opens straight from disk.

## Edit company facts in one place

Everything company-specific lives in `src/config.mjs`. The build prints a warning for every required field that is still empty. **Fill these in before you publish:**

| Field | Where it shows up |
|---|---|
| `domain` | Canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt`, structured data |
| `email` (on the same domain) | Footer, contact page, security page, legal pages, form fallback |
| `legalName`, `country` | Copyright line, Privacy Policy, Terms (governing law), structured data |
| `team` | `/about#team` leadership section (omitted while empty) |
| `formEndpoint` | Contact form submission (see backend below) |
| `linkedin`, `address` | Footer, About page, structured data (optional) |

Pricing is shown as **proposed**. When it is confirmed, set `pricingConfirmed = true` and update `PLANS` in `src/content.mjs`.

## Structure

```
build.mjs              generates dist/ and preview/
src/config.mjs         company facts (single source of truth)
src/layout.mjs         page shell: header, nav, footer, SEO, JSON-LD
src/content.mjs        features, segments, sources, comparison, plans, FAQ, product visuals
src/pages.mjs          /, /product, /how-it-works, /solutions, /technology, /security, /pricing, /about, /contact
src/other.mjs          /privacy, /terms, 404, /demo pages
src/assets/            site.css, site.js, demo-core.js (sample data + scoring rules), demo.js (demo UI)
backend/               contact-form Lambda + CloudFront clean-URL function
```

## Deploying on Vercel

`vercel.json` tells Vercel to run `node build.mjs` and serve `dist/`. No other settings are needed. Every push to `main` redeploys.

## Deploying on AWS (S3 + CloudFront)

1. Create a private S3 bucket and upload the contents of `dist/`.
2. Create a CloudFront distribution with that bucket as the origin (Origin Access Control), an ACM certificate for `www.yourdomain` and `yourdomain`, and default root object `index.html`.
3. Attach `backend/cloudfront-clean-urls.js` as a viewer-request CloudFront Function.
4. Add custom error responses so 403 and 404 return `/404.html` with status 404.
5. Point DNS (Route 53 or your registrar) at the distribution, and redirect the apex domain to `www`.

Amplify Hosting, Netlify or Vercel also work with `dist/` as-is. They resolve `/product/` to `product/index.html` without the function.

## Contact form backend

`backend/contact-handler.mjs` is a Lambda for an API Gateway HTTP API route `POST /contact`. It validates the form, stores each request in DynamoDB and emails you through Amazon SES.

1. Create a DynamoDB table with partition key `id` (String).
2. Verify your domain in SES and move SES out of sandbox mode, or verify the recipient address.
3. Create the Lambda (Node.js 20) with env `TABLE_NAME`, `NOTIFY_TO`, `NOTIFY_FROM` and `ALLOWED_ORIGIN=https://www.yourdomain`. Give it `dynamodb:PutItem` on the table and `ses:SendEmail`.
4. Create an HTTP API with route `POST /contact` pointing at the Lambda. Enable CORS for your origin and set throttling.
5. Put the route's URL in `formEndpoint` and rebuild.

Until `formEndpoint` (or `email`) is set, the form validates input but tells visitors that online submission is unavailable. It never pretends to send.
