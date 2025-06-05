
import { useState, useEffect } from 'react';

interface Seat {
  id: number;
  name: string;
  location: string;
  status: 'available' | 'pending' | 'reserved' | 'unavailable';
  user?: string;
  reserved_until?: string;
  pending_until?: string;
}

interface SeatCardProps {
  seat: Seat;
  currentUser?: string;
  onBook: (seatId: number) => void;
  onCancel: (seatId: number) => void;
  onRelease: (seatId: number) => void;
}

const SeatCard: React.FC<SeatCardProps> = ({ seat, currentUser, onBook, onCancel, onRelease }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (seat.pending_until || seat.reserved_until) {
      const updateTimer = () => {
        const targetTime = seat.pending_until || seat.reserved_until;
        if (!targetTime) return;

        const now = new Date().getTime();
        const target = new Date(targetTime).getTime();
        const difference = target - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setTimeLeft(`${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${seconds}s`);
          }
        } else {
          setTimeLeft('Expired');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [seat.pending_until, seat.reserved_until]);

  const getStatusConfig = () => {
    switch (seat.status) {
      case 'available':
        return {
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          badgeStyle: 'bg-success-100 text-success-700',
          icon: 'fas fa-check-circle text-success-600',
          label: 'Available',
        };
      case 'pending':
        return {
          bgColor: 'bg-pending-50',
          borderColor: 'border-pending-200',
          badgeStyle: 'bg-pending-100 text-pending-700',
          icon: 'fas fa-clock text-pending-600',
          label: seat.user === currentUser ? 'Pending (You)' : 'Pending',
        };
      case 'reserved':
        return {
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          badgeStyle: 'bg-warning-100 text-warning-700',
          icon: 'fas fa-user text-warning-600',
          label: seat.user === currentUser ? 'Reserved (You)' : 'Reserved',
        };
      case 'unavailable':
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeStyle: 'bg-gray-100 text-gray-700',
          icon: 'fas fa-times-circle text-gray-600',
          label: 'Unavailable',
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeStyle: 'bg-gray-100 text-gray-700',
          icon: 'fas fa-question-circle text-gray-600',
          label: 'Unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isUserSeat = seat.user === currentUser;

  const renderActions = () => {
    switch (seat.status) {
      case 'available':
        return (
          <button
            onClick={() => onBook(seat.id)}
            className="w-full btn-success flex items-center justify-center space-x-2"
          >
            <i className="fas fa-check-circle"></i>
            <span>Book</span>
          </button>
        );
      case 'pending':
        if (isUserSeat) {
          return (
            <div className="space-y-2">
              {timeLeft && (
                <div className="text-center text-sm text-pending-600 font-medium">
                  Confirm within: {timeLeft}
                </div>
              )}
              <button
                onClick={() => onCancel(seat.id)}
                className="w-full btn-danger flex items-center justify-center space-x-2"
              >
                <i className="fas fa-times-circle"></i>
                <span>Cancel</span>
              </button>
            </div>
          );
        } else {
          return (
            <div className="text-center text-sm text-gray-500">
              Pending confirmation
            </div>
          );
        }
      case 'reserved':
        if (isUserSeat) {
          return (
            <div className="space-y-2">
              {timeLeft && (
                <div className="text-center text-sm text-warning-600 font-medium">
                  Reserved for: {timeLeft}
                </div>
              )}
              <button
                onClick={() => onRelease(seat.id)}
                className="w-full btn-warning flex items-center justify-center space-x-2"
              >
                <i className="fas fa-undo"></i>
                <span>Release</span>
              </button>
            </div>
          );
        } else {
          return (
            <div className="text-center text-sm text-gray-500">
              Currently reserved
            </div>
          );
        }
      case 'unavailable':
        return (
          <div className="text-center text-sm text-gray-500">
            Out of service
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`seat-card ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <i className="fas fa-chair text-2xl text-gray-600"></i>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{seat.name}</h3>
            <p className="text-gray-600 text-sm">{seat.location}</p>
          </div>
        </div>
        <i className={statusConfig.icon}></i>
      </div>

      <div className="mb-4">
        <span className={`status-badge ${statusConfig.badgeStyle}`}>
          {statusConfig.label}
        </span>
      </div>

      {renderActions()}
    </div>
  );
};

export default SeatCard;
