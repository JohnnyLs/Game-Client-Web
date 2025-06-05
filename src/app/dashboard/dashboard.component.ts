import { Component, OnInit, ChangeDetectorRef, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { EstadisticasService } from '../services/estadisticas.service';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, NgChartsModule, FormsModule],
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

  // Gráfico de barras: Top Jugadores
  public barChartTopJugadores: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Puntuación',
        backgroundColor: '#4a90e2',
        borderColor: '#357abd',
        borderWidth: 1,
      },
    ],
  };
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Top 5 Jugadores por Puntuación',
        font: {
          size: 16,
          family: "'Poppins', sans-serif",
          weight: 500,
        },
        color: '#333',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
      },
    },
  };
  public barChartType: 'bar' = 'bar';

  // Gráfico de barras: Top Jugadores por Categoría
  public barChartCategoria: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };
  public barChartCategoriaOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Top Jugadores por Categoría',
        font: {
          size: 16,
          family: "'Poppins', sans-serif",
          weight: 500,
        },
        color: '#333',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
      },
    },
  };

  // Gráfico de barras: Jugadores con más tiempo jugado
  public barChartTiempoJugado: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tiempo Jugado (segundos)',
        backgroundColor: '#e67e22',
        borderColor: '#d35400',
        borderWidth: 1,
      },
    ],
  };
  public barChartTiempoOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Jugadores con Más Tiempo Jugado',
        font: {
          size: 16,
          family: "'Poppins', sans-serif",
          weight: 500,
        },
        color: '#333',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif",
          },
          color: '#666',
        },
        title: {
          display: true,
          text: 'Tiempo (segundos)',
          font: {
            size: 14,
            family: "'Poppins', sans-serif",
          },
          color: '#333',
        },
      },
    },
  };
  public barChartTiempoType: 'bar' = 'bar';

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
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, 100);
  }

  cargarEstadisticas(): void {
  this.estadisticasService.getTopJugadores(5).subscribe({
    next: (data) => {
      this.topJugadores = data;
      this.barChartTopJugadores.labels = data.map((jugador: any) => jugador.nombrePerfil);
      this.barChartTopJugadores.datasets[0].data = data.map((jugador: any) => jugador.puntuacion);
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
        // Establecer "Todos los días" como valor por defecto
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
    console.log('diaSeleccionado:', this.diaSeleccionado); // Depuración

    if (!this.diaSeleccionado) {
      this.partidasFiltradas = [...this.historicoPartidas];
      console.log('partidasFiltradas (Todos los días):', this.partidasFiltradas); // Depuración
    } else {
      this.partidasFiltradas = this.historicoPartidas.filter((partida: any) => {
        const date = new Date(partida.fechaInicio);
        const fechaFormateada = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return fechaFormateada === this.diaSeleccionado;
      });
      console.log('partidasFiltradas (Fecha específica):', this.partidasFiltradas); // Depuración
    }

    this.actualizarGraficoTiempoJugado(this.partidasFiltradas);
    console.log('barChartTiempoJugado:', this.barChartTiempoJugado); // Depuración

    // Forzar la actualización de todos los gráficos
    this.rebuildCharts();
  }

  actualizarGraficoTiempoJugado(partidas: any[]): void {
    // Agrupar las partidas por jugador y sumar el tiempo jugado
    const tiempoPorJugador = partidas.reduce((acc: { [key: string]: number }, partida: any) => {
      const jugador = partida.nombrePerfil;
      const tiempo = partida.tiempoTotalPartida || 0;
      acc[jugador] = (acc[jugador] || 0) + tiempo;
      return acc;
    }, {});

    // Convertir el objeto en un array para el gráfico
    const jugadores = Object.keys(tiempoPorJugador);
    const tiempos = Object.values(tiempoPorJugador);

    // Ordenar por tiempo descendente y tomar los top 5
    const jugadoresConTiempo = jugadores
      .map((jugador, index) => ({
        jugador,
        tiempo: tiempos[index],
      }))
      .sort((a, b) => b.tiempo - a.tiempo)
      .slice(0, 5);

    // Actualizar el gráfico con una nueva referencia para forzar la detección de cambios
    this.barChartTiempoJugado = {
      ...this.barChartTiempoJugado,
      labels: jugadoresConTiempo.map((item) => item.jugador),
      datasets: [
        {
          ...this.barChartTiempoJugado.datasets[0],
          data: jugadoresConTiempo.map((item) => item.tiempo),
        },
      ],
    };
  }

  actualizarGraficoCategoria(): void {
    const categoriaSeleccionadaData = this.topJugadoresCategoria.find(
      (item: any) => item.categoria === this.categoriaSeleccionada
    );
    if (categoriaSeleccionadaData) {
      this.barChartCategoria.labels = categoriaSeleccionadaData.jugadores.map(
        (jugador: any) => jugador.nombrePerfil
      );
      this.barChartCategoria.datasets = [
        {
          data: categoriaSeleccionadaData.jugadores.map((jugador: any) => jugador.puntuacion),
          label: this.categoriaSeleccionada,
          backgroundColor: this.getColorForCategoria(this.categoriaSeleccionada),
          borderColor: this.getBorderColorForCategoria(this.categoriaSeleccionada),
          borderWidth: 1,
        },
      ];
    } else {
      this.barChartCategoria.labels = [];
      this.barChartCategoria.datasets = [];
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
}