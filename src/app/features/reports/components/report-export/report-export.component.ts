import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-report-export',
  templateUrl: './report-export.component.html',
  styleUrls: ['./report-export.component.scss']
})
export class ReportExportComponent {
  @Input() loading = false;
  @Output() exportReport = new EventEmitter<'pdf' | 'excel'>();

  onExport(format: 'pdf' | 'excel'): void {
    this.exportReport.emit(format);
  }
}