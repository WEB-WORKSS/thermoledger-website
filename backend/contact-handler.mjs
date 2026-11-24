// AWS Lambda (Node.js 20+) behind an API Gateway HTTP API: POST /contact
// Stores each early-access request in DynamoDB and emails a notification through Amazon SES.
// Env: TABLE_NAME, NOTIFY_TO (your business inbox), NOTIFY_FROM (an SES-verified address on your domain), ALLOWED_ORIGIN (https://www.yourdomain)
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { randomUUID } from 'node:crypto';

const db = new DynamoDBClient({});
const ses = new SESv2Client({});
const FIELDS = ['name', 'email', 'company', 'role', 'segment', 'plan', 'volume', 'message'];
const headers = { 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') return reply(204, {});
  let data;
  try { data = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body || '{}'); } catch { return reply(400, { error: 'Invalid JSON' }); }
  if (data.website) return reply(200, { ok: true }); // honeypot: silently drop bots
  const clean = Object.fromEntries(FIELDS.map((k) => [k, String(data[k] ?? '').trim().slice(0, k === 'message' ? 4000 : 200)]));
  if (!clean.name || !clean.company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || data.consent !== 'yes') return reply(422, { error: 'Missing or invalid fields' });

  const id = randomUUID(), at = new Date().toISOString();
  await db.send(new PutItemCommand({ TableName: process.env.TABLE_NAME, Item: Object.fromEntries([['id', { S: id }], ['createdAt', { S: at }], ...FIELDS.filter((k) => clean[k]).map((k) => [k, { S: clean[k] }])]) }));
  if (process.env.NOTIFY_TO && process.env.NOTIFY_FROM) {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: process.env.NOTIFY_FROM, Destination: { ToAddresses: [process.env.NOTIFY_TO] }, ReplyToAddresses: [clean.email],
      Content: { Simple: { Subject: { Data: `Early access request: ${clean.company}` }, Body: { Text: { Data: FIELDS.map((k) => `${k}: ${clean[k]}`).join('\n') + `\n\nid: ${id}\nreceived: ${at}` } } } }
    }));
  }
  return reply(200, { ok: true });
};
