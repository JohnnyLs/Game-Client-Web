import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreguntaService } from '../services/pregunta.service';
import { Pregunta } from '../models/pregunta.model';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class PreguntasComponent implements OnInit {
  preguntas: Pregunta[] = [];
  filteredPreguntas: Pregunta[] = [];
  searchTerm: string = '';
  selectedCategoria: string = '';
  categorias: string[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  currentPregunta: Pregunta = {
    textoPregunta: '',
    opciones: '',
    respuestaCorrecta: '',
    dificultad: '',
    tiempoLimite: 0,
    categoria: '',
    costoEnergia: 0,
    estado: 'activo'
  };
  opcion1: string = '';
  opcion2: string = '';
  opcion3: string = '';
  opcion4: string = '';
  showNuevaCategoriaInput: boolean = false;
  nuevaCategoria: string = '';

  constructor(private preguntaService: PreguntaService) {}

  ngOnInit(): void {
    this.loadPreguntas();
  }

  loadPreguntas(): void {
    this.preguntaService.obtenerTodasLasPreguntas().subscribe({
      next: (preguntas) => {
        this.preguntas = preguntas;
        this.filteredPreguntas = [...this.preguntas];
        this.extractCategorias();
        this.filterPreguntas();
      },
      error: (err) => {
        console.error('Error al cargar las preguntas:', err);
      }
    });
  }

  extractCategorias(): void {
    this.categorias = [...new Set(this.preguntas.map(p => p.categoria))].sort();
  }

  filterPreguntas(): void {
    this.filteredPreguntas = this.preguntas.filter(pregunta => {
      const matchesSearch = pregunta.textoPregunta.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategoria = this.selectedCategoria ? pregunta.categoria === this.selectedCategoria : true;
      return matchesSearch && matchesCategoria;
    });
  }

  onSearchChange(): void {
    this.filterPreguntas();
  }

  onCategoriaChange(): void {
    this.filterPreguntas();
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentPregunta = {
      textoPregunta: '',
      opciones: '',
      respuestaCorrecta: '',
      dificultad: '',
      tiempoLimite: 0,
      categoria: '',
      costoEnergia: 0,
      estado: 'activo'
    };
    this.opcion1 = '';
    this.opcion2 = '';
    this.opcion3 = '';
    this.opcion4 = '';
    this.showNuevaCategoriaInput = false;
    this.nuevaCategoria = '';
  }

  openEditForm(pregunta: Pregunta): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentPregunta = { ...pregunta };
    try {
      const opcionesArray = JSON.parse(pregunta.opciones);
      this.opcion1 = opcionesArray[0] || '';
      this.opcion2 = opcionesArray[1] || '';
      this.opcion3 = opcionesArray[2] || '';
      this.opcion4 = opcionesArray[3] || '';
    } catch (error) {
      console.error('Error al parsear las opciones:', error);
      this.opcion1 = '';
      this.opcion2 = '';
      this.opcion3 = '';
      this.opcion4 = '';
    }
    this.showNuevaCategoriaInput = !this.categorias.includes(pregunta.categoria);
    this.nuevaCategoria = this.showNuevaCategoriaInput ? pregunta.categoria : '';
  }

  savePregunta(): void {
  // Validar estado
  if (this.currentPregunta.estado !== 'activo' && this.currentPregunta.estado !== 'inactivo') {
    console.error('Estado inválido:', this.currentPregunta.estado);
    return;
  }

  // Validar todos los campos manualmente (por seguridad)
  if (!this.currentPregunta.textoPregunta ||
      !this.opcion1 ||
      !this.opcion2 ||
      !this.opcion3 ||
      !this.opcion4 ||
      !this.currentPregunta.respuestaCorrecta ||
      !this.currentPregunta.dificultad ||
      this.currentPregunta.tiempoLimite <= 0 ||
      this.currentPregunta.costoEnergia <= 0 ||
      !this.currentPregunta.estado) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }

  // Validar categoría
  if (this.showNuevaCategoriaInput) {
    if (!this.nuevaCategoria.trim()) { // Asegurarse de que no esté vacío o solo tenga espacios
      alert('Por favor, ingresa una nueva categoría.');
      return;
    }
    this.currentPregunta.categoria = this.nuevaCategoria.trim(); // Asignar el valor limpio
  } else if (!this.currentPregunta.categoria) {
    alert('Por favor, selecciona una categoría.');
    return;
  }

  // Convertir las opciones en un JSON
  const opcionesArray = [this.opcion1, this.opcion2, this.opcion3, this.opcion4];
  this.currentPregunta.opciones = JSON.stringify(opcionesArray);

  if (this.isEditing) {
    this.preguntaService.actualizarPregunta(this.currentPregunta.idPregunta!, this.currentPregunta).subscribe({
      next: (updatedPregunta) => {
        const index = this.preguntas.findIndex(p => p.idPregunta === updatedPregunta.idPregunta);
        this.preguntas[index] = updatedPregunta;
        this.extractCategorias();
        this.filterPreguntas();
        this.showForm = false;
      },
      error: (err) => {
        console.error('Error al actualizar la pregunta:', err);
      }
    });
  } else {
    this.preguntaService.crearPregunta(this.currentPregunta).subscribe({
      next: (newPregunta) => {
        this.preguntas.push(newPregunta);
        this.extractCategorias();
        this.filterPreguntas();
        this.showForm = false;
      },
      error: (err) => {
        console.error('Error al crear la pregunta:', err);
      }
    });
  }
}

  deletePregunta(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      this.preguntaService.eliminarPregunta(id).subscribe({
        next: () => {
          this.preguntas = this.preguntas.filter(p => p.idPregunta !== id);
          this.extractCategorias();
          this.filterPreguntas();
        },
        error: (err) => {
          console.error('Error al eliminar la pregunta:', err);
        }
      });
    }
  }

  toggleEstado(pregunta: Pregunta): void {
    const nuevoEstado: 'activo' | 'inactivo' = pregunta.estado === 'activo' ? 'inactivo' : 'activo';
    const updatedPregunta: Pregunta = { ...pregunta, estado: nuevoEstado };
    this.preguntaService.actualizarPregunta(pregunta.idPregunta!, updatedPregunta).subscribe({
      next: (response) => {
        pregunta.estado = response.estado;
        this.filterPreguntas();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la pregunta:', err);
      }
    });
  }

  cancelForm(): void {
    this.showForm = false;
  }

  onCategoriaSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.showNuevaCategoriaInput = value === 'otra';
    if (!this.showNuevaCategoriaInput) {
      this.currentPregunta.categoria = value;
      this.nuevaCategoria = '';
    } else {
      this.currentPregunta.categoria = '';
      this.nuevaCategoria = ''; 
    }
  }
}