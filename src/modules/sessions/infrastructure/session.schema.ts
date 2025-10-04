import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  collection: 'sessions',
  timestamps: true,
  versionKey: false,
})
export class SessionSchema {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  deviceId: string

  @Prop({ required: true })
  refreshTokenHash: string

  @Prop({ required: true, type: Date })
  expiresAt: Date

  @Prop({ required: false })
  ipAddress?: string

  @Prop({ required: false })
  userAgent?: string
}

export type SessionDocument = HydratedDocument<SessionSchema>

export const SessionSchemaFactory = SchemaFactory.createForClass(SessionSchema)

// TTL for expiresAt: expire exactly at the timestamp
SessionSchemaFactory.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
// one active session per (userId, deviceId). Adjust to your needs.
SessionSchemaFactory.index({ userId: 1, deviceId: 1 }, { unique: true })

SessionSchemaFactory.pre('save', function (next) {
  console.log('New session created, session id: ', this._id)
  next()
})

SessionSchemaFactory.virtual('sessionId').get(function () {
  return this._id.toHexString()
})
