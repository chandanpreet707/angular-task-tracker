export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: Date;
    category: TaskCategory;
    tags: string[];
    archived: boolean;
    createdAt: Date;
  }
  
  export enum TaskStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done'
  }
  
  export enum TaskCategory {
    WORK = 'Work',
    PERSONAL = 'Personal',
    URGENT = 'Urgent',
    OTHER = 'Other'
  }