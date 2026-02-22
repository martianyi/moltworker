import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    const result = buildEnvVars(env);
    expect(result).toEqual({});
  });

  it('includes ANTHROPIC_API_KEY when set directly', () => {
    const env = createMockEnv({ ANTHROPIC_API_KEY: 'sk-test-key' });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-test-key');
  });

  it('includes OPENAI_API_KEY when set directly', () => {
    const env = createMockEnv({ OPENAI_API_KEY: 'sk-openai-key' });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-openai-key');
  });

  it('includes GITHUB_TOKEN when set', () => {
    const env = createMockEnv({ GITHUB_TOKEN: 'ghp_test_token' });
    const result = buildEnvVars(env);
    expect(result.GITHUB_TOKEN).toBe('ghp_test_token');
  });

  it('includes MOONSHOT_API_KEY and default MOONSHOT_BASE_URL when set', () => {
    const env = createMockEnv({ MOONSHOT_API_KEY: 'sk-moonshot-key' });
    const result = buildEnvVars(env);
    expect(result.MOONSHOT_API_KEY).toBe('sk-moonshot-key');
    expect(result.MOONSHOT_BASE_URL).toBe('https://api.moonshot.cn/v1');
  });

  it('uses custom MOONSHOT_BASE_URL when set', () => {
    const env = createMockEnv({
      MOONSHOT_API_KEY: 'sk-key',
      MOONSHOT_BASE_URL: 'https://custom.moonshot.cn/v1/',
    });
    const result = buildEnvVars(env);
    expect(result.MOONSHOT_BASE_URL).toBe('https://custom.moonshot.cn/v1');
  });

  // Cloudflare AI Gateway (new native provider)
  it('passes Cloudflare AI Gateway env vars', () => {
    const env = createMockEnv({
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cf-gw-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'my-account-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'my-gateway-id',
    });
    const result = buildEnvVars(env);
    expect(result.CLOUDFLARE_AI_GATEWAY_API_KEY).toBe('cf-gw-key');
    expect(result.CF_AI_GATEWAY_ACCOUNT_ID).toBe('my-account-id');
    expect(result.CF_AI_GATEWAY_GATEWAY_ID).toBe('my-gateway-id');
  });

  it('passes Cloudflare AI Gateway alongside direct Anthropic key', () => {
    const env = createMockEnv({
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cf-gw-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'my-account-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'my-gateway-id',
      ANTHROPIC_API_KEY: 'sk-anthro',
    });
    const result = buildEnvVars(env);
    expect(result.CLOUDFLARE_AI_GATEWAY_API_KEY).toBe('cf-gw-key');
    expect(result.ANTHROPIC_API_KEY).toBe('sk-anthro');
  });

  // Legacy AI Gateway support
  it('maps legacy AI_GATEWAY_API_KEY to ANTHROPIC_API_KEY with base URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-gateway-key');
    expect(result.ANTHROPIC_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
    expect(result.AI_GATEWAY_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
  });

  it('legacy AI_GATEWAY_* overrides direct ANTHROPIC_API_KEY', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/anthropic',
      ANTHROPIC_API_KEY: 'direct-key',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('gateway-key');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/anthropic');
  });

  it('strips trailing slashes from legacy AI_GATEWAY_BASE_URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic///',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
  });

  it('falls back to ANTHROPIC_BASE_URL when no AI_GATEWAY_BASE_URL', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'direct-key',
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('direct-key');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://api.anthropic.com');
  });

  // Gateway token mapping
  it('maps MOLTBOT_GATEWAY_TOKEN to OPENCLAW_GATEWAY_TOKEN for container', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('my-token');
  });

  // Channel tokens
  it('includes all channel tokens when set', () => {
    const env = createMockEnv({
      TELEGRAM_BOT_TOKEN: 'tg-token',
      TELEGRAM_DM_POLICY: 'pairing',
      OPENCLAW_TELEGRAM_ALLOWED_USERS: '8184225710,123456789',
      DISCORD_BOT_TOKEN: 'discord-token',
      DISCORD_DM_POLICY: 'allowlist',
      DISCORD_DM_ALLOW_FROM: '111,222',
      SLACK_BOT_TOKEN: 'slack-bot',
      SLACK_APP_TOKEN: 'slack-app',
    });
    const result = buildEnvVars(env);

    expect(result.TELEGRAM_BOT_TOKEN).toBe('tg-token');
    expect(result.TELEGRAM_DM_POLICY).toBe('allowlist');
    expect(result.TELEGRAM_DM_ALLOW_FROM).toBe('8184225710,123456789');
    expect(result.DISCORD_BOT_TOKEN).toBe('discord-token');
    expect(result.DISCORD_DM_POLICY).toBe('allowlist');
    expect(result.DISCORD_DM_ALLOW_FROM).toBe('111,222');
    expect(result.SLACK_BOT_TOKEN).toBe('slack-bot');
    expect(result.SLACK_APP_TOKEN).toBe('slack-app');
  });

  it('maps DEV_MODE to OPENCLAW_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
    });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_DEV_MODE).toBe('true');
  });

  // AI Gateway model override
  it('passes CF_AI_GATEWAY_MODEL to container', () => {
    const env = createMockEnv({
      CF_AI_GATEWAY_MODEL: 'workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    });
    const result = buildEnvVars(env);
    expect(result.CF_AI_GATEWAY_MODEL).toBe('workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  });

  it('passes CF_ACCOUNT_ID to container', () => {
    const env = createMockEnv({ CF_ACCOUNT_ID: 'acct-123' });
    const result = buildEnvVars(env);
    expect(result.CF_ACCOUNT_ID).toBe('acct-123');
  });

  it('combines all env vars correctly', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-key',
      MOLTBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
    const result = buildEnvVars(env);

    expect(result).toEqual({
      ANTHROPIC_API_KEY: 'sk-key',
      OPENCLAW_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });
});
