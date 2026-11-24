// ThermoLedger — the single source of company facts for every page, the metadata and the structured data.
// Leave a field empty ('' or []) when it is not verified: the build then leaves that content out.

export const site = {
  name: 'ThermoLedger',
  tagline: 'Protect Every Shipment. Predict Every Risk.',
  industry: 'Logistics technology · Cold-chain intelligence software',
  founded: 2026,

  // REQUIRED BEFORE PUBLISHING — fill these with verified values.
  domain: '',            // e.g. 'thermoledger.com' (no protocol, no www). Must match the email domain.
  email: '',             // e.g. 'hello@thermoledger.com'
  legalName: '',         // registered entity name, e.g. 'ThermoLedger Ltd'
  country: '',           // country of registration, e.g. 'United Kingdom'
  address: '',           // business address, only if it may be published
  linkedin: '',          // company page URL once created

  // Contact form: POST endpoint of the API Gateway route backed by backend/contact-handler.mjs
  formEndpoint: '',

  // Leadership — only real people with their consent. Empty = team section omitted.
  team: [
    // { name: 'Full Name', title: 'Founder & CEO', linkedin: 'https://www.linkedin.com/in/...', photo: 'assets/team/name.jpg', bio: 'One or two verified sentences.' }
  ],

  stage: 'In development · Now accepting pilot partners',
  stageShort: 'In development',
  size: '2–10 employees',

  description: 'ThermoLedger is cold-chain risk intelligence software in development. It turns temperature telemetry, transit time, route conditions and incident history into a spoilage-risk score for each shipment, with explained alerts, incident summaries and recommended actions for a person to approve.',

  positioning: 'ThermoLedger turns cold-chain temperature data into a spoilage-risk score for each shipment, so quality and logistics teams at pharmaceutical distributors, food producers and cold-storage operators can act while product can still be saved.'
};

// Pricing is NOT confirmed. Shown on the site as proposed pricing.
export const pricingConfirmed = false;
