export interface Pregunta {
    idPregunta?: number;
    textoPregunta: string;
    opciones: string;
    respuestaCorrecta: string;
    dificultad: string;
    tiempoLimite: number;
    categoria: string;
    costoEnergia: number;
    estado: 'activo' | 'inactivo';
  }