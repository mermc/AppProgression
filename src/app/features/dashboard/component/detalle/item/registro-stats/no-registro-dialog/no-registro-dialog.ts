import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-no-registros-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>Item sin registros</h1>
    <div mat-dialog-content>
      <p>No hay registros para este ítem</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Entendido</button>
    </div>
  `,
})
export class NoRegistrosDialog {
  constructor(public dialogRef: MatDialogRef<NoRegistrosDialog>) {}
}