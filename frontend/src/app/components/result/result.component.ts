import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '../../services/prediction.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  // Signal-based input — change detection fires when parent signal changes
  result = input<PredictionResult | null>(null);

  isPropaganda = computed(() => this.result()?.prediction === 'Propaganda');
}
