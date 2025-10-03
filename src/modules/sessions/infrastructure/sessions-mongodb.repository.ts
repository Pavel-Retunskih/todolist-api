import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SessionSchema, SessionDocument } from './session.schema'
import { Model } from 'mongoose'
import { Session } from '../domain/session.entity'
import { SessionRepository } from '../domain/sessions.repository'

@Injectable()
export class SessionMongodbRepository implements SessionRepository {
  @InjectModel(SessionSchema.name)
  private readonly sessionDocumentModel: Model<SessionDocument>

  async createSession(session: Omit<Session, 'sessionId'>): Promise<Session> {
    const newSession = new this.sessionDocumentModel({
      userId: session.userId,
      deviceId: session.deviceId,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    })
    const createdSession = await newSession.save()
    return new Session(
      createdSession._id.toString(),
      createdSession.userId,
      createdSession.deviceId,
      createdSession.refreshToken,
      createdSession.expiresAt,
    )
  }

  async getSession(sessionId: string): Promise<Session> {
    const sessionDocument = await this.sessionDocumentModel.findById(sessionId)
    if (!sessionDocument) {
      throw new BadRequestException('Session not found')
    }
    return new Session(
      sessionDocument._id.toString(),
      sessionDocument.userId,
      sessionDocument.deviceId,
      sessionDocument.refreshToken,
      sessionDocument.expiresAt,
    )
  }

  async deleteSession(refreshToken: string): Promise<string> {
    const sessionDocument = await this.sessionDocumentModel.findOneAndDelete({
      refreshToken,
    })
    if (!sessionDocument) {
      throw new BadRequestException('Session not found')
    }
    return sessionDocument._id.toString()
  }

  async updateSession(session: Session): Promise<Session> {
    const updatedSession = await this.sessionDocumentModel.findByIdAndUpdate(
      session.sessionId,
      {
        userId: session.userId,
        deviceId: session.deviceId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
      { new: true },
    )
    if (!updatedSession) {
      throw new BadRequestException('Session not found')
    }
    return new Session(
      updatedSession._id.toString(),
      updatedSession.userId,
      updatedSession.deviceId,
      updatedSession.refreshToken,
      updatedSession.expiresAt,
    )
  }
}
