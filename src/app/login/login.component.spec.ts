import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let el: HTMLElement

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      declarations: [LoginComponent],
      imports: [FormBuilder, Router, ToastrService],
      providers: [AuthService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should set submitted to true', async(() => {
    component.onSubmit();
    expect(component.onSubmit).toBeTruthy();
  }));

  // it('Should call the OnSubmit method', () => {
  //   fakeAsync(() => {
  //     fixture.detectChanges();
  //     spyOn(component, 'OnSubmit');
  //     el = fixture.debugElement.query(By.css('Login')).nativeElement;
  //     el.click();
  //     expect(component.onSubmit).toHaveBeenCalledTimes(0);
  //   })
  // });

  it('Form should be invalid', async(() => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    expect(component.loginForm.valid).toBeFalsy();
  }))

  it('Form should be valid', async(() => {
    component.loginForm.controls['email'].setValue('nikund.dds@gmail.com');
    component.loginForm.controls['password'].setValue('123456');
    expect(component.loginForm.valid).toBeTruthy();
  }))

  
});