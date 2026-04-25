import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() resultReady = new EventEmitter<PredictionResult>();

  text = '';
  loading = false;
  generating = false;
  error = '';
  readonly maxChars = 10000;
  readonly minChars = 20;

  get charCount(): number {
    return this.text.length;
  }

  get isOverLimit(): boolean {
    return this.charCount > this.maxChars;
  }

  get canPredict(): boolean {
    return this.charCount >= this.minChars && !this.isOverLimit && !this.loading;
  }

  constructor(private predictionService: PredictionService) {}

  onPredict(): void {
    if (!this.canPredict) return;
    this.loading = true;
    this.error = '';
    this.predictionService.predict(this.text).subscribe({
      next: (result) => {
        this.loading = false;
        this.resultReady.emit(result);
      },
      error: () => {
        this.loading = false;
        this.error = 'Something went wrong. Make sure the Flask server is running.';
      },
    });
  }

  onGenerate(): void {
    this.generating = true;
    this.error = '';
    this.predictionService.getRandom().subscribe({
      next: (sample: RandomSample) => {
        this.text = sample.text;
        this.generating = false;
      },
      error: () => {
        this.generating = false;
        this.error = 'Could not fetch a random sample.';
      },
    });
  }

  onClear(): void {
    this.text = '';
    this.error = '';
    this.resultReady.emit(undefined as any);
  }
}
