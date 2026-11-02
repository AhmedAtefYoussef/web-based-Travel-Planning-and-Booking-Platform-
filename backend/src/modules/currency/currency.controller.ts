import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrencyService } from './currency.service';

@ApiTags('currency')
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currency: CurrencyService) {}

  @Public()
  @Get()
  async list() {
    return { items: await this.currency.supportedCurrencies() };
  }

  @Public()
  @Get('rates')
  rates() {
    return this.currency.getRatesView();
  }
}
