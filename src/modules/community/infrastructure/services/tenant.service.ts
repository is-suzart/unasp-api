import { Injectable, Scope } from '@nestjs/common';
import { Community } from '../../domain/entities';

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
    private tenant: Community | null = null;
    private tenantSlug: string | null = null;

    setTenant(tenant: Community) {
        this.tenant = tenant;
        this.tenantSlug = tenant.slug;
    }

    getTenant(): Community | null {
        return this.tenant;
    }

    getTenantSlug(): string | null {
        return this.tenantSlug;
    }
}
