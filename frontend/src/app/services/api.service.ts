import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildParams(params);

    return this.http
      .get<T>(url, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http
      .post<T>(url, data)
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http
      .put<T>(url, data)
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http
      .delete<T>(url)
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * File upload request
   */
  upload<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
  ): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.http
      .post<T>(url, formData)
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * Multiple files upload request
   */
  uploadMultiple<T>(
    endpoint: string,
    files: File[],
    fieldName: string = 'files',
  ): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(fieldName, file);
    });

    return this.http
      .post<T>(url, formData)
      .pipe(retry(1), catchError(this.handleError));
  }

  /**
   * Stream request for chat responses
   */
  stream<T>(endpoint: string, data?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http
      .post<T>(url, data, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'text/plain',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Build HTTP parameters
   */
  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
