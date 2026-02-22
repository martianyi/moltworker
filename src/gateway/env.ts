import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the OpenClaw container process.
 * Worker keeps MOLTBOT_* names for compatibility; container receives OPENCLAW_* names.
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Pass through GitHub token for OpenClaw integrations
  if (env.GITHUB_TOKEN) envVars.GITHUB_TOKEN = env.GITHUB_TOKEN;

  // Cloudflare AI Gateway configuration (native provider mode)
  if (env.CLOUDFLARE_AI_GATEWAY_API_KEY) {
    envVars.CLOUDFLARE_AI_GATEWAY_API_KEY = env.CLOUDFLARE_AI_GATEWAY_API_KEY;
  }
  if (env.CF_AI_GATEWAY_ACCOUNT_ID) {
    envVars.CF_AI_GATEWAY_ACCOUNT_ID = env.CF_AI_GATEWAY_ACCOUNT_ID;
  }
  if (env.CF_AI_GATEWAY_GATEWAY_ID) {
    envVars.CF_AI_GATEWAY_GATEWAY_ID = env.CF_AI_GATEWAY_GATEWAY_ID;
  }

  // Direct provider keys
  if (env.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  if (env.OPENAI_API_KEY) envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;

  // Optional Moonshot (Kimi) provider env passthrough
  if (env.MOONSHOT_API_KEY) {
    envVars.MOONSHOT_API_KEY = env.MOONSHOT_API_KEY;
    envVars.MOONSHOT_BASE_URL =
      env.MOONSHOT_BASE_URL?.replace(/\/+$/, '') || 'https://api.moonshot.cn/v1';
  }

  // Legacy AI Gateway support: AI_GATEWAY_BASE_URL + AI_GATEWAY_API_KEY
  // When set, these override direct keys for backward compatibility.
  if (env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_BASE_URL) {
    const normalizedBaseUrl = env.AI_GATEWAY_BASE_URL.replace(/\/+$/, '');
    envVars.AI_GATEWAY_BASE_URL = normalizedBaseUrl;
    // Legacy path routes through Anthropic base URL
    envVars.ANTHROPIC_BASE_URL = normalizedBaseUrl;
    envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
  } else if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }

  // Map MOLTBOT_GATEWAY_TOKEN to OPENCLAW_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.OPENCLAW_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.OPENCLAW_DEV_MODE = env.DEV_MODE;

  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.OPENCLAW_TELEGRAM_ALLOWED_USERS) {
    envVars.TELEGRAM_DM_POLICY = 'allowlist';
    envVars.TELEGRAM_DM_ALLOW_FROM = env.OPENCLAW_TELEGRAM_ALLOWED_USERS;
  }

  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.DISCORD_DM_ALLOW_FROM) envVars.DISCORD_DM_ALLOW_FROM = env.DISCORD_DM_ALLOW_FROM;

  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;

  if (env.CF_AI_GATEWAY_MODEL) envVars.CF_AI_GATEWAY_MODEL = env.CF_AI_GATEWAY_MODEL;
  if (env.CF_ACCOUNT_ID) envVars.CF_ACCOUNT_ID = env.CF_ACCOUNT_ID;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  // R2 persistence credentials (used by rclone in start-openclaw.sh)
  if (env.R2_ACCESS_KEY_ID) envVars.R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
  if (env.R2_SECRET_ACCESS_KEY) envVars.R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
  if (env.R2_BUCKET_NAME) envVars.R2_BUCKET_NAME = env.R2_BUCKET_NAME;

  return envVars;
}
