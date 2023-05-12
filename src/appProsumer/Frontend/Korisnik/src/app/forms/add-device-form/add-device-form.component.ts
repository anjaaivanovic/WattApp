import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/models/categories';
import { Models } from 'src/app/models/models';
import { DeviceType } from 'src/app/models/types';
import { AdddeviceserviceService } from 'src/app/services/adddeviceservice.service';

@Component({
  selector: 'app-add-device-form',
  templateUrl: './add-device-form.component.html',
  styleUrls: ['./add-device-form.component.css'],
})
export class AddDeviceFormComponent {

  notFilled: boolean = false;
  success: boolean = false;
  failure: boolean = false;
  categories: Category[] = [];
  dropDownCategory: boolean = false;
  dropDownType: boolean = false;
  dropDownModel: boolean = false;
  category: number = -1;
  type: number = -1;
  types: DeviceType[] = [];
  model: any = -1;
  models: Models[] = [];
  Name: string = '';
  manufacturer: string = '';
  DsoView: boolean = false;
  DsoControl: boolean = false;
  id: string = '';
  cat: any;
  typ: any;
  mod: any;
  maxlength: number = 18;
  dropdownCategory:boolean=false;
  dropdownType:boolean=true;
  dropdownModel:boolean=true;

  constructor(
    private service: AdddeviceserviceService,
    private cookie: CookieService,
    public toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.dropDownCategory = false;
    this.dropDownType = false;
    this.dropDownModel = false;
    this.service.dsoView = false;
    this.service.dsoControl = false;
    this.getCategories();
  }

  ChangeCategory(e: any) {
    this.dropdownType=!this.dropdownType;
    this.service.category = this.category;
    this.getTypes();
    this.type = -1;
  }

  getCategories() {
    this.service.getCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (err) => {
        console.log(err.error);
      },
    });
  }

  ChangeType(e: any) {
    this.dropdownModel=!this.dropdownModel;
    this.service.type = this.type;
    this.getModels();
    this.model = -1;
  }
  
  getTypes() {
    this.service.getTypes().subscribe({
      next: (response) => {
        this.types = response;

        this.dropDownType = true;
      },
      error: (err) => {
        console.log(err.error);
      },
    });
  }

  ChangeModels(e: any) {
    this.service.model = this.model.id;
    this.Name = this.model.name;
    this.service.name = this.Name;
    // console.log(this.model);
  }

  getModels() {
    
    this.service.getModels().subscribe({
      next: (response) => {
        this.models = response;
        this.dropDownModel = true;
      },
      error: (err) => {
        console.log(err.error);
      },
    });
  }

  ChangeName(e: any) {
    this.service.name = this.Name;
  }
  
  ChangeButtonView() {
    this.service.dsoView = this.DsoView;
    if(this.DsoView == false)
    {
      this.DsoControl = false;
      this.service.dsoControl = this.DsoControl;
    }
  }
  ChangeButtonControl() {
    this.service.dsoControl = this.DsoControl;
    if(this.DsoControl == true)
    {
      this.DsoView = true;
      this.service.dsoView = this.DsoView;
    }
  }

}
