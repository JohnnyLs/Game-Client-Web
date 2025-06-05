export interface Jugador {
    idJugador: number;
    nombrePerfil: string;
    tiempoTotal: number;
    aciertosTotales: number;
    erroresTotales: number;
    partidas: Partida[];
  }
  
  export interface Partida {
    idPartida: number;
    personaje: string;
    fechaInicio: string;
  }