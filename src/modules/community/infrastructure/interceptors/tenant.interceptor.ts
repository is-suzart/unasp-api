import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TenantService } from '../services/tenant.service';
import { CommunityRepository } from '../../domain/community.repository';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(
        private readonly tenantService: TenantService,
        @Inject('CommunityRepository')
        private readonly communityRepository: CommunityRepository,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();

        // 1. Try to get slug from params (e.g. /communities/:slug) or header
        let slug = request.params.slug;

        if (!slug) {
            // Fallback to header
            const headerSlug = request.headers['x-tenant-slug'];
            if (typeof headerSlug === 'string') {
                slug = headerSlug;
            }
        }

        if (slug) {
            const community = await this.communityRepository.findBySlug(slug);

            if (community) {
                this.tenantService.setTenant(community);
            } else {
                // If a slug was provided but not found, 404.
                // Unless we are creating a community? No, CreateCommunity shouldn't run this interceptor for validation purposes usually, or it handles it gracefully.
                // For now, if provided and not found -> error.
                // BUT: /communities/:slug endpoint itself fetches the community.
                // This interceptor is more useful for *other* modules (Pages, Users) that depend on the context.
            }
        }

        return next.handle();
    }
}
