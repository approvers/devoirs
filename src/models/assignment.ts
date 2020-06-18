import { ClassId } from './class';

export type AssignmentId = string;

export interface Assignment {
  id: AssignmentId;
  classId: ClassId;
  displayName: string;
  isCompleted: boolean;
  dueDateTime: string;
}
