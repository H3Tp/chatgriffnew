import { Injectable } from '@angular/core';
import { User, Group, Channel } from '../models/types';

const K = { users:'users', groups:'groups', channels:'channels', me:'me' };
const R = <T>(k:string, d:T)=> JSON.parse(localStorage.getItem(k) ?? 'null') ?? d;
const W = (k:string, v:any)=> localStorage.setItem(k, JSON.stringify(v));

@Injectable({ providedIn:'root' })
export class DataService {
  users(): User[] { return R<User[]>(K.users, []); }
  groups(): Group[] { return R<Group[]>(K.groups, []); }
  channels(): Channel[] { return R<Channel[]>(K.channels, []); }
  me(): User|null { return R<User|null>(K.me, null); }

  saveUsers(v:User[]){ W(K.users, v); }
  saveGroups(v:Group[]){ W(K.groups, v); }
  saveChannels(v:Channel[]){ W(K.channels, v); }
  setMe(u:User|null){ W(K.me, u); }

  seedIfEmpty(){
    if(!localStorage.getItem(K.users)){
      const superU: User = { id:'u1', username:'super', email:'super@chatit', roles:['super'], groups:['g1'] };
      const ga    : User = { id:'u2', username:'alice', email:'a@chatit', roles:['group'], groups:['g1'] };
      const u     : User = { id:'u3', username:'bob',   email:'b@chatit', roles:['user'],  groups:['g1'] };
      const g: Group = { id:'g1', name:'General', ownerId: ga.id, adminIds:[ga.id], channelIds:['c1','c2'] };
      const c1: Channel = { id:'c1', name:'welcome', groupId:g.id };
      const c2: Channel = { id:'c2', name:'random',  groupId:g.id };
      this.saveUsers([superU,ga,u]); this.saveGroups([g]); this.saveChannels([c1,c2]);
    }
  }
}
