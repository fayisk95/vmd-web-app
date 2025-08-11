import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AvailabilityResult } from '../../../../core/models/trip.model';

@Component({
  selector: 'app-availability-check',
  templateUrl: './availability-check.component.html',
  styleUrls: ['./availability-check.component.scss']
})
export class AvailabilityCheckComponent {
  @Input() result: AvailabilityResult | null = null;
  @Input() loading = false;
  @Output() checkAvailability = new EventEmitter<void>();

  onCheck(): void {
    this.checkAvailability.emit();
  }
}