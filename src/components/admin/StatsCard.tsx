interface StatsCardProps {
  title: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: string
  color?: string
}

export default function StatsCard({ title, value, delta, deltaPositive, icon, color = 'text-pink' }: StatsCardProps) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-admin-muted text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {delta && (
        <p className={`text-xs mt-1 font-medium ${deltaPositive ? 'text-green-400' : 'text-red-400'}`}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  )
}
