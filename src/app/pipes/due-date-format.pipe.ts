import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dueDateFormat',
  standalone: true
})
export class DueDateFormatPipe implements PipeTransform {
  transform(value: Date | undefined): string {
    if (!value) {
      return 'No Due Date';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(value);
    dueDate.setHours(0, 0, 0, 0);
    
    const formatted = dueDate.toLocaleDateString('en-US');
    
    if (dueDate < today) {
      return `Overdue (${formatted})`;
    }
    
    return formatted;
  }
}