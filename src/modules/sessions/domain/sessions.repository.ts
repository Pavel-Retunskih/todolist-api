import { Session } from './session.entity'

export interface CreateSessionArgs {
  userId: string
  deviceId: string
  refreshToken: string // plaintext; repository will hash
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

export interface SessionRepository {
  createSession(args: CreateSessionArgs): Promise<Session>

  getSession(sessionId: string): Promise<Session>

  deleteByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<string>

  updateSession(session: Session): Promise<Session>

  rotateRefreshToken(
    userId: string,
    oldRefreshToken: string,
    newRefreshToken: string,
    newExpiresAt: Date,
  ): Promise<Session>

  deleteAllByUserId(userId: string): Promise<number>

  deleteOthersByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<number>
}
