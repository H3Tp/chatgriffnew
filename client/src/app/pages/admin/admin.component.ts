import { Component, inject } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Group, User, Channel } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [NgIf, NgForOf, RouterLink]
})
export class AdminComponent {
  private data = inject(DataService);
  me: User | null = this.data.me();
  myGroups: Group[] = [];

  constructor(){ this.refresh(); }

  refresh(){
    this.me = this.data.me();
    const all = this.data.groups();
    this.myGroups = all.filter(g => g.ownerId === this.me?.id || g.adminIds.includes(this.me!.id));
  }

  canUse(): boolean {
    return !!this.me && (this.me.roles.includes('group') || this.me.roles.includes('super'));
  }

  createGroup(input: HTMLInputElement){
    if(!this.canUse()){ alert('Only group/super admins can create groups'); return; }
    const name = input.value.trim(); if(!name) return;
    const id = 'g' + Date.now().toString(36);
    const g: Group = { id, name, ownerId: this.me!.id, adminIds:[this.me!.id], channelIds:[] };
    const groups = this.data.groups(); groups.push(g); this.data.saveGroups(groups);

    // add creator to group membership
    const users = this.data.users();
    const meRef = users.find(u => u.id === this.me!.id);
    if(meRef && !meRef.groups.includes(id)){ meRef.groups=[...meRef.groups,id]; this.data.saveUsers(users); this.data.setMe(meRef); }

    input.value = '';
    this.refresh();
  }

  addChannel(groupId: string, input: HTMLInputElement){
    const name = input.value.trim(); if(!name) return;
    const groups = this.data.groups();
    const g = groups.find(x => x.id === groupId); if(!g) return;

    // must be admin of that group (or super)
    if(!(this.me && (this.me.roles.includes('super') || g.adminIds.includes(this.me.id)))){
      alert('You are not an admin of this group'); return;
    }

    const id = 'c' + Date.now().toString(36);
    const c: Channel = { id, name, groupId };
    const ch = this.data.channels(); ch.push(c); this.data.saveChannels(ch);

    if(!g.channelIds.includes(id)){ g.channelIds=[...g.channelIds,id]; this.data.saveGroups(groups); }

    input.value = '';
    this.refresh();
  }

  removeGroup(groupId: string){
    const groups = this.data.groups();
    const g = groups.find(x => x.id === groupId); if(!g) return;

    if(!(this.me && (this.me.roles.includes('super') || g.ownerId === this.me.id))){
      alert('Only owner or super can remove this group'); return;
    }
    // remove group
    this.data.saveGroups(groups.filter(x => x.id !== groupId));
    // remove channels
    this.data.saveChannels(this.data.channels().filter(c => c.groupId !== groupId));
    // detach from users
    const users = this.data.users();
    users.forEach(u => u.groups = u.groups.filter(gid => gid !== groupId));
    this.data.saveUsers(users);

    this.refresh();
  }
}
