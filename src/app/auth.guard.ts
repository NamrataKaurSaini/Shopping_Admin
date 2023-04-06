import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { AuthService } from './services/auth.service';

import {tap, take, map} from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
  ) { }

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map(user => user && true),
      tap(isAdmin => {
        if (!isAdmin) {
          this.authService.signOut();
        }
      })
    );
   
  }
}
