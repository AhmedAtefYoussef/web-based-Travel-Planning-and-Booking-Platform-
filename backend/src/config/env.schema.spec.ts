import { validateEnv } from './env.schema';

const base = {
  NODE_ENV: 'development',
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

  it('accepts the Atlas SRV and multi-host standard connection strings', () => {
    const uris = [
      'mongodb+srv://<user>:<password>@travel-cluster.abc.mongodb.net/travel_platform?retryWrites=true&w=majority',
      'mongodb://<user>:<password>@h-00.abc.mongodb.net:27017,h-01.abc.mongodb.net:27017,h-02.abc.mongodb.net:27017/travel_platform?ssl=true&authSource=admin&replicaSet=atlas-x-shard-0',
    ];
    for (const MONGODB_URI of uris) {
      expect(validateEnv({ ...base, MONGODB_URI }).MONGODB_URI).toBe(
        MONGODB_URI,
      );
    }
  });

  it('rejects MONGODB_URI values that are not MongoDB connection strings', () => {
    for (const MONGODB_URI of [
      'postgres://localhost:5432/db',
      'mongodb://',
      'mongodb+srv://<user>:<password>@',
      'mongodb://host:27017/db with space',
    ]) {
      expect(() => validateEnv({ ...base, MONGODB_URI })).toThrow(
        /MONGODB_URI/,
      );
    }
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

  describe('fails closed for unsafe production settings [TRVL-130]', () => {
    const prod = {
      ...base,
      NODE_ENV: 'production',
      COOKIE_SECURE: 'true',
      STRIPE_SECRET_KEY: 'sk_test_x',
      STRIPE_WEBHOOK_SECRET: 'whsec_x',
    };

    it('accepts a safe production configuration', () => {
      const env = validateEnv(prod);
      expect(env.COOKIE_SECURE).toBe(true);
      expect(env.STRIPE_ALLOW_LIVE_KEYS).toBe(false);
    });

    it('missing NODE_ENV throws outside the test bootstrap', () => {
      const withoutNodeEnv: Record<string, unknown> = { ...base };
      delete withoutNodeEnv.NODE_ENV;
      expect(() => validateEnv(withoutNodeEnv)).toThrow(/NODE_ENV/);
      expect(() => validateEnv({ ...base, NODE_ENV: '' })).toThrow(/NODE_ENV/);
    });

    it.each(['sk_live_x', 'rk_live_x'])(
      'rejects live Stripe key %s unless STRIPE_ALLOW_LIVE_KEYS=true',
      (key) => {
        for (const NODE_ENV of ['development', 'test', 'production']) {
          expect(() =>
            validateEnv({ ...prod, NODE_ENV, STRIPE_SECRET_KEY: key }),
          ).toThrow(/STRIPE_SECRET_KEY/);
        }
        expect(
          validateEnv({
            ...prod,
            STRIPE_SECRET_KEY: key,
            STRIPE_ALLOW_LIVE_KEYS: 'true',
          }).STRIPE_SECRET_KEY,
        ).toBe(key);
      },
    );

    it('does not echo a rejected live key in the error', () => {
      const key = 'sk_live_do_not_print';
      let message = '';
      try {
        validateEnv({ ...prod, STRIPE_SECRET_KEY: key });
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toContain('STRIPE_SECRET_KEY');
      expect(message).not.toContain(key);
    });

    it('production with COOKIE_SECURE=false throws', () => {
      expect(() => validateEnv({ ...prod, COOKIE_SECURE: 'false' })).toThrow(
        /COOKIE_SECURE/,
      );
      const unset: Record<string, unknown> = { ...prod };
      delete unset.COOKIE_SECURE;
      expect(() => validateEnv(unset)).toThrow(/COOKIE_SECURE/);
    });

    it('production with DEV_AUTH_ENABLED=true throws', () => {
      expect(() => validateEnv({ ...prod, DEV_AUTH_ENABLED: 'true' })).toThrow(
        /DEV_AUTH_ENABLED/,
      );
    });
  });
});
