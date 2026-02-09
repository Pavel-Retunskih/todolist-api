import { PasswordUtil } from './password.util'

describe('PasswordUtil', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123'
      const hash = await PasswordUtil.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for the same password', async () => {
      const password = 'TestPassword123'
      const hash1 = await PasswordUtil.hashPassword(password)
      const hash2 = await PasswordUtil.hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123'
      const hash = await PasswordUtil.hashPassword(password)
      const result = await PasswordUtil.verifyPassword(password, hash)

      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123'
      const hash = await PasswordUtil.hashPassword(password)
      const result = await PasswordUtil.verifyPassword('WrongPassword', hash)

      expect(result).toBe(false)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should accept a strong password', () => {
      const result = PasswordUtil.validatePasswordStrength('StrongPass1')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject a password shorter than 8 characters', () => {
      const result = PasswordUtil.validatePasswordStrength('Ab1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Password must be at least 8 characters long',
      )
    })

    it('should reject a password longer than 128 characters', () => {
      const longPassword = 'Aa1' + 'x'.repeat(126)
      const result = PasswordUtil.validatePasswordStrength(longPassword)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Password must not exceed 128 characters',
      )
    })

    it('should reject a password without a number', () => {
      const result = PasswordUtil.validatePasswordStrength('StrongPassword')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one number',
      )
    })

    it('should reject a password without a lowercase letter', () => {
      const result = PasswordUtil.validatePasswordStrength('STRONGPASS1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter',
      )
    })

    it('should reject a password without an uppercase letter', () => {
      const result = PasswordUtil.validatePasswordStrength('strongpass1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter',
      )
    })

    it('should reject a password that is only whitespace', () => {
      const result = PasswordUtil.validatePasswordStrength('        ')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password cannot be only whitespace')
    })

    it('should return multiple errors for a very weak password', () => {
      const result = PasswordUtil.validatePasswordStrength('abc')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('generateRandomPassword', () => {
    it('should generate a password of default length 12', () => {
      const password = PasswordUtil.generateRandomPassword()

      expect(password.length).toBe(12)
    })

    it('should generate a password of specified length', () => {
      const password = PasswordUtil.generateRandomPassword(20)

      expect(password.length).toBe(20)
    })

    it('should generate different passwords each time', () => {
      const p1 = PasswordUtil.generateRandomPassword()
      const p2 = PasswordUtil.generateRandomPassword()

      expect(p1).not.toBe(p2)
    })
  })
})
