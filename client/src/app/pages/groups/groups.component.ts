import { Component, inject } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Group, User } from '../../models/types';

@Component({
  selector: 'app-groups',
  standalone: true,
  templateUrl: './groups.component.html',
  imports: [NgIf, NgForOf, RouterLink]
})
export class GroupsComponent {
  private data = inject(DataService);
  me: User | null = this.data.me();
  groups: Group[] = this.data.groups().filter(g => this.me?.groups.includes(g.id));

  refresh(){
    this.me = this.data.me();
    this.groups = this.data.groups().filter(g => this.me?.groups.includes(g.id));
  }

  addGroup(input: HTMLInputElement){
    const name = input.value.trim();
    if(!name) return;
    if(!this.me){ alert('Please login first'); return; }

    // simple Phase-1 rule: only group/super can create
    const canCreate = this.me.roles.includes('group') || this.me.roles.includes('super');
    if(!canCreate){ alert('Only group admins or super admins can create groups in Phase 1'); return; }

    const id = 'g' + (Date.now().toString(36));
    const next: Group = { id, name, ownerId: this.me.id, adminIds: [this.me.id], channelIds: [] };

    const all = this.data.groups(); all.push(next); this.data.saveGroups(all);

    // ensure creator is a member
    const users = this.data.users();
    const meRef = users.find(u => u.id === this.me!.id);
    if(meRef && !meRef.groups.includes(id)) { meRef.groups = [...meRef.groups, id]; this.data.saveUsers(users); this.data.setMe(meRef); }

    input.value = '';
    this.refresh();
  }

  removeGroup(id: string){
    if(!this.me){ alert('Please login first'); return; }
    const all = this.data.groups();
    const group = all.find(g => g.id === id); if(!group) return;

    const canRemove = this.me.roles.includes('super') || group.ownerId === this.me.id;
    if(!canRemove){ alert('Only owner or super can remove this group'); return; }

    // remove group
    const left = all.filter(g => g.id !== id); this.data.saveGroups(left);

    // remove channels of the group
    const ch = this.data.channels().filter(c => c.groupId !== id); this.data.saveChannels(ch);

    // detach from all users
    const users = this.data.users();
    users.forEach(u => u.groups = u.groups.filter(gid => gid !== id));
    this.data.saveUsers(users);

    this.refresh();
  }
}
