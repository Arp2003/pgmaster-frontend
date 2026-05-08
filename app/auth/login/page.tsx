'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLogin, useGoogleLogin } from '@/hooks/useAuthMutations'
import { useAuthStore } from '@/hooks/useAuth'
import { GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { mutate: login, isPending } = useLogin()
  const { mutate: googleLogin, isPending: isGooglePending } = useGoogleLogin()

  const [role, setRole] = useState('pg_owner')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  React.useEffect(() => {
    if (user) {
      if (user.role === 'pg_owner') {
        router.push('/dashboard')
      } else {
        router.push('/tenant/home')
      }
    }
  }, [user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    login(formData, {
      onSuccess: (response: any) => {
        console.log("LOGIN RESPONSE:", response)

        // ==============================
        // SAFE TOKEN EXTRACTION
        // ==============================
        const data = response?.data || response

        const accessToken =
          data?.access ||
          data?.tokens?.access ||
          data?.data?.access

        const refreshToken =
          data?.refresh ||
          data?.tokens?.refresh ||
          data?.data?.refresh

        const userData =
          data?.user || data?.data?.user || {}

        // ==============================
        // STORE TOKENS (IMPORTANT FIX)
        // ==============================
        if (accessToken) {
          localStorage.setItem("access_token", accessToken)
        }

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken)
        }

        // ==============================
        // ROLE REDIRECT
        // ==============================
        const userRole = userData?.role || role

        if (userRole === 'pg_owner') {
          router.push('/dashboard')
        } else {
          router.push('/tenant/home')
        }
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">PGMaster</h1>
            <p className="text-gray-600 mt-2">Login to your account</p>
          </div>

          {/* ROLE SWITCH */}
          <div className="flex gap-4 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setRole('pg_owner')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                role === 'pg_owner'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              PG Owner
            </button>

            <button
              onClick={() => setRole('tenant')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                role === 'tenant'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              Tenant
            </button>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* GOOGLE LOGIN */}
          <div className="mt-6 flex flex-col items-center gap-2">

            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  googleLogin(
                    {
                      token: credentialResponse.credential,
                      role,
                    },
                    {
                      onSuccess: (res: any) => {
                        const data = res?.data || res

                        localStorage.setItem(
                          "access_token",
                          data?.access || data?.token || ""
                        )

                        localStorage.setItem(
                          "refresh_token",
                          data?.refresh || ""
                        )

                        router.push('/dashboard')
                      },
                    }
                  )
                }
              }}
              onError={() => console.log("Google Login Failed")}
            />

            {isGooglePending && (
              <p className="text-sm text-gray-500">
                Signing in with Google...
              </p>
            )}
          </div>

          {/* REGISTER LINK */}
          <p className="text-center text-gray-600 mt-6">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="text-indigo-600">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
