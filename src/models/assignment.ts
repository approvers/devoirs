import { Instructions } from './instructions';

export interface Assignment {
  id: string;
  classId: string;
  channelId: string;
  displayName: string;
  isCompleted: boolean;
  instructions: Instructions;
  closeDateTime: Date;
  dueDateTime: Date;
  assignDateTime: Date;
  assignedDateTime: Date;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
}
