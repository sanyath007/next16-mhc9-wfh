import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        userId: string;
        user: {
            role: string;
            access_token: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: number; // match your database type
        role: string;
        employee_id: number;
        access_token: string;
    }
}