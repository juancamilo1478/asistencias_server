import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    private readonly logger = new Logger(SupabaseAuthGuard.name);
    private readonly jwks = createRemoteJWKSet(
        new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const token =
            req.headers.authorization?.replace('Bearer ', '') ??
            req.headers['x-access-token'];
        if (!token) {
            this.logger.warn(`Auth fallida: no se envió token (${req.method} ${req.url})`);
            throw new UnauthorizedException();
        }
        try {
            const { payload } = await jwtVerify(token, this.jwks, { audience: 'authenticated' });
            req.user = payload; // payload.sub = id del usuario
            return true;
        } catch (error) {
            const e = error as { code?: string; message?: string };
            this.logger.warn(
                `Auth fallida (${req.method} ${req.url}): ${e.code ?? 'ERROR'} - ${e.message}`,
            );
            throw new UnauthorizedException('Token inválido');
        }
    }
}