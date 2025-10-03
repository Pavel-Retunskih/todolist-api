import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  collection: 'sessions',
  timestamps: true,
})
export class SessionSchema {
  @Prop({ required: true, unique: true })
  userId: string
  @Prop({ required: true, unique: true })
  deviceId: string
  @Prop({ required: true, unique: true })
  refreshToken: string
  @Prop({ required: true, type: Date, index: { expires: 60 } })
  expiresAt: Date
}

export type SessionDocument = HydratedDocument<SessionSchema>

export const SessionSchemaFactory = SchemaFactory.createForClass(SessionSchema)

SessionSchemaFactory.pre('save', function (next) {
  console.log('New session created, session id: ', this._id)
  next()
})

SessionSchemaFactory.virtual('sessionId').get(function () {
  return this._id.toHexString()
})
