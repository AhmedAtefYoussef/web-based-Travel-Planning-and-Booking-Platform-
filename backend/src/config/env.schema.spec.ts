import { validateEnv } from './env.schema';

const base = {
  MONGODB_URI: 'mongodb://localhost:27017/travel',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults, including PLATFORM_CURRENCY=USD', () => {
    const env = validateEnv({ ...base });
    expect(env.PLATFORM_CURRENCY).toBe('USD');
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.COOKIE_SECURE).toBe(false);
    expect(env.SESSION_IDLE_MINUTES).toBe(30);
  });

  it('treats empty values as unset so defaults apply', () => {
    const env = validateEnv({ ...base, PORT: '', PLATFORM_CURRENCY: '' });
    expect(env.PORT).toBe(3000);
    expect(env.PLATFORM_CURRENCY).toBe('USD');
    expect(() => validateEnv({ ...base, MONGODB_URI: '' })).toThrow(
      /MONGODB_URI/,
    );
  });

  it('fails fast listing every missing required variable', () => {
    expect(() => validateEnv({})).toThrow(/MONGODB_URI.*JWT_SECRET/);
  });

  it('rejects an invalid ISO 4217 platform currency', () => {
    expect(() => validateEnv({ ...base, PLATFORM_CURRENCY: 'ZZZ' })).toThrow(
      /PLATFORM_CURRENCY/,
    );
    expect(() => validateEnv({ ...base, PLATFORM_CURRENCY: 'US' })).toThrow(
      /PLATFORM_CURRENCY/,
    );
  });

  it('normalises and accepts a valid currency', () => {
    expect(
      validateEnv({ ...base, PLATFORM_CURRENCY: 'eur' }).PLATFORM_CURRENCY,
    ).toBe('EUR');
  });

  it('requires Stripe secrets in production only', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET/,
    );
    expect(() => validateEnv({ ...base, NODE_ENV: 'test' })).not.toThrow();
  });

  it('does not echo secret values in the error', () => {
    const secret = 'not-a-stripe-key-value';
    let message = '';
    try {
      validateEnv({ ...base, STRIPE_SECRET_KEY: secret });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain('STRIPE_SECRET_KEY');
    expect(message).not.toContain(secret);
  });
});
