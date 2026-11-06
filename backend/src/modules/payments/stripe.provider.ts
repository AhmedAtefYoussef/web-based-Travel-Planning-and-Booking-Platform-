import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/** DI token for the Stripe SDK client; tests override it with a mock. */
export const STRIPE_CLIENT = 'STRIPE_CLIENT';

/** Used only outside production so the app can boot without Stripe; every call fails at Stripe. */
const UNCONFIGURED_KEY = 'sk_test_not_configured';

export const stripeProvider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Stripe => {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    if (key) return new Stripe(key);
    if (config.get<string>('NODE_ENV') === 'production') {
      throw new Error('STRIPE_SECRET_KEY is required in production');
    }
    new Logger('StripeProvider').warn(
      'STRIPE_SECRET_KEY is not set: payments are disabled (every Stripe call will fail)',
    );
    return new Stripe(UNCONFIGURED_KEY);
  },
};
