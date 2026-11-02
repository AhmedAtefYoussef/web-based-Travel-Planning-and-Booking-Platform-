import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/contracts/auth.contract';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditQueryDto } from './audit-query.dto';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('admin/audit-logs')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: AuditQueryDto) {
    return this.audit.list(query);
  }
}
