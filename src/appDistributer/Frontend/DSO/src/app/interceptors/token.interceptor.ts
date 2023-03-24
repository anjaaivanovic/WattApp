import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SendRefreshToken } from '../models/sendRefreshToken';
import { RefreshTokenDto } from '../models/refreshTokenDto';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import jwt_decode from 'jwt-decode';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  counter = 0
  constructor(private cookie: CookieService, private toast: NgToastService, private router: Router, private auth: AuthServiceService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if(this.cookie.check("token"))
      {//ako token postoji
        const userToken = this.cookie.get("token");

        //uzimamo token i dodajemo ga u header zahteva
        request = request.clone(
          {
            setHeaders: {Authorization: "Bearer "+userToken}
          });
      }
      return next.handle(request).pipe(
        catchError((err:any)=>{
          if(err instanceof HttpErrorResponse && err.status==401)
          {
            if(this.counter==0)
            {
              this.counter =1;
              return this.handleAuth(request,next);
            }
            else if(this.counter==1)
            {
              this.counter=0;
              this.toast.warning({detail:"Warning", summary: err.error,duration: 3000});
              this.cookie.deleteAll();
              this.router.navigate(['login']);
            }
          }
          return throwError(()=> err);
        })
      );
  }

  handleAuth(request : HttpRequest<any>, next: HttpHandler)
  {
    let refreshDto = new SendRefreshToken();
    var refresh = this.cookie.get("refreshToken");
    var username = this.cookie.get('username');
    refreshDto.refreshToken = refresh;
    refreshDto.username = username;
    return this.auth.refreshToken(refreshDto)
    .pipe(
      switchMap((data: RefreshTokenDto)=>
      {
        this.counter = 0;
        this.cookie.set("token",data.token);
        this.cookie.set("refreshToken",data.refreshToken);
        /*var decodedToken:any = jwt_decode(data.token);
        this.cookie.set('username',decodedToken.username);
        this.cookie.set('role',decodedToken.role);*/
        request = request.clone(
          {
            setHeaders: {Authorization: "Bearer "+this.cookie.get("token")}
          });
        return next.handle(request);
      }),
      catchError((err)=>{
        return throwError(()=>{
          this.toast.warning({detail:"Warning", summary: err.error,duration: 3000});
          console.log(err.error);
          this.cookie.deleteAll();
          this.router.navigate(['login']);
        })
      })
    )
  }
}
