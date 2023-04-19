import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ScreenWidthService } from 'src/app/services/screen-width.service';
import { UsersServiceService } from 'src/app/services/users-service.service';

@Component({
  selector: 'app-prediction-prosumer',
  templateUrl: './prediction-prosumer.component.html',
  styleUrls: ['./prediction-prosumer.component.css']
})
export class PredictionProsumerComponent implements OnInit {

  id: string = '';
  data : any[] = [];
  dataConsumers: any = [];
  dataProducers: any = [];
  colors: Color = {
    name: 'mycolors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FF414E', '#80BC00'],
  };
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Energy in kW';

  constructor(
    private service: UsersServiceService,
    private router: ActivatedRoute,
    private spiner: NgxSpinnerService,
    private widthService : ScreenWidthService
  ) {}

  ngOnInit() {
    this.id = this.router.snapshot.params['id'];
    document.getElementById('predictionUserInfoCardBody')!.style.height = (this.widthService.height*0.5) + 'px';
    this.PredictionWeek();
  }

  yAxisTickFormatting(value: number) 
  {
    return value + ' kW';
  }

  getWeek(date: Date): number 
  {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const millisecsInDay = 86400000;
    return Math.ceil(
      ((date.getTime() - oneJan.getTime()) / millisecsInDay +
        oneJan.getDay() +
        1) /
        7
    );
  }
  PredictionWeek() {
    this.service.PredictionProsumer7Days(this.id).subscribe((response: any) => {
      const consumptionTimestamps = response.consumption || {};
      const productionTimestamps = response.production || {};
      const allTimestamps = {
        ...consumptionTimestamps,
        ...productionTimestamps,
      };

      const data = Object.entries(allTimestamps).map(([timestamp, value]) => {
        const date = new Date(timestamp);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        return { dayOfWeek, timestamp, value };
      });

      const groupedData = data.reduce((acc: any, item: any) => {
        if (!acc[item.dayOfWeek]) {
          acc[item.dayOfWeek] = {
            name: item.dayOfWeek,
            series: [],
          };
        }
        const consumptionValue = consumptionTimestamps[item.timestamp] || 0.0;
        const productionValue = productionTimestamps[item.timestamp] || 0.0;
        const series = [
          { name: 'consumption', value: consumptionValue },
          { name: 'production', value: productionValue },
        ];
        acc[item.dayOfWeek].series.push(...series);
        return acc;
      }, {});

      const finalList = Object.values(groupedData);

      this.data = finalList;
    });
  }
  Prediction3Days()
  {
    this.service.PredictionProsumer3Days(this.id).subscribe((response: any) => {
      const myList: any = [];

      const consumptionTimestamps = response.consumption || {};
      const productionTimestamps = response.production || {};
      const allTimestamps = {
        ...consumptionTimestamps,
        ...productionTimestamps,
      };

      const data = Object.entries(allTimestamps).map(([timestamp, value]) => {
        const date = new Date(timestamp);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        return { dayOfWeek, timestamp, value };
      });

      const groupedData = data.reduce((acc: any, item: any) => {
        if (!acc[item.dayOfWeek]) {
          acc[item.dayOfWeek] = {
            name: item.dayOfWeek,
            series: [],
          };
        }
        const consumptionValue = consumptionTimestamps[item.timestamp] || 0.0;
        const productionValue = productionTimestamps[item.timestamp] || 0.0;
        const series = [
          { name: 'consumption', value: consumptionValue },
          { name: 'production', value: productionValue },
        ];
        acc[item.dayOfWeek].series.push(...series);
        return acc;
      }, {});

      const finalList = Object.values(groupedData);

      this.data = finalList;
    });
  }
  PredictionDay()
  {
    this.service.PredictionProsumer1Day(this.id).subscribe((response: any) => {
      const myList: any = [];

      const consumptionTimestamps = response.consumption || {};
      const productionTimestamps = response.production || {};
      const allTimestamps = {
        ...consumptionTimestamps,
        ...productionTimestamps,
      };

      Object.keys(allTimestamps).forEach((name) => {
        const consumptionValue = consumptionTimestamps[name] || 0.0;
        const productionValue = productionTimestamps[name] || 0.0;
        const series = [
          { name: 'consumption', value: consumptionValue },
          { name: 'production', value: productionValue },
        ];
        myList.push({ name, series });
      });

      const groupedData: any = {};

      myList.forEach((item: any) => {
        const date = new Date(item.name);
        const hour = date.getHours();
        const hourString = hour < 10 ? '0' + hour : hour.toString();
        const name = hourString + ':00h';
        if (!groupedData[name]) {
          groupedData[name] = {
            name,
            series: [],
          };
        }
        groupedData[name].series.push(...item.series);
      });

      const finalList = Object.values(groupedData);

      this.data = finalList;
    });
  }
}