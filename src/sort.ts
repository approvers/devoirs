import { ApiClient } from './services/api/client';
import { Assignment } from './models/assignment';

export class SortAssignments {
    constructor(private client: ApiClient) {}
    Assignments: Assignment[] = new Array();
    async init(){
        for (const c of await this.client.getClasses()) {
            for (const a of await this.client.getAssignments(c.id)) {
                this.Assignments.push(a);
            }
        }
    }

    getAssignments(){
        return this.Assignments;
    }

    sortTime(){
        const moment = require("moment");
        this.Assignments.sort((a, b) => moment(a.dueDateTime).diff(b.dueDateTime));
    }

    sortClass(){
        this.Assignments.sort((a, b) => 
        {
            if (a.classId > b.classId) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    sortCheck(){
        this.Assignments.sort((a, b) => 
        {
            if (a.isCompleted > b.isCompleted) {
                return 1;
            } else {
                return -1;
            }
        });
    }

}

export const createSortAssignments = async (client) =>{
    const obj = new SortAssignments(client);
    await obj.init();
    return obj;
}