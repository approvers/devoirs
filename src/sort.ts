import { ApiClient } from './services/api/client';
import { Assignment } from './models/assignment';

export class SortAssignments {
  constructor(private client: ApiClient) {}
  Assignments: Assignment[] = [];
  async init(): Promise<void> {
    for (const c of await this.client.getClasses()) {
      for (const a of await this.client.getAssignments(c.id)) {
        this.Assignments.push(a);
      }
    }
  }

  getAssignments(): Assignment[] {
    return this.Assignments;
  }

  sortTime(): void {
    const moment = require('moment');
    this.Assignments.sort((a, b) => moment(a.dueDateTime).diff(b.dueDateTime));
  }

  sortClass(): void {
    this.Assignments.sort((a, b) => {
      if (a.classId > b.classId) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  sortCheck(): void {
    this.Assignments.sort((a, b) => {
      if (a.isCompleted > b.isCompleted) {
        return 1;
      } else {
        return -1;
      }
    });
  }
}

export const createSortAssignments = async (
  client: ApiClient
): Promise<SortAssignments> => {
  const obj = new SortAssignments(client);
  await obj.init();
  return obj;
};
