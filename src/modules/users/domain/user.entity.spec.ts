import { User } from './user.entity'

describe('User', () => {
  const now = new Date()

  describe('constructor', () => {
    it('should create a user with all fields', () => {
      const user = new User('id1', 'test@test.com', 'hash123', now, now)

      expect(user.id).toBe('id1')
      expect(user.email).toBe('test@test.com')
      expect(user.passwordHash).toBe('hash123')
      expect(user.createdAt).toBe(now)
      expect(user.updatedAt).toBe(now)
    })
  })

  describe('create', () => {
    it('should create a user without id', () => {
      const user = User.create({
        email: 'test@test.com',
        passwordHash: 'hash123',
      })

      expect(user.email).toBe('test@test.com')
      expect(user.passwordHash).toBe('hash123')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('isValidEmail', () => {
    it('should return true for a valid email', () => {
      expect(User.isValidEmail('user@example.com')).toBe(true)
    })

    it('should return false for an invalid email without @', () => {
      expect(User.isValidEmail('userexample.com')).toBe(false)
    })

    it('should return false for an email with spaces', () => {
      expect(User.isValidEmail('user @example.com')).toBe(false)
    })

    it('should return false for an empty string', () => {
      expect(User.isValidEmail('')).toBe(false)
    })

    it('should return false for an email without domain', () => {
      expect(User.isValidEmail('user@')).toBe(false)
    })
  })

  describe('update', () => {
    it('should update email and keep other fields', () => {
      const user = new User('id1', 'old@test.com', 'hash123', now, now)
      const updated = user.update({ email: 'new@test.com' })

      expect(updated.id).toBe('id1')
      expect(updated.email).toBe('new@test.com')
      expect(updated.passwordHash).toBe('hash123')
      expect(updated.createdAt).toBe(now)
      expect(updated.updatedAt).not.toBe(now)
    })

    it('should update passwordHash', () => {
      const user = new User('id1', 'test@test.com', 'hash123', now, now)
      const updated = user.update({ passwordHash: 'newHash' })

      expect(updated.passwordHash).toBe('newHash')
      expect(updated.email).toBe('test@test.com')
    })

    it('should keep original values when no updates provided', () => {
      const user = new User('id1', 'test@test.com', 'hash123', now, now)
      const updated = user.update({})

      expect(updated.email).toBe('test@test.com')
      expect(updated.passwordHash).toBe('hash123')
    })
  })

  describe('toPublicData', () => {
    it('should return public data without passwordHash', () => {
      const user = new User('id1', 'test@test.com', 'hash123', now, now)
      const publicData = user.toPublicData()

      expect(publicData).toEqual({
        id: 'id1',
        email: 'test@test.com',
        createdAt: now,
        updatedAt: now,
      })
      expect((publicData as any).passwordHash).toBeUndefined()
    })
  })
})
