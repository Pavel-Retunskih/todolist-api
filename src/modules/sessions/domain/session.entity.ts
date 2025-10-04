export class Session {
  constructor(
    public readonly sessionId: string,
    public readonly deviceId: string,
    public readonly refreshTokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
  ) {}

  static create({
    deviceId,
    refreshTokenHash,
    userId,
    expiresAt,
    sessionId,
  }: Session) {
    return {
      sessionId: sessionId,
      deviceId: deviceId,
      refreshTokenHash: refreshTokenHash,
      userId: userId,
      expiresAt: expiresAt,
    }
  }

  static isExpired(session: Session): boolean {
    return session.expiresAt.getTime() < Date.now()
  }

  static rotate(
    session: Session,
    newExpiredAt: Date,
    newRefreshTokenHash: string,
  ): Session {
    return Session.create({
      sessionId: session.sessionId,
      deviceId: session.deviceId,
      refreshTokenHash: newRefreshTokenHash,
      userId: session.userId,
      expiresAt: newExpiredAt,
    })
  }
}
