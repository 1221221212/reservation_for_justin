import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    canActivate(context: ExecutionContext) {
        this.logger.debug('JwtAuthGuard#canActivate called');
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
        this.logger.debug('JwtAuthGuard#handleRequest', { user, info, err });
        if (err || !user) {
            this.logger.error('JwtAuthGuard: unauthorized', err || info?.message || info);
            throw err || new UnauthorizedException();
        }
        this.logger.debug('JwtAuthGuard: authentication successful', { user });
        return user;
    }
}
