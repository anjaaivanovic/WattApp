import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DeviceWidthService } from 'src/app/services/device-width.service';
import { DevicesService } from 'src/app/services/devices.service';
import { fromEvent, Observable, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from 'ngx-spinner';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-realization-chart-production',
  templateUrl: './realization-chart-production.component.html',
  styleUrls: ['./realization-chart-production.component.css'],
})
export class RealizationChartProductionComponent
  implements OnInit, AfterViewInit
{
  chart: any;
  data: any[] = ['z'];
  production = true;
  consumption = true;
  show!: boolean;
  resizeObservable$!: Observable<Event>;
  resizeSubscription$!: Subscription;
  coef: number = 0.6;

  constructor(
    private deviceService: DevicesService,
    private widthService: DeviceWidthService,
    private spiner: NgxSpinnerService
  ) {}

  exportTable(data: any[]): void {
    const headerRow = [
      '',
      'Energy Production (kW)',
      'Predicted Production (kW)',
    ];
    const sheetData = [headerRow];

    const maxLength = Math.max(data[0]?.values.length, data[1]?.values.length);

    for (let i = 0; i < maxLength; i++) {
      const consumptionValue = data[0]?.values[i];
      const productionValue = data[1]?.values[i];

      const row = [
        consumptionValue
          ? consumptionValue.x
          : productionValue
          ? productionValue.x
          : '',
        consumptionValue ? consumptionValue.y.toFixed(2) : 0,
        productionValue ? productionValue.y.toFixed(2) : 0,
      ];

      sheetData.push(row);
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');
    XLSX.writeFile(workbook, 'chart-data.xlsx');
  }

  ngAfterViewInit(): void {
    const grafik = document.getElementById('grafikPredictionHistory');
    grafik!.style!.height = this.widthService.height * this.coef + 'px';
    document.getElementById('realizPred1')!.classList.add('active');
  }

  ngOnInit(): void {
    this.HistoryWeek('realizPred1');
    document.getElementById(
      'modalFadePredictionRealizationTableBody'
    )!.style.maxHeight = this.widthService.height * 0.6 + 'px';
    if (
      this.widthService.deviceWidth >= 576 ||
      this.widthService.height >= this.widthService.deviceWidth * 2
    )
      this.coef = 0.5;

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe((evt) => {
      this.coef = 0.6;
      if (
        this.widthService.deviceWidth >= 576 ||
        this.widthService.height >= this.widthService.deviceWidth * 2
      )
        this.coef = 0.5;
      const grafik = document.getElementById('grafikPredictionHistory');
      grafik!.style!.height = this.widthService.height * this.coef + 'px';
    });
  }

  HistoryData(period: string, serviceFunction: any) {
    this.show = true;
    this.spiner.show('spiner2');
    serviceFunction().subscribe((response: any) => {
      const consumptionTimestamps = response.production.timestamps || {};
      const productionTimestamps = response.production.predictions || {};

      const formatData = (data: any, period: string) => {
        return Object.keys(data).map((name) => {
          const date = new Date(name);
          let label = '';

          if (period === 'year') {
            label = date.toLocaleString('default', { month: 'long' });
          } else {
            const dayNumber = date.getDate();
            const monthName = date.toLocaleString('default', { month: 'long' });
            label = `${monthName} ${dayNumber}`;
          }

          return {
            x: label,
            y: data[name] || 0.0,
          };
        });
      };

      const consumptionData = formatData(consumptionTimestamps, period);

      const productionData = formatData(productionTimestamps, period);

      this.data = [];

      if (consumptionData.length > 0) {
        this.data = [
          { type: 'consumption', values: consumptionData },

          { type: 'production', values: productionData },
        ];
      }

      if (this.data.length === 0) {
        this.spiner.hide('spiner2');
        return;
      }

      const chartData = {
        datasets: [
          {
            label: 'Electric Energy Production',
            data: consumptionData,
            backgroundColor: 'rgba(128, 188, 0, 1)',
            borderColor: 'rgba(128, 188, 0, 1)',
          },
          {
            label: 'Electric Energy Predicted Production',
            data: productionData,
            backgroundColor: 'rgba(0, 188, 179, 1)',
            borderColor: 'rgba(0, 188, 179, 1)',
          },
        ],
      };

      const chartElement: any = document.getElementById(
        'chartCanvasProduction'
      ) as HTMLElement;
      if (this.chart) {
        this.chart.destroy();
      }

      const chart2d = chartElement.getContext('2d');
      this.chart = new Chart(chart2d, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Electric Energy [kWh]',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
            },
          },
          maintainAspectRatio: false,
        },
      });
      this.spiner.hide('spiner2');
      this.show = false;
    });
  }

  HistoryWeek(id: string) {
    this.HistoryData(
      'week',
      this.deviceService.history7Days.bind(this.deviceService)
    );
    this.activateButton(id);
  }

  HistoryMonth(id: string) {
    this.HistoryData(
      'month',
      this.deviceService.history1Month.bind(this.deviceService)
    );
    this.activateButton(id);
  }

  HistoryYear(id: string) {
    this.HistoryData(
      'year',
      this.deviceService.history1Year.bind(this.deviceService)
    );
    this.activateButton(id);
  }

  activateButton(buttonNumber: string) {
    const buttons = document.querySelectorAll('.realizationPredictionbtn');
    buttons.forEach((button) => {
      if (button.id == buttonNumber) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}
