import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JugadorService } from '../services/jugador.service';
import { Jugador } from '../models/jugador.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-jugadores',
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class JugadoresComponent implements OnInit {
  jugadores: Jugador[] = [];
  filteredJugadores: Jugador[] = [];
  searchTerm: string = '';
  showEditModal: boolean = false;
  editJugador: Jugador = {} as Jugador;
  errorMessage: string | null = null; // Added for user feedback

  constructor(private jugadorService: JugadorService) {}

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
        this.filterJugadores();
      },
      error: (err) => {
        console.error('Error al cargar los jugadores:', err);
        this.errorMessage = 'Error al cargar los jugadores. Intenta de nuevo.';
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

  filterJugadores(): void {
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.filteredJugadores = this.jugadores.filter(jugador =>
        jugador.nombrePerfil.toLowerCase().includes(term)
      );
    } else {
      this.filteredJugadores = [...this.jugadores];
    }
  }

  openEditModal(jugador: Jugador): void {
    this.editJugador = { ...jugador };
    this.showEditModal = true;
    this.errorMessage = null; // Clear error message
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editJugador = {} as Jugador;
    this.errorMessage = null; // Clear error message
  }
  restrictInput(event: KeyboardEvent): void {
  const allowedRegex = /[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;
  const key = event.key;
  // Allow control keys (e.g., Backspace, Enter, Tab)
  if (event.ctrlKey || event.altKey || event.metaKey || key.length > 1) {
    return;
  }
  // Prevent invalid characters
  if (!allowedRegex.test(key)) {
    event.preventDefault();
  }
}

  saveEditedJugador(): void {
    const jugadorDTO = {
      nombrePerfil: this.editJugador.nombrePerfil,
    };

    this.jugadorService.updateJugador(this.editJugador.idJugador, jugadorDTO).subscribe({
      next: (updatedJugador) => {
        const index = this.jugadores.findIndex(j => j.idJugador === updatedJugador.idJugador);
        if (index !== -1) {
          this.jugadores[index] = { ...updatedJugador, nombrePerfil: this.cleanNombrePerfil(updatedJugador.nombrePerfil) };
          this.filterJugadores();
        }
        this.closeEditModal();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al actualizar el jugador:', err);
        console.log('Raw response:', err.error.text); // Log raw response for debugging
        this.errorMessage = 'Error al actualizar el jugador. Intenta de nuevo.';
        // If status is 200, assume update was successful and close modal
        if (err.status === 200) {
          // Reload players to reflect the update
          this.loadJugadores();
          this.closeEditModal();
        }
      },
    });
  }

  deleteJugador(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      this.jugadorService.deleteJugador(id).subscribe({
        next: () => {
          this.jugadores = this.jugadores.filter(jugador => jugador.idJugador !== id);
          this.filterJugadores();
        },
        error: (err) => {
          console.error('Error al eliminar el jugador:', err);
          this.errorMessage = 'Error al eliminar el jugador. Intenta de nuevo.';
        },
      });
    }
  }
}