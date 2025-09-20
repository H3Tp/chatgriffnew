import { Component, inject } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { User, Group } from '../../models/types';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  templateUrl: './super-admin.component.html',
  imports: [NgIf, NgForOf, RouterLink]
})
export class SuperAdminComponent {
  private data = inject(DataService);
  me: User | null = this.data.me();
  users = this.data.users();
  groups = this.data.groups();

  isSuper(): boolean { return !!this.me && this.me.roles.includes('super'); }

  refresh(){
    this.users = this.data.users();
    this.groups = this.data.groups();
    this.me = this.data.me();
  }

  promoteToGroup(id: string){
    if(!this.isSuper()) return;
    const users = this.data.users();
    const u = users.find(x => x.id === id); if(!u) return;
    if(!u.roles.includes('group')) u.roles = [...u.roles, 'group'];
    this.data.saveUsers(users);
    this.refresh();
  }

  demoteFromGroup(id: string){
    if(!this.isSuper()) return;
    const users = this.data.users();
    const u = users.find(x => x.id === id); if(!u) return;
    u.roles = u.roles.filter(r => r !== 'group');
    this.data.saveUsers(users);
    this.refresh();
  }

  promoteToSuper(id: string){
    if(!this.isSuper()) return;
    const users = this.data.users();
    const u = users.find(x => x.id === id); if(!u) return;
    if(!u.roles.includes('super')) u.roles = [...u.roles, 'super'];
    this.data.saveUsers(users);
    this.refresh();
  }

  deleteUser(id: string){
    if(!this.isSuper()) return;
    // remove from users list
    const left = this.data.users().filter(u => u.id !== id);
    this.data.saveUsers(left);
    // remove from groups adminIds if present
    const grps = this.data.groups();
    grps.forEach(g => g.adminIds = g.adminIds.filter(aid => aid !== id));
    this.data.saveGroups(grps);
    // clear me if deleting self (unlikely)
    if(this.me?.id === id) this.data.setMe(null);
    this.refresh();
  }

  assignToGroup(userId: string, groupId: string){
    if(!this.isSuper()) return;
    const users = this.data.users();
    const u = users.find(x => x.id === userId); if(!u) return;
    if(!u.groups.includes(groupId)) u.groups = [...u.groups, groupId];
    this.data.saveUsers(users);
    this.refresh();
  }

  createGroup(input: HTMLInputElement){
    if(!this.isSuper()) return;
    const name = input.value.trim(); if(!name) return;
    const id = 'g' + Date.now().toString(36);
    const owner = this.me!.id;
    const g: Group = { id, name, ownerId: owner, adminIds:[owner], channelIds:[] };
    const groups = this.data.groups(); groups.push(g); this.data.saveGroups(groups);
    input.value = '';
    this.refresh();
  }
}
