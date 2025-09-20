export type Role = 'super'|'group'|'user';
export interface User { id: string; username: string; email: string; roles: Role[]; groups: string[]; }
export interface Group { id: string; name: string; ownerId: string; adminIds: string[]; channelIds: string[]; }
export interface Channel { id: string; name: string; groupId: string; }
