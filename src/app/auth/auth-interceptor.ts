import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable() // Makes this class an injectable service to be used elsewhere - registered as provider in app.module
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // Grab the http req. modifier the header to include 'Bearer' + token, pass it on
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    const authRequest = req.clone({ // important to work on a clone of the req, not the original
      // adds a new header w/c WE named authorization in check-auth.js
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
    });
    return next.handle(authRequest);
  }
}
