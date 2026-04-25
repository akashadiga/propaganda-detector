import { Component, computed, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionService, PredictionResult, RandomSample } from '../../services/prediction.service';

@Component({
  selector: 'app-predictor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './predictor.component.html',
})
export class PredictorComponent {
  resultReady = output<PredictionResult | null>();

  // All reactive state as signals — required for zoneless change detection
  text = signal('');
  loading = signal(false);
  generating = signal(false);
  error = signal('');

  readonly maxChars = 10000;
  readonly minChars = 20;

  charCount = computed(() => this.text().length);
  isOverLimit = computed(() => this.charCount() > this.maxChars);
  canPredict = computed(() =>
    this.charCount() >= this.minChars && !this.isOverLimit() && !this.loading()
  );

  constructor(private predictionService: PredictionService) {}

  onPredict(): void {
    if (!this.canPredict()) return;
    this.loading.set(true);
    this.error.set('');
    this.predictionService.predict(this.text()).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.resultReady.emit(result);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Make sure the Flask server is running.');
      },
    });
  }

  onGenerate(): void {
    this.generating.set(true);
    this.error.set('');
    this.predictionService.getRandom().subscribe({
      next: (sample: RandomSample) => {
        this.text.set(sample.text);
        this.generating.set(false);
      },
      error: () => {
        this.generating.set(false);
        this.error.set('Could not fetch a random sample.');
      },
    });
  }

  onClear(): void {
    this.text.set('');
    this.error.set('');
    this.resultReady.emit(null);
  }
}
