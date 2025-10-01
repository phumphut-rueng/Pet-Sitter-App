import "next-auth";

declare module "next-auth" {
  interface User {
    roles?: string[];
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      roles: string[];
    };
  }

  interface JWT {
    roles?: string[];
    picture?: string;
  }
}