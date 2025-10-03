import { Session } from './session.entity'

export interface SessionRepository {
  createSession(session: Omit<Session, 'sessionId'>): Promise<Session>

  getSession(deviseId: string): Promise<Session>

  deleteSession(deviseId: string): Promise<string>

  updateSession(session: Session): Promise<Session>
}
