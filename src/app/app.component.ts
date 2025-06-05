import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JugadorService } from './services/jugador.service';
import { Jugador, Partida } from './models/jugador.model';
import { FormsModule } from '@angular/forms';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JugadoresComponent } from './jugadores/jugadores.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, PreguntasComponent, DashboardComponent, JugadoresComponent],
  standalone: true,
})
export class AppComponent implements OnInit {
  jugadores: Jugador[] = [];
  filteredJugadores: Jugador[] = [];
  searchTerm: string = '';
  activeTab: 'reportes' | 'preguntas' | 'dashboard' | 'jugadores' = 'reportes';
  tabChangeSubject = new Subject<string>();
  fechasDisponibles: string[] = [];
  fechaSeleccionada: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private jugadorService: JugadorService
  ) {}

  ngOnInit(): void {
    this.loadJugadores();
  }

  loadJugadores(): void {
    this.jugadorService.getJugadores().subscribe({
      next: (jugadores) => {
        this.jugadores = jugadores.map(jugador => ({
          ...jugador,
          nombrePerfil: this.cleanNombrePerfil(jugador.nombrePerfil),
        }));
        this.filteredJugadores = [...this.jugadores];
        this.fechasDisponibles = this.getFechasDisponibles();
        this.fechaSeleccionada = '';
        this.filterJugadores();
      },
      error: (err) => {
        console.error('Error al cargar los jugadores:', err);
      },
    });
  }

  cleanNombrePerfil(nombre: string): string {
    try {
      const parsed = JSON.parse(nombre);
      return parsed.nombrePerfil || nombre;
    } catch {
      return nombre.replace(/["\r\n]/g, '').trim();
    }
  }

  getFechasDisponibles(): string[] {
    const fechas = new Set<string>();
    this.jugadores.forEach(jugador => {
      jugador.partidas.forEach(partida => {
        const date = new Date(partida.fechaInicio);
        const fechaFormateada = date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        fechas.add(fechaFormateada);
      });
    });
    return [...fechas].sort();
  }

  filterJugadores(): void {
    let filtered = [...this.jugadores];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(jugador =>
        jugador.nombrePerfil.toLowerCase().includes(term)
      );
    }

    if (this.fechaSeleccionada) {
      filtered = filtered
        .map(jugador => ({
          ...jugador,
          partidas: jugador.partidas.filter(partida => {
            const date = new Date(partida.fechaInicio);
            const fechaFormateada = date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return fechaFormateada === this.fechaSeleccionada;
          }),
        }))
        .filter(jugador => jugador.partidas.length > 0);
    }

    this.filteredJugadores = filtered;
  }

  goToPartidaDetail(partida: Partida): void {
    this.router.navigate([`/partida/${partida.idPartida}`]);
  }

  getColorClass(index: number): string {
    const colors = [
      'color-blue',
      'color-green',
      'color-purple',
      'color-orange',
      'color-teal',
    ];
    return colors[index % colors.length];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setActiveTab(tab: 'reportes' | 'preguntas' | 'dashboard' | 'jugadores'): void {
    this.activeTab = tab;
    this.tabChangeSubject.next(tab);
  }
}