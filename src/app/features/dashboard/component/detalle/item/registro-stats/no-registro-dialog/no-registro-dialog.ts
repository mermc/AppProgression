import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-no-registros-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Ítem sin registros</h2>

    <mat-dialog-content class="dialog-content">
      <p>No hay registros para este ítem.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-raised-button class="app-btn btn-save" mat-dialog-close>
        Entendido
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, "Helvetica Neue", sans-serif; }

    .dialog-content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.98rem;
    }

    .dialog-actions {
      margin-top: 8px;
    }

    button.app-btn.btn-save {
      background: var(--cta-bg);
      color: var(--cta-text);
      border: none;
      box-shadow: 0 6px 14px rgba(12,192,223,0.12);
    }
    button.app-btn.btn-cancel,
    button.mat-stroked-button.btn-cancel {
      color: var(--text-strong) !important;
      background: transparent !important;
      border-color: rgba(6,30,35,0.08) !important;
    }
  `]
})
export class NoRegistrosDialog {
  constructor(public dialogRef: MatDialogRef<NoRegistrosDialog>) {}
}