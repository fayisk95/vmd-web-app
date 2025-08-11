import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'api';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  /** GET items from the server */
  get<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError<T[]>(`get${endpoint}`, []))
      );
  }

  /** GET item by id from the server */
  getById<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url)
      .pipe(
        catchError(this.handleError<T>(`get${endpoint} id=${id}`))
      );
  }

  /** POST: add a new item to the server */
  post<T>(endpoint: string, item: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, item, this.httpOptions)
      .pipe(
        catchError(this.handleError<T>(`add${endpoint}`))
      );
  }

  /** PUT: update the item on the server */
  put<T>(endpoint: string, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}`, item, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>(`update${endpoint}`))
      );
  }

  /** DELETE: delete the item from the server */
  delete<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}/${id}`;
    return this.http.delete<T>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError<T>(`delete${endpoint}`))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}