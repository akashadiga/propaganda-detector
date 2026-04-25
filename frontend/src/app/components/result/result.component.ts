import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '../../services/prediction.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
})
export class ResultComponent {
  @Input() result: PredictionResult | null = null;

  get isPropaganda(): boolean {
    return this.result?.prediction === 'Propaganda';
  }
}
