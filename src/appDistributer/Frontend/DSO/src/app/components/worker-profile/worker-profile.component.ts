// import { NgToastService } from 'ng-angular-popup';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EmployeesServiceService } from 'src/app/services/employees-service.service';
import { ScreenWidthService } from 'src/app/services/screen-width.service';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ChangeWorkerPasswordComponent } from 'src/app/forms/change-worker-password/change-worker-password.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.css'],
})
export class WorkerProfileComponent implements OnInit, AfterViewInit {
  worker: any;
  side: any;
  sadrzaj: any;
  loader: boolean = true;
  resizeObservable$!: Observable<Event>;
  resizeSubscription$!: Subscription;

  role: string = '';
  region: string = '';
  startedWorking : string = '';

  imgChangeEvet: any = '';
  croppedImage: any = '';
  currentImage : string = 'assets/images/employee-default-pfp.png';
  selectedImageFile : any = null;
  fileType : any = '';
  errorDeletePhoto : boolean = false;
  updatedPhotoSuccess : boolean = false;
  updatedPhotoError : boolean = false;
  noFile : boolean = false;

  @ViewChild('changePasswordWorkerForm', {static : true}) changePasswordWorkerForm! : ChangeWorkerPasswordComponent;

  constructor(
    private workerService: EmployeesServiceService,
    private cookie: CookieService,
    public toast: ToastrService,
    private widthService: ScreenWidthService,
    private sant : DomSanitizer,
    private employeeService : EmployeesServiceService
  ) {}

  ngAfterViewInit(): void {
    // this.sadrzaj.style.height = this.widthService.height * 0.7 + 'px';
    this.side.style.height = this.widthService.height * 0.7 + 'px';
    document.getElementById('cropNewImageWorkerProfile')!.style.maxHeight = this.widthService.height * 0.95 + 'px';
    document.getElementById('showChangeImage')!.style.maxHeight = this.widthService.height * 0.7 + 'px';
  }

  ngOnInit(): void {
    this.sadrzaj = document.getElementById('sadrzaj');
    this.side = document.getElementById('side');
    this.side.style.height = this.widthService.height * 0.7 + 'px';
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe((evt) => {
      // this.sadrzaj.style.height = this.widthService.height * 0.7 + 'px';
      this.side.style.height = this.widthService.height * 0.7 + 'px';
    });
    this.getInfo();
    if (this.cookie.get('role') == 'Dso') {
      this.role = 'Admin';
    } else if (this.cookie.get('role') == 'WorkerDso') {
      this.role = 'Employee';
    }
    setTimeout(() => {
      this.loader = false;
    }, 2000);
  }

  private getInfo() {
    let id = this.cookie.get('id');

    this.workerService.detailsEmployee(id).subscribe({
      next: (res) => {
        this.worker = res;
        // console.log(this.worker.image);
        this.Image(this.worker.image);
        let date = new Date(this.worker.prosumerCreationDate);
        this.startedWorking = date.getDay() + '. ' + date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear() + '.';
        this.region = this.cookie.get('region');
      },
      error: (err) => {
        console.log(err.error);
        this.toast.error('Error!', 'Unable to get Region Name.', {
          timeOut: 2500,
        });
      },
    });
  }

  private Image(image : any)
  {
    this.currentImage = 'assets/images/employee-default-pfp.png';
    if(image != "" && image != null)
    {
      let byteArray = new Uint8Array(
        atob(image)
        .split('')
        .map((char)=> char.charCodeAt(0))
      );
      let file = new Blob([byteArray], {type: 'image/png'});
      this.currentImage = URL.createObjectURL(file);
    }
  }

  //izmena sifre
  OpenChangePassword()
  {
    document.getElementById('openChangePasswordWorkerPRofile')!.click();
  }
  closeChange()
  {
    document.getElementById('openWorkerProfileAgain')!.click()
    this.selectedImageFile = null;
  }
  confirmNewPassword()
  {
    this.changePasswordWorkerForm.changePassword();
  }
  
  //izmena slike
  openChangePhoto()
  {
    this.resetAll();
    document.getElementById('openChangePhotoWorkerProfile')!.click();
  }
  confirmNewPhoto()
  {
    if(this.selectedImageFile != null)
    {
      this.croppedImage = this.croppedImage.replace('data:image/png;base64,','');
      console.log(this.croppedImage);
      // let byteArray = new Uint8Array(
      //   atob(this.croppedImage)
      //   .split('')
      //   .map((char)=> char.charCodeAt(0))
      // );
      // let file = new Blob([byteArray], {type: 'image/png'});

      // let formData = new FormData();
      // formData.append('imageFile',file);
      // this.employeeService.updateProfilePhoto(this.cookie.get('id'), formData)
      // .subscribe({
      //   next:(res)=>{
      //     this.getInfo();
      //     this.updatedPhotoSuccess = true;
      //     setTimeout(()=>{
      //       this.closeChange();
      //       this.resetAll();
      //     }, 700)
      //   },
      //   error:(err)=>{
      //     this.updatedPhotoError = true;
      //     console.log(err.error);
      //   }
      // })
    }
    else
    {
      this.noFile = true;
    }
  }
  deleteImage()
  {
    this.errorDeletePhoto = false;
    this.employeeService.deleteProfilePhoto(this.cookie.get('id'))
    .subscribe({
      next:(res)=>{
        this.currentImage = 'assets/images/employee-default-pfp.png';
        document.getElementById('closeOprionsForPhoto')!.click();
      },
      error:(err)=>{
        this.errorDeletePhoto = true;
        console.log(err.error);
      }
    });
  }
  onFileSelected(event: any) {
    this.imgChangeEvet = event;
    if(event.target.files)
    {
      this.selectedImageFile = event.target.files[0];
      this.fileType = event.target.files[0].type;
      // this.changeImage = this.sant.bypassSecurityTrustUrl(window.URL.createObjectURL(this.selectedImageFile)) as string;
    }
  }
  cropImg(e: ImageCroppedEvent) {
    this.croppedImage = e.base64;
  }
  openCrop()
  {
    document.getElementById('openCropImageBtn')!.click()
  }
  private resetAll()
  {
    this.errorDeletePhoto = false;
    this.selectedImageFile = null;
    this.imgChangeEvet = '';
    this.updatedPhotoError = false;
    this.updatedPhotoSuccess = false;
    this.noFile = false;
  }
}
