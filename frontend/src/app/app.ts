import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PredictorComponent } from './components/predictor/predictor.component';
import { ResultComponent } from './components/result/result.component';
import { PredictionResult } from './services/prediction.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PredictorComponent, ResultComponent],
  templateUrl: './app.html',
})
export class App {
  result = signal<PredictionResult | null>(null);

  onResult(result: PredictionResult | null): void {
    this.result.set(result);
  }
}
