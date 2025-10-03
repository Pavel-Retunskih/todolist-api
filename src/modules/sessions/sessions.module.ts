import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SessionMongodbRepository } from './infrastructure/sessions-mongodb.repository'
import {
  SessionSchema,
  SessionSchemaFactory,
} from './infrastructure/session.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SessionSchema.name,
        schema: SessionSchemaFactory,
      },
    ]),
  ],
  providers: [
    {
      provide: 'SessionsRepository',
      useClass: SessionMongodbRepository,
    },
  ],
  exports: ['SessionsRepository'],
})
export class SessionsModule {}
