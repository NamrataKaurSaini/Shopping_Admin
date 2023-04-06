import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  errorMsg: String;
  loginInProcess: boolean;
  user: any;

  loginForm: FormGroup;
  
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.errorMsg = '';
    this.loginInProcess = false;

    this.loginForm = new FormGroup({
      email: new FormControl("", Validators.required),
      pass: new FormControl("", Validators.required),
    });
  }

  onEmailFormSubmit(form) {

    const context = this;
    context.loginInProcess = true;
    this.errorMsg = '';
    // const loginObj = form.value;
    // console.log(loginObj);

    const loginPromise = this.authService.login(form.value.email, form.value.pass);
    loginPromise.then(function(suc) {
      context.loginInProcess = false;
    }).catch(function(err) {
      console.log(err);
      context.loginInProcess = false;

      if (err.code === 'auth/user-not-found') {
        context.errorMsg = 'user does not exist, please check email !';
      } else if (err.code === 'auth/user-disabled') {
        context.errorMsg = 'user is disabled, please contact admin !';
      } else if (err.code === 'auth/wrong-password') {
        context.errorMsg = 'Incorrect password !!!';
      } else {
        context.errorMsg = 'Error Occurred, please try again !';
      }


    });
  }

  ngOnDestroy() {
  }

}
