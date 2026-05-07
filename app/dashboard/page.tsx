'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/useAuth'
import client from '@/lib/api-client'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    occupancy: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (user.role === 'tenant') {
      router.push('/tenant/home')
    } else {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const res = await client.get('/pg/dashboard/') // backend API
      setStats({
        totalRooms: res.data.total_rooms || 0,
        totalBeds: res.data.total_beds || 0,
        occupiedBeds: res.data.occupied_beds || 0,
        occupancy: res.data.occupancy || 0,
      })
    } catch (error) {
      console.log('Dashboard Error:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Rooms" value={stats.totalRooms.toString()} icon="🏠" />
        <DashboardCard title="Total Beds" value={stats.totalBeds.toString()} icon="🛏️" />
        <DashboardCard title="Occupied Beds" value={stats.occupiedBeds.toString()} icon="👤" />
        <DashboardCard title="Occupancy %" value={`${stats.occupancy}%`} icon="📊" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => router.push('/dashboard/rooms')} className="btn">🏠 Add Room</button>
            <button onClick={() => router.push('/dashboard/tenants')} className="btn">👤 Add Tenant</button>
            <button onClick={() => router.push('/dashboard/payments')} className="btn">💰 Record Payment</button>
            <button onClick={() => router.push('/dashboard/complaints')} className="btn">📢 View Complaints</button>
            <button onClick={() => router.push('/dashboard/mess')} className="btn">🍴 Manage Mess</button>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">PG Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b py-2">
              <span>PG Name</span>
              <span>{(user as any).pg_profile?.name || 'My PG'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span>Owner</span>
              <span>{user.first_name} {user.last_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Contact</span>
              <span>{user.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tenants</h2>
          <p>No data available</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Payments</h2>
          <p>No data available</p>
        </div>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string
  icon: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
