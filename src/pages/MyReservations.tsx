
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SeatCard from '@/components/SeatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';

interface Seat {
  id: number;
  name: string;
  location: string;
  status: 'available' | 'pending' | 'reserved' | 'unavailable';
  user?: string;
  reserved_until?: string;
  pending_until?: string;
}

const MyReservations = () => {
  const [reservations, setReservations] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      console.log('Fetching reservations for user:', user?.id);
      
      const { data, error } = await supabase
        .from('seats')
        .select(`
          *,
          profiles:user_id(username)
        `)
        .eq('user_id', user?.id)
        .in('status', ['pending', 'reserved']);

      if (error) {
        console.error('Error fetching reservations:', error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch reservations. Please try again.',
        });
        return;
      }

      const transformedReservations: Seat[] = data.map(seat => ({
        id: seat.id,
        name: seat.name,
        location: seat.location,
        status: seat.status as 'available' | 'pending' | 'reserved' | 'unavailable',
        user: seat.profiles?.username || user?.username,
        reserved_until: seat.reserved_until || undefined,
        pending_until: seat.pending_until || undefined,
      }));

      console.log('Fetched reservations:', transformedReservations);
      setReservations(transformedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch reservations. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (seatId: number) => {
    try {
      console.log('Cancelling booking for seat:', seatId);
      
      const { error } = await supabase
        .from('seats')
        .update({
          status: 'available',
          user_id: null,
          pending_until: null
        })
        .eq('id', seatId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Cancel error:', error);
        showNotification({
          type: 'error',
          title: 'Cancellation Failed',
          message: 'Unable to cancel booking. Please try again.',
        });
        return;
      }

      const updatedReservations = reservations.filter(r => r.id !== seatId);
      setReservations(updatedReservations);

      showNotification({
        type: 'info',
        title: 'Booking Cancelled',
        message: 'Your seat booking has been cancelled successfully.',
      });
    } catch (error) {
      console.error('Cancel error:', error);
      showNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: 'Unable to cancel booking. Please try again.',
      });
    }
  };

  const handleReleaseSeat = async (seatId: number) => {
    try {
      console.log('Releasing seat:', seatId);
      
      const { error } = await supabase
        .from('seats')
        .update({
          status: 'available',
          user_id: null,
          reserved_until: null
        })
        .eq('id', seatId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Release error:', error);
        showNotification({
          type: 'error',
          title: 'Release Failed',
          message: 'Unable to release seat. Please try again.',
        });
        return;
      }

      const updatedReservations = reservations.filter(r => r.id !== seatId);
      setReservations(updatedReservations);

      showNotification({
        type: 'info',
        title: 'Seat Released',
        message: 'Your seat has been released successfully.',
      });
    } catch (error) {
      console.error('Release error:', error);
      showNotification({
        type: 'error',
        title: 'Release Failed',
        message: 'Unable to release seat. Please try again.',
      });
    }
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'reserved');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
          <p className="text-gray-600">Manage your current and pending seat bookings</p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="seat-card animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-bookmark text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reservations yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any seat reservations. Start by browsing available seats.</p>
            <a href="/dashboard" className="btn-primary">
              <i className="fas fa-search mr-2"></i>
              Browse Seats
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Reservations */}
            {pendingReservations.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <i className="fas fa-clock text-pending-600 text-xl"></i>
                  <h2 className="text-xl font-semibold text-gray-900">Pending Confirmation</h2>
                  <span className="status-badge bg-pending-100 text-pending-700">
                    {pendingReservations.length}
                  </span>
                </div>
                <div className="bg-pending-50 border border-pending-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-pending-700">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p className="text-sm font-medium">
                      Please visit the admin desk to confirm your pending bookings within the time limit.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingReservations.map((seat) => (
                    <SeatCard
                      key={seat.id}
                      seat={seat}
                      currentUser={user?.username}
                      onBook={() => {}}
                      onCancel={handleCancelBooking}
                      onRelease={handleReleaseSeat}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Reservations */}
            {confirmedReservations.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <i className="fas fa-check-circle text-success-600 text-xl"></i>
                  <h2 className="text-xl font-semibold text-gray-900">Confirmed Reservations</h2>
                  <span className="status-badge bg-success-100 text-success-700">
                    {confirmedReservations.length}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {confirmedReservations.map((seat) => (
                    <SeatCard
                      key={seat.id}
                      seat={seat}
                      currentUser={user?.username}
                      onBook={() => {}}
                      onCancel={handleCancelBooking}
                      onRelease={handleReleaseSeat}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyReservations;
