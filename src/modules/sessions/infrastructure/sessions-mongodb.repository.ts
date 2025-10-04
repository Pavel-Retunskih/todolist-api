import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SessionSchema, SessionDocument } from './session.schema'
import { Model, Types } from 'mongoose'
import { Session } from '../domain/session.entity'
import {
  CreateSessionArgs,
  SessionRepository,
} from '../domain/sessions.repository'
import * as bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

@Injectable()
export class SessionMongodbRepository implements SessionRepository {
  @InjectModel(SessionSchema.name)
  private readonly sessionDocumentModel: Model<SessionDocument>

  async createSession(args: CreateSessionArgs): Promise<Session> {
    const refreshTokenHash = await bcrypt.hash(args.refreshToken, SALT_ROUNDS)

    const created = await this.sessionDocumentModel.create({
      userId: args.userId,
      deviceId: args.deviceId,
      refreshTokenHash,
      expiresAt: args.expiresAt,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    })

    return new Session(
      created._id.toString(),
      created.deviceId,
      created.refreshTokenHash,
      created.userId,
      created.expiresAt,
    )
  }

  async getSession(sessionId: string): Promise<Session> {
    const doc = await this.sessionDocumentModel.findById(sessionId)
    if (!doc) {
      throw new BadRequestException('Session not found')
    }
    return new Session(
      doc._id.toString(),
      doc.deviceId,
      doc.refreshTokenHash,
      doc.userId,
      doc.expiresAt,
    )
  }

  async deleteByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    // Find candidate sessions for user and match by bcrypt
    const candidates = await this.sessionDocumentModel
      .find({ userId })
      .select({ refreshTokenHash: 1 })
      .lean()

    for (const candidate of candidates) {
      if (candidate && candidate.refreshTokenHash) {
        const match = await bcrypt.compare(
          refreshToken,
          candidate.refreshTokenHash,
        )
        if (match) {
          const deleted = await this.sessionDocumentModel.findByIdAndDelete(
            candidate._id,
          )
          if (deleted) return deleted._id.toString()
        }
      }
    }
    throw new BadRequestException('Session not found')
  }

  async updateSession(session: Session): Promise<Session> {
    const updated = await this.sessionDocumentModel.findByIdAndUpdate(
      session.sessionId,
      {
        userId: session.userId,
        deviceId: session.deviceId,
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: session.expiresAt,
      },
      { new: true },
    )
    if (!updated) {
      throw new BadRequestException('Session not found')
    }
    return new Session(
      updated._id.toString(),
      updated.deviceId,
      updated.refreshTokenHash,
      updated.userId,
      updated.expiresAt,
    )
  }

  private async findMatchingSessionIdByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<string | null> {
    const candidates = await this.sessionDocumentModel
      .find({ userId })
      .select({ refreshTokenHash: 1 })
      .lean()

    for (const candidate of candidates as Array<{
      _id: Types.ObjectId
      refreshTokenHash?: string
    }>) {
      if (candidate?.refreshTokenHash) {
        const match = await bcrypt.compare(
          refreshToken,
          candidate.refreshTokenHash,
        )
        if (match) return candidate._id.toString()
      }
    }
    return null
  }

  async rotateRefreshToken(
    userId: string,
    oldRefreshToken: string,
    newRefreshToken: string,
    newExpiresAt: Date,
  ): Promise<Session> {
    const sessionId = await this.findMatchingSessionIdByUserIdAndRefreshToken(
      userId,
      oldRefreshToken,
    )
    if (!sessionId) {
      throw new BadRequestException('Session not found')
    }

    const newHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS)

    const updated = await this.sessionDocumentModel.findByIdAndUpdate(
      sessionId,
      {
        refreshTokenHash: newHash,
        expiresAt: newExpiresAt,
      },
      { new: true },
    )

    if (!updated) throw new BadRequestException('Session not found')

    return new Session(
      updated._id.toString(),
      updated.deviceId,
      updated.refreshTokenHash,
      updated.userId,
      updated.expiresAt,
    )
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const res = await this.sessionDocumentModel.deleteMany({ userId })
    return res.deletedCount ?? 0
  }

  async deleteOthersByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<number> {
    const keepId = await this.findMatchingSessionIdByUserIdAndRefreshToken(
      userId,
      refreshToken,
    )
    if (!keepId) throw new BadRequestException('Session not found')

    const res = await this.sessionDocumentModel.deleteMany({
      userId,
      _id: { $ne: keepId },
    })
    return res.deletedCount ?? 0
  }
}
