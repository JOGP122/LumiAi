import React, { useState } from 'react';
import { AvatarMode } from '../types';
import { getUserInitials } from '../utils/skincare';

interface UserAvatarProps {
  name: string;
  avatarMode: AvatarMode;
  telegramPhotoUrl?: string;
  customAvatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showOnlineBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarMode,
  telegramPhotoUrl,
  customAvatarUrl,
  size = 'md',
  showOnlineBadge = false
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const initials = getUserInitials(name);

  const activePhotoUrl =
    !imgError && avatarMode === 'custom' && customAvatarUrl
      ? customAvatarUrl
      : !imgError && avatarMode === 'telegram' && telegramPhotoUrl
      ? telegramPhotoUrl
      : null;

  const sizeClasses =
    size === 'lg'
      ? 'w-16 h-16 text-[20px]'
      : size === 'sm'
      ? 'w-9 h-9 text-[12.5px]'
      : 'w-11 h-11 text-[14px]';

  const badgeSizeClasses =
    size === 'lg'
      ? 'w-4 h-4 border-2'
      : size === 'sm'
      ? 'w-2.5 h-2.5 border'
      : 'w-3 h-3 border-2';

  return (
    <div className="relative inline-flex shrink-0 select-none">
      {activePhotoUrl ? (
        <img
          src={activePhotoUrl}
          alt={`Аватар ${name}`}
          onError={() => setImgError(true)}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-[#F0E6D1] shadow-xs bg-[#F4F0E8]`}
        />
      ) : (
        <div
          aria-label={`Инициалы ${name}`}
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-[#A87C44] via-[#F28472] to-[#E65C48] text-white font-extrabold tracking-wide flex items-center justify-center ring-2 ring-[#F0E6D1] shadow-[0_4px_14px_rgba(168,124,68,0.28)]`}
        >
          {initials}
        </div>
      )}

      {showOnlineBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-[#10B981] border-[#FBF8F5] ${badgeSizeClasses}`}
        />
      )}
    </div>
  );
};
