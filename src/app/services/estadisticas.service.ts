import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private apiUrl = environment.apiBaseUrl + 'dashboard';


  constructor(private http: HttpClient) {}

  getTopJugadores(limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-jugadores/${limit}`);
  }

  getTopJugadoresCategoria(limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-jugadores-categoria/${limit}`);
  }

  getHistoricoPartidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historico-partidas`);
  }
}