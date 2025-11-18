import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [CommonModule]
})
export class Footer {
  @Input() showQr = true;
  currentYear = new Date().getFullYear();
}