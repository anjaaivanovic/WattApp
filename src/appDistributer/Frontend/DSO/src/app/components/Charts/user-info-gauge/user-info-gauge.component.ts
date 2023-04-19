import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { ScreenWidthService } from 'src/app/services/screen-width.service';
import { UsersServiceService } from 'src/app/services/users-service.service';

@Component({
  selector: 'app-user-info-gauge',
  templateUrl: './user-info-gauge.component.html',
  styleUrls: ['./user-info-gauge.component.css']
})
export class UserInfoGaugeComponent implements OnInit, AfterViewInit {
  
  id : string = '';
  consumption = 0;
  production = 0;
  data : number = 0;
  gaugeLabel = "Consumption";
  gaugeAppendText = "kW";
  width : number = 250;
  showLegend : boolean = true;
  markers : any;
  thresholds : any ;

  constructor(
    private service: UsersServiceService,
    private router: ActivatedRoute,
    private widthService : ScreenWidthService
  ) {}

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.id = this.router.snapshot.params['id'];
    document.getElementById('userInfoGaugeChart')!.style.height = (this.widthService.height*0.4) + 'px';
    this.width = document.getElementById('userInfoGaugeChartCardBody')!.offsetWidth*0.8;
    this.thresholds = {'0':{color:'green',bgOpacity:.2},'350':{color:'#2a96d9', bgOpacity:.2},'1600':{color:'#c14b48', bgOpacity:.2}};
    this.markers = {'0':{color:'black', label:'0'}, '350':{color:'black', label:'350'}, '1600':{color:'black', label:'1600'}};
    this.getMonthsConsumptionAndProduction();
  }

  getMonthsConsumptionAndProduction()
  {
    this.service.ThisMonthsConsumptionAndProductionForProsumer(this.id)
    .subscribe({
      next:(res)=>{
        this.consumption = res.consumption.toFixed(1);
        this.production = res.production.toFixed(1);
        console.log(this.production)
        this.data = this.consumption
      }
    })
  }
  Consumption()
  {
    this.data = this.consumption;
    this.markers = {'0':{color:'black', label:'0'}, '350':{color:'black', label:'350'}, '1600':{color:'black', label:'1600'}};
    this.thresholds = {'0':{color:'green',bgOpacity:.2},'350':{color:'#2a96d9', bgOpacity:.2},'1600':{color:'#c14b48', bgOpacity:.2}};
    this.gaugeLabel = "Consumption";
    this.showLegend = true;
  }
  Production()
  {
    this.data = this.production;
    this.markers = {'0':{color:'black', label:'0'}, '100':{color:'black', label:'100'}, '200':{color:'black', label:'200'},
                    '300':{color:'black', label:'300'}, '400':{color:'black', label:'400'}, '500':{color:'black', label:'500'},
                    '600':{color:'black', label:'600'}, '700':{color:'black', label:'700'}, '800':{color:'black', label:'800'},
                    '900':{color:'black', label:'900'}, '1000':{color:'black', label:'1000'}, '1100':{color:'black', label:'1100'}, 
                    '1200':{color:'black', label:'1200'}, '1300':{color:'black', label:'1300'}, '1400':{color:'black', label:'1400'},
                    '1500':{color:'black', label:'1500'}, '1600':{color:'black', label:'1600'}, '1700':{color:'black', label:'1700'}};
    this.thresholds = {'0':{color:'green',bgOpacity:.2}};
    this.gaugeLabel = "Production";
    this.showLegend = false;
  }
}
