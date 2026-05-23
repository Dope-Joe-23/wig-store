import { User } from '@types/index'

interface UserAvatarProps {
  user: User | null
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function UserAvatar({ user, size = 'md', showName = false }: UserAvatarProps) {
  if (!user) return null

  const firstLetter = (user.first_name || user.username || 'U').charAt(0).toUpperCase()
  
  // Color palette - consistent color based on username
  const colors = [
    'bg-rose-nude',
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  
  // Use username hash to pick a color consistently
  const colorIndex = (user.username || '').charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-2xl',
  }

  const displayName = user.first_name || user.username

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
        title={`${displayName} (${user.email})`}
      >
        {firstLetter}
      </div>
      {showName && (
        <div>
          <p className="font-semibold text-black-primary text-sm">{displayName}</p>
          {size === 'lg' && <p className="text-xs text-gray-600">{user.email}</p>}
        </div>
      )}
    </div>
  )
}
