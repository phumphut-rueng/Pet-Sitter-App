export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  roles?: string[];
}