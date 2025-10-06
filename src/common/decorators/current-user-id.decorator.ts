import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { type Request } from 'express'

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest()
    const user = request?.user as { id?: string; sub?: string } | undefined
    if (!user) throw new UnauthorizedException()
    return user.id ?? user.sub
  },
)
