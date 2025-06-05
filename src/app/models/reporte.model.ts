export interface Reporte {
    idPartida: number;
    nombrePerfil: string;
    personaje: string;
    tiempoTotalPartida: number;
    aciertosPartida: number;
    erroresPartida: number;
    fechaInicio: string;
    respuestas: Respuesta[];
  }
  
  export interface Respuesta {
    idRespuesta: number;
    textoPregunta: string;
    opciones: string;
    respuestaCorrecta: string;
    dificultad: string;
    categoria: string;
    respuestaDada: string;
    esCorrecta: boolean;
    tiempoRespuesta: number;
  }