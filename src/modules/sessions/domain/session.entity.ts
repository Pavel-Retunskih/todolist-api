export class Session {
  constructor(
    public readonly sessionId: string,
    public readonly deviceId: string,
    public readonly refreshToken: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
  ) {}

  static create({
    deviceId,
    refreshToken,
    userId,
    expiresAt,
    sessionId,
  }: Session) {
    return {
      sessionId: sessionId,
      deviceId: deviceId,
      refreshToken: refreshToken,
      userId: userId,
      expiresAt: expiresAt,
    };
  }

  static isExpired(session: Session): boolean {
    return session.expiresAt.getTime() < Date.now();
  }

  static refreshSession(
    session: Session,
    newExpiredAt: Date,
    newRefreshToken: string,
  ): Session {
    return Session.create({
      sessionId: session.sessionId,
      deviceId: session.deviceId,
      refreshToken: newRefreshToken,
      userId: session.userId,
      expiresAt: newExpiredAt,
    });
  }
}
