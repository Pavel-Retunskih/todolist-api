import { Session } from './session.entity'

describe('Session', () => {
  const now = new Date()
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day ahead

  describe('constructor', () => {
    it('should create a session with all fields', () => {
      const session = new Session(
        'session-1',
        'device-1',
        'hash123',
        'user-1',
        futureDate,
      )

      expect(session.sessionId).toBe('session-1')
      expect(session.deviceId).toBe('device-1')
      expect(session.refreshTokenHash).toBe('hash123')
      expect(session.userId).toBe('user-1')
      expect(session.expiresAt).toBe(futureDate)
    })
  })

  describe('create', () => {
    it('should create a session from an existing session object', () => {
      const original = new Session(
        'session-1',
        'device-1',
        'hash123',
        'user-1',
        futureDate,
      )
      const created = Session.create(original)

      expect(created.sessionId).toBe('session-1')
      expect(created.deviceId).toBe('device-1')
      expect(created.refreshTokenHash).toBe('hash123')
      expect(created.userId).toBe('user-1')
      expect(created.expiresAt).toBe(futureDate)
    })
  })

  describe('isExpired', () => {
    it('should return false for a session that expires in the future', () => {
      const session = new Session(
        'session-1',
        'device-1',
        'hash123',
        'user-1',
        futureDate,
      )

      expect(Session.isExpired(session)).toBe(false)
    })

    it('should return true for an expired session', () => {
      const pastDate = new Date(Date.now() - 1000 * 60)
      const session = new Session(
        'session-1',
        'device-1',
        'hash123',
        'user-1',
        pastDate,
      )

      expect(Session.isExpired(session)).toBe(true)
    })
  })

  describe('rotate', () => {
    it('should return a new session with updated refresh token and expiry', () => {
      const session = new Session(
        'session-1',
        'device-1',
        'oldHash',
        'user-1',
        now,
      )
      const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 48) // 2 days
      const rotated = Session.rotate(session, newExpiry, 'newHash')

      expect(rotated.sessionId).toBe('session-1')
      expect(rotated.deviceId).toBe('device-1')
      expect(rotated.refreshTokenHash).toBe('newHash')
      expect(rotated.userId).toBe('user-1')
      expect(rotated.expiresAt).toBe(newExpiry)
    })
  })
})
