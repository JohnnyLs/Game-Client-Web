import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';
import { Reporte } from '../models/reporte.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
 
  private apiUrl = environment.apiBaseUrl + 'con_jugadores';
  private adminApiUrl = environment.apiBaseUrl + 'admin/jugadores';
  private reportesUrl = environment.apiBaseUrl + 'reportes';

  constructor(private http: HttpClient) {}

  getJugadores(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(this.apiUrl);
  }

  getReporte(idPartida: number): Observable<Reporte> {
    const headers = new HttpHeaders().set('idPartida', idPartida.toString());
    return this.http.get<Reporte>(`${this.reportesUrl}/${idPartida}`, { headers });
  }

  updateJugador(id: number, jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.put<Jugador>(`${this.adminApiUrl}/${id}`, jugador);
  }

  deleteJugador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }
}