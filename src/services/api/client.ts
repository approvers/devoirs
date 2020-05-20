import { ApiClientBase } from './base';
import { ITokenProvider } from '../token/provider';
import { Class } from '../../models/class';
import { Assignment } from '../../models/assignment';

const baseUrl = 'https://assignments.onenote.com/api/v1.0';

export class ApiClient extends ApiClientBase {

  constructor(
    tokenProvider: ITokenProvider,
  ) {
    super(baseUrl, tokenProvider);
  }

  async getClasses(): Promise<Class[]> {
    return await this.request(
      'GET',
      '/edu/me/classes',
    );
  }

  async getAssignments(classId: string): Promise<Assignment[]> {
    return await this.request(
      'GET',
      `/edu/classes/${classId}/assignments`,
    );
  }

}
