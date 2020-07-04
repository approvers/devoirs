import { ClassId } from './class';

export type AssignmentId = string;
export type DateTime = string;

export interface Assignment {
  id: AssignmentId;
  classId: ClassId;
  dueDateTime: DateTime;
  displayName: string;
  isCompleted: boolean;
}
