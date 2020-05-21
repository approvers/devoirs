import { ApiProxy } from './proxy';
import { Class } from '../../models/class';
import { Assignment } from '../../models/assignment';

export class ApiClient {

  constructor(
    private proxy: ApiProxy,
  ) {
  }

  async getClasses(): Promise<Class[]> {
    return await this.proxy.request(
      'GET',
      '/edu/me/classes',
    );
  }

  async getAssignments(classId: string): Promise<Assignment[]> {
    return await this.proxy.request(
      'GET',
      `/edu/classes/${classId}/assignments`,
    );
  }

}
