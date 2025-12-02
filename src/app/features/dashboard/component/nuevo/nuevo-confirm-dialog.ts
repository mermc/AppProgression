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

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button class="app-btn btn-cancel" mat-dialog-close="cancel">
        Cancelar
      </button>
      <button mat-raised-button class="app-btn btn-save" mat-dialog-close="ok">
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, "Helvetica Neue", sans-serif; }

    .dialog-content {
      font-size: 15px;
      margin-top: 8px;
      color: var(--text-muted);
      white-space: pre-line; /* allow line breaks in messages */
    }

    .dialog-actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    /* Make Cancel look consistent (dark/neutral) even if Material's color attributes are present */
    button.app-btn.btn-cancel,
    button.mat-stroked-button.btn-cancel {
      color: var(--text-strong) !important;
      background: transparent !important;
      border: 1px solid rgba(6,30,35,0.08) !important;
      box-shadow: none;
    }

    /* Primary accept button: filled CTA consistent with app */
    button.app-btn.btn-save,
    button.mat-raised-button.btn-save {
      background: var(--cta-bg) !important;
      color: var(--cta-text) !important;
      border: none !important;
      box-shadow: 0 6px 14px rgba(12,192,223,0.12) !important;
    }

    /* Keyboard focus visible, mouse click shouldn't leave a persistent selected look */
    button:focus:not(:focus-visible) {
      box-shadow: none !important;
      outline: none !important;
    }
    button:focus-visible {
      box-shadow: 0 0 0 4px rgba(12,192,223,0.10) !important;
      outline: none !important;
    }
  `]
})
export class ConfirmDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}