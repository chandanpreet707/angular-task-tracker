import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appOverdueHighlight]',
  standalone: true
})
export class OverdueHighlightDirective implements OnInit {
  @Input() appOverdueHighlight: Date | undefined;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.appOverdueHighlight) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(this.appOverdueHighlight);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        this.el.nativeElement.style.border = '2px solid #f44336';
        this.el.nativeElement.style.backgroundColor = '#ffebee';
      }
    }
  }
}