import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { FastifyRequest } from "fastify";
import { IS_PUBLIC_ROUTE } from "./public.decorator";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const providedKey = this.extractKey(request);
    const acceptedKeys = this.config
      .get<string>("MMT_API_KEYS", "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);

    if (!providedKey || !acceptedKeys.includes(providedKey)) {
      throw new UnauthorizedException("Invalid or missing API key");
    }

    return true;
  }

  private extractKey(request: FastifyRequest): string | undefined {
    const auth = this.header(request, "authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) {
      return auth.slice(7).trim();
    }

    return this.header(request, "x-api-key")?.trim();
  }

  private header(request: FastifyRequest, name: string): string | undefined {
    const value = request.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }
}
