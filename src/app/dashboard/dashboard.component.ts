import { Component, OnInit, ChangeDetectorRef, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { EstadisticasService } from '../services/estadisticas.service';

interface ChartOptions {
  series: Array<{ name: string; data: number[] }>;
  chart: {
    type: 'bar' | 'line';
    height: number;
    toolbar?: { show: boolean };
  };
  xaxis: {
    categories: string[];
    labels?: { style: { fontSize: string; fontFamily: string; colors: string[] } };
  };
  yaxis: {
    labels?: { style: { fontSize: string; fontFamily: string; colors: string[] } };
    title?: { text: string; style: { fontSize: string; fontFamily: string; color: string } };
  };
  plotOptions: {
    bar: { horizontal: boolean };
  };
  colors: string[];
  title: {
    text: string;
    style: { fontSize: string; fontFamily: string; fontWeight: number; color: string };
  };
  legend: {
    fontSize: string;
    fontFamily: string;
    labels: { colors: string[] };
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  standalone: true,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tabChange!: Observable<string>;
  private tabChangeSubscription!: Subscription;

  topJugadores: any[] = [];
  topJugadoresCategoria: any[] = [];
  historicoPartidas: any[] = [];
  partidasFiltradas: any[] = [];
  categoriasDisponibles: string[] = [];
  categoriaSeleccionada: string = '';
  diasDisponibles: string[] = [];
  diaSeleccionado: string = '';

  showTopJugadoresChart = true;
  showCategoriaChart = true;
  showHistoricoChart = true;

  public barChartTopJugadores: ChartOptions = {
    series: [{ name: 'Puntuación', data: [] }],
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    xaxis: {
      categories: [],
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: Array(5).fill('#666') } },
    },
    yaxis: {
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: ['#666'] } },
    },
    plotOptions: { bar: { horizontal: false } },
    colors: ['#4a90e2'],
    title: {
      text: 'Top 5 Jugadores por Puntuación',
      style: { fontSize: '16px', fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#333' },
    },
    legend: {
      fontSize: '14px',
      fontFamily: "'Poppins', sans-serif",
      labels: { colors: ['#333'] },
    },
  };

  public barChartCategoria: ChartOptions = {
    series: [{ name: '', data: [] }],
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    xaxis: {
      categories: [],
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: Array(5).fill('#666') } },
    },
    yaxis: {
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: ['#666'] } },
    },
    plotOptions: { bar: { horizontal: false } },
    colors: [],
    title: {
      text: 'Top Jugadores por Categoría',
      style: { fontSize: '16px', fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#333' },
    },
    legend: {
      fontSize: '14px',
      fontFamily: "'Poppins', sans-serif",
      labels: { colors: ['#333'] },
    },
  };

  public barChartTiempoJugado: ChartOptions = {
    series: [{ name: 'Tiempo Jugado (segundos)', data: [] }],
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    xaxis: {
      categories: [],
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: Array(5).fill('#666') } },
    },
    yaxis: {
      labels: { style: { fontSize: '12px', fontFamily: "'Poppins', sans-serif", colors: ['#666'] } },
      title: { text: 'Tiempo (segundos)', style: { fontSize: '14px', fontFamily: "'Poppins', sans-serif", color: '#333' } },
    },
    plotOptions: { bar: { horizontal: false } },
    colors: ['#e67e22'],
    title: {
      text: 'Jugadores con Más Tiempo Jugado',
      style: { fontSize: '16px', fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#333' },
    },
    legend: {
      fontSize: '14px',
      fontFamily: "'Poppins', sans-serif",
      labels: { colors: ['#333'] },
    },
  };

  constructor(
    private estadisticasService: EstadisticasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.tabChangeSubscription = this.tabChange.subscribe((tab: string) => {
      if (tab === 'dashboard') {
        this.rebuildCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    this.rebuildCharts();
  }

  ngOnDestroy(): void {
    if (this.tabChangeSubscription) {
      this.tabChangeSubscription.unsubscribe();
    }
  }

  rebuildCharts(): void {
    this.showTopJugadoresChart = false;
    this.showCategoriaChart = false;
    this.showHistoricoChart = false;

    setTimeout(() => {
      this.showTopJugadoresChart = true;
      this.showCategoriaChart = true;
      this.showHistoricoChart = true;
      this.cdr.detectChanges();
    }, 100);
  }

  cargarEstadisticas(): void {
    this.estadisticasService.getTopJugadores(5).subscribe({
      next: (data) => {
        this.topJugadores = data.map(jugador => ({
          ...jugador,
          puntuacion: this.getPuntajeTotal({ aciertosPartida: jugador.aciertosTotales, erroresPartida: jugador.erroresTotales }),
        }));
        this.barChartTopJugadores.xaxis.categories = this.topJugadores.map(jugador => jugador.nombrePerfil);
        this.barChartTopJugadores.series[0].data = this.topJugadores.map(jugador => parseFloat(jugador.puntuacion));
        this.rebuildCharts();
      },
      error: (err) => {
        console.error('Error al cargar top jugadores:', err);
      },
    });

    this.estadisticasService.getTopJugadoresCategoria(5).subscribe({
      next: (data) => {
        this.topJugadoresCategoria = data;
        this.categoriasDisponibles = data.map((item: any) => item.categoria);
        this.categoriaSeleccionada = this.categoriasDisponibles[0] || '';
        this.actualizarGraficoCategoria();
        this.rebuildCharts();
      },
      error: (err) => {
        console.error('Error al cargar top jugadores por categoría:', err);
      },
    });

    this.estadisticasService.getHistoricoPartidas().subscribe({
      next: (data) => {
        this.historicoPartidas = data;
        this.diasDisponibles = [...new Set(
          data.map((partida: any) => {
            const date = new Date(partida.fechaInicio);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          })
        )].sort();
        this.diaSeleccionado = '';
        this.filtrarPartidasPorDia();
        this.rebuildCharts();
      },
      error: (err) => {
        console.error('Error al cargar histórico de partidas:', err);
      },
    });
  }

  filtrarPartidasPorDia(): void {
    if (!this.diaSeleccionado) {
      this.partidasFiltradas = [...this.historicoPartidas];
    } else {
      this.partidasFiltradas = this.historicoPartidas.filter((partida: any) => {
        const date = new Date(partida.fechaInicio);
        const fechaFormateada = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return fechaFormateada === this.diaSeleccionado;
      });
    }
    this.actualizarGraficoTiempoJugado(this.partidasFiltradas);
    this.rebuildCharts();
  }

  actualizarGraficoTiempoJugado(partidas: any[]): void {
    const tiempoPorJugador = partidas.reduce((acc: { [key: string]: number }, partida: any) => {
      const jugador = partida.nombrePerfil;
      const tiempo = partida.tiempoTotalPartida || 0;
      acc[jugador] = (acc[jugador] || 0) + tiempo;
      return acc;
    }, {});

    const jugadores = Object.keys(tiempoPorJugador);
    const tiempos = Object.values(tiempoPorJugador);

    const jugadoresConTiempo = jugadores
      .map((jugador, index) => ({
        jugador,
        tiempo: tiempos[index],
      }))
      .sort((a, b) => b.tiempo - a.tiempo)
      .slice(0, 5);

    this.barChartTiempoJugado.xaxis.categories = jugadoresConTiempo.map((item) => item.jugador);
    this.barChartTiempoJugado.series[0].data = jugadoresConTiempo.map((item) => item.tiempo);
  }

  actualizarGraficoCategoria(): void {
    const categoriaSeleccionadaData = this.topJugadoresCategoria.find(
      (item: any) => item.categoria === this.categoriaSeleccionada
    );
    if (categoriaSeleccionadaData) {
      this.barChartCategoria.xaxis.categories = categoriaSeleccionadaData.jugadores.map(
        (jugador: any) => jugador.nombrePerfil
      );
      this.barChartCategoria.series[0].name = this.categoriaSeleccionada;
      this.barChartCategoria.series[0].data = categoriaSeleccionadaData.jugadores.map((jugador: any) => jugador.puntuacion);
      this.barChartCategoria.colors = [this.getColorForCategoria(this.categoriaSeleccionada)];
    } else {
      this.barChartCategoria.xaxis.categories = [];
      this.barChartCategoria.series[0].data = [];
    }
    this.rebuildCharts();
  }

  getColorForCategoria(categoria: string): string {
    const colors: { [key: string]: string } = {
      aritmética: '#1abc9c',
      geometria: '#f1c40f',
      suma: '#8e44ad',
      multiplicación: '#1f618d',
      literatura: '#9b59b6',
    };
    return colors[categoria.toLowerCase()] || '#95a5a6';
  }

  getBorderColorForCategoria(categoria: string): string {
    const borderColors: { [key: string]: string } = {
      aritmética: '#16a085',
      historia: '#c0392b',
      ciencia: '#2980b9',
      geografía: '#f39c12',
      literatura: '#8e44ad',
    };
    return borderColors[categoria.toLowerCase()] || '#7f8c8d';
  }

  // Método para calcular el puntaje de una partida
  getPuntajeTotal(partida: any): string {
    const totalPreguntas = partida.aciertosPartida + partida.erroresPartida;
    if (totalPreguntas === 0) return '0.00';
    let puntaje = (partida.aciertosPartida / totalPreguntas) * 10;
    if (puntaje < 10) {
      puntaje += 1;
    }
    puntaje = Math.min(puntaje, 10);
    return puntaje.toFixed(2);
  }
}