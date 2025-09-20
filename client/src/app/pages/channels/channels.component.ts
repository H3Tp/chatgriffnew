import { Component, inject } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Channel, Group, User } from '../../models/types';

@Component({
  selector: 'app-channels',
  standalone: true,
  templateUrl: './channels.component.html',
  imports: [NgIf, NgForOf, RouterLink]
})
export class ChannelsComponent {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);

  me: User | null = this.data.me();
  groupId = this.route.snapshot.paramMap.get('groupId') ?? '';
  group: Group | undefined = this.data.groups().find(g => g.id === this.groupId);
  channels: Channel[] = this.data.channels().filter(c => c.groupId === this.groupId);

  refresh(){
    this.me = this.data.me();
    this.group = this.data.groups().find(g => g.id === this.groupId);
    this.channels = this.data.channels().filter(c => c.groupId === this.groupId);
  }

  canManage(): boolean {
    if(!this.me || !this.group) return false;
    return this.me.roles.includes('super') || this.group.adminIds.includes(this.me.id);
  }

  addChannel(input: HTMLInputElement){
    const name = input.value.trim();
    if(!name) return;
    if(!this.group){ alert('Group not found'); return; }
    if(!this.canManage()){ alert('Only group admins or super can add channels'); return; }

    const id = 'c' + Date.now().toString(36);
    const next: Channel = { id, name, groupId: this.group.id };

    const all = this.data.channels(); all.push(next); this.data.saveChannels(all);

    // store ref in group
    const groups = this.data.groups();
    const g = groups.find(x => x.id === this.group!.id);
    if(g && !g.channelIds.includes(id)){ g.channelIds = [...g.channelIds, id]; this.data.saveGroups(groups); }

    input.value = '';
    this.refresh();
  }

  removeChannel(id: string){
    if(!this.group || !this.canManage()) return;
    const left = this.data.channels().filter(c => c.id !== id);
    this.data.saveChannels(left);

    const groups = this.data.groups();
    const g = groups.find(x => x.id === this.group!.id);
    if(g){ g.channelIds = g.channelIds.filter(cid => cid !== id); this.data.saveGroups(groups); }

    this.refresh();
  }
}
