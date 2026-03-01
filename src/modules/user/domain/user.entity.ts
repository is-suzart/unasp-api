// Domain Layer - Pure TypeScript Entity
export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  admin: boolean;
  communityId: string;
  position: string;
  image?: string;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
