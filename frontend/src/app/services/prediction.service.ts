import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionResult {
  original: string;
  preprocessed: string;
  prediction: 'Propaganda' | 'non-Propaganda';
}

export interface RandomSample {
  title: string;
  text: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  constructor(private http: HttpClient) {}

  predict(text: string): Observable<PredictionResult> {
    return this.http.post<PredictionResult>('/api/predict', { text });
  }

  getRandom(): Observable<RandomSample> {
    return this.http.get<RandomSample>('/api/random');
  }
}
