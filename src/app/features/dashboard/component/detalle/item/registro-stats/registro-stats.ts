import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-registro-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registro-stats.html'
})
export class RegistroStats implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  tipo!: 'personas' | 'grupos';
  id!: string;
  itemId!: string;
  chart: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;

    const registrosRef = collection(
      this.firestore,
      `${this.tipo}/${this.id}/items/${this.itemId}/registros`
    );

    collectionData(registrosRef, { idField: 'id' })
      .pipe(
        map((registros: any[]) =>
          registros
            .filter(r => r.fecha)
            .sort(
              (a, b) =>
                new Date(a.fecha.seconds ? a.fecha.seconds * 1000 : a.fecha).getTime() -
                new Date(b.fecha.seconds ? b.fecha.seconds * 1000 : b.fecha).getTime()
            )
        )
      )
      .subscribe((registrosOrdenados) => {
        const fechas = registrosOrdenados.map(r =>
          new Date(r.fecha.seconds ? r.fecha.seconds * 1000 : r.fecha).toLocaleDateString()
        );
        const valores = registrosOrdenados.map((_, index) => index + 1); // valor acumulativo

        this.dibujarGrafico(fechas, valores);
      });
  }

  dibujarGrafico(fechas: string[], valores: number[]) {
    if (this.chart) this.chart.destroy(); // por si se recarga

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [
          {
            label: 'Evolución de registros',
            data: valores,
            fill: false,
            borderColor: '#3f51b5',
            tension: 0.2,
            pointRadius: 5,
            pointBackgroundColor: '#3f51b5'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'Progresión en el tiempo' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Número de registros' } },
          x: { title: { display: true, text: 'Fecha' } }
        }
      }
    });
  }

  descargarJPEG() {
    html2canvas(this.chartCanvas.nativeElement).then(canvas => {
      const link = document.createElement('a');
      link.download = 'estadistica_registros.jpeg';
      link.href = canvas.toDataURL('image/jpeg');
      link.click();
    });
  }

  volver() {
    this.router.navigate([
      `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros`
    ]);
  }
}

