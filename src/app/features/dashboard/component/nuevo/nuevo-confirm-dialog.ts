import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content class="dialog-content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close="cancel">Cancelar</button>
      <button mat-button color="primary" mat-dialog-close="ok">Aceptar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      font-size: 15px;
      margin-top: 10px;
      white-space: pre-line; /* permite saltos de línea */
    }
  `]
})
export class ConfirmDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
