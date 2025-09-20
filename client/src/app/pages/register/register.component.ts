import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { DataService } from '../../services/data.service';
import { User } from '../../models/types';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [RouterLink, NgIf]
})
export class RegisterComponent {
  private data = inject(DataService);
  private router = inject(Router);

  error = '';

  register(username: string, email: string, _pwd: string){
    const uName = username.trim().toLowerCase();
    const eMail = email.trim();

    if (!uName || !eMail) {
      this.error = 'Username and email are required';
      return;
    }

    // usernames must be unique in this app
    const users = this.data.users();
    if (users.some(u => u.username.toLowerCase() === uName)) {
      this.error = 'Username already taken';
      return;
    }

    // create user (Phase-1: default role = 'user', no groups)
    const id = 'u' + Date.now().toString(36);
    const newUser: User = { id, username: uName, email: eMail, roles: ['user'], groups: [] };

    users.push(newUser);
    this.data.saveUsers(users);
    this.data.setMe(newUser);

    // go to dashboard
    this.router.navigateByUrl('/dashboard');
  }
}
