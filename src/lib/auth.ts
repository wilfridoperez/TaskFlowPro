import NextAuth, { type DefaultSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string }
                    })

                    console.log("Found user:", user ? user.email : "none")

                    if (!user || !user.password) {
                        console.log("User not found or no password")
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    console.log("Password valid:", isPasswordValid)

                    if (!isPasswordValid) {
                        console.log("Invalid password")
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async session({ session, token }) {
            console.log("Session callback - token:", !!token, "session:", !!session)
            if (token?.sub) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            console.log("JWT callback - user:", user?.email, "token sub:", token.sub)
            if (user?.id) {
                token.sub = user.id
            }
            return token
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    experimental: {
        enableWebAuthn: false,
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
            },
        },
    },
})