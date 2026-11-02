import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsMongoId } from 'class-validator';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser, Public } from '../../common/decorators';
import { BookingType } from '../../common/contracts/booking.contract';
import { type AuthUser, Role } from '../../common/contracts/auth.contract';
import { BookingPoliciesService } from './booking-policies.service';
import { PaymentsService } from './payments.service';
import { RefundsService } from './refunds.service';

export enum UrlBookingType {
  flight = 'flight',
  hotel = 'hotel',
}
const toType = (t: UrlBookingType) =>
  t === UrlBookingType.flight ? BookingType.FLIGHT : BookingType.HOTEL;

export class AcceptPoliciesDto {
  @IsBoolean() accepted: boolean;
}

export class CreatePaymentDto {
  @IsEnum(BookingType) bookingType: BookingType;
  @IsMongoId() bookingId: string;
}

@ApiTags('bookings')
@Controller('bookings')
export class BookingPoliciesController {
  constructor(private readonly svc: BookingPoliciesService) {}

  @Get(':type/:id/policies')
  policies(
    @CurrentUser('id') userId: string,
    @Param('type', new ParseEnumPipe(UrlBookingType)) type: UrlBookingType,
    @Param('id') id: string,
  ) {
    return this.svc.getPolicies(userId, toType(type), id);
  }

  @Post(':type/:id/accept-policies')
  @HttpCode(200)
  accept(
    @CurrentUser('id') userId: string,
    @Param('type', new ParseEnumPipe(UrlBookingType)) type: UrlBookingType,
    @Param('id') id: string,
    @Body() dto: AcceptPoliciesDto,
  ) {
    if (dto.accepted !== true) {
      throw new BadRequestException('accepted must be true');
    }
    return this.svc.accept(userId, toType(type), id);
  }
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    return this.payments.createForBooking(
      userId,
      dto.bookingType,
      dto.bookingId,
    );
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature'];
    await this.payments.handleWebhook(
      req.rawBody as Buffer,
      typeof sig === 'string' ? sig : '',
    );
    return { received: true };
  }

  @Post(':id/retry')
  retry(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.payments.retry(userId, id);
  }

  @Post(':id/test-confirm')
  @HttpCode(200)
  async testConfirm(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.payments.testConfirm(userId, id);
    return { confirmed: true };
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payments.getForUser(user.id, user.role === Role.ADMIN, id);
  }
}

@ApiTags('refunds')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const r = await this.refunds.findById(id);
    if (!r || (r.userId !== user.id && user.role !== Role.ADMIN)) {
      throw new NotFoundException('Refund not found');
    }
    return {
      id: r.id,
      bookingType: r.bookingType,
      bookingId: r.bookingId,
      amountMinor: r.amountMinor,
      currency: r.currency,
      reason: r.reason,
      status: r.status,
    };
  }
}
