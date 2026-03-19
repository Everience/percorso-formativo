import { Component, input } from '@angular/core';

@Component({
    selector: 'app-kpi-card',
    templateUrl: './kpi-card.html',
    styleUrl: './kpi-card.scss',
})
export class KpiCard {
    readonly label = input.required<string>();
    readonly value = input.required<string | number>();
    readonly sublabel = input<string>();
    readonly trend = input<'up' | 'down' | 'neutral'>();
    readonly color = input<'accent' | 'blue' | 'green' | 'amber'>('accent');
}
