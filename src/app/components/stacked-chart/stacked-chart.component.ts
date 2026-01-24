import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
    selector: 'stacked-chart',
    standalone: true,
    imports: [NgxEchartsDirective],
    templateUrl: './stacked-chart.component.html'
})
export class StackedChartComponent {
    readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 👇 FORCE chart to be wider than container
    // 1 bar = 58px
    // gap ≈ 40px
    readonly chartWidth = this.months.length * (58 + 40);

    options = {
        grid: {
            left: 30,
            right: 30,
            top: 40,
            bottom: 36,
            height: 80
        },

        xAxis: {
            type: 'category',
            data: this.months,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#6B7280',
                fontSize: 12,
                margin: 12
            }
        },

        yAxis: {
            show: false,
            max: 4
        },

        series: [
            {
                type: 'bar',
                stack: 'total',
                barWidth: 58,
                barCategoryGap: '70%', // month spacing
                barGap: '20%', // ✅ vertical gap BETWEEN stacked blocks
                data: Array(12).fill(1),
                itemStyle: {
                    color: '#334155',
                    borderRadius: [2, 2, 0, 0]
                }
            },
            {
                type: 'bar',
                stack: 'total',
                barGap: '20%',
                data: Array(12).fill(1),
                itemStyle: { color: '#475569' }
            },
            {
                type: 'bar',
                stack: 'total',
                barGap: '20%',
                data: Array(12).fill(1),
                itemStyle: { color: '#64748B' }
            },
            {
                type: 'bar',
                stack: 'total',
                barGap: '20%',
                data: Array(12).fill(1),
                itemStyle: {
                    color: '#94A3B8',
                    borderRadius: [0, 0, 2, 2]
                },
                label: {
                    show: true,
                    position: 'top',
                    rotate: 0,
                    distance: 8, // ⬆ more breathing room
                    formatter: '2.1K',
                    color: '#6B7280',
                    fontSize: 12,
                    fontWeight: 500
                }
            }
        ]
    };
}
