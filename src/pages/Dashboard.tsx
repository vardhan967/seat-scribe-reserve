
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SeatCard from '@/components/SeatCard';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface Seat {
  id: number;
  name: string;
  location: string;
  status: 'available' | 'pending' | 'reserved' | 'unavailable';
  user?: string;
  reserved_until?: string;
  pending_until?: string;
}

const Dashboard = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [filteredSeats, setFilteredSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    location: 'all',
  });
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Mock data for demonstration
  const mockSeats: Seat[] = [
    { id: 1, name: 'A101', location: 'Main Floor', status: 'available' },
    { id: 2, name: 'A102', location: 'Main Floor', status: 'pending', user: 'john_doe', pending_until: '2024-01-01T10:30:00Z' },
    { id: 3, name: 'A103', location: 'Main Floor', status: 'reserved', user: 'jane_smith', reserved_until: '2024-01-01T14:00:00Z' },
    { id: 4, name: 'B201', location: 'Second Floor', status: 'unavailable' },
    { id: 5, name: 'B202', location: 'Second Floor', status: 'available' },
    { id: 6, name: 'B203', location: 'Second Floor', status: 'available' },
    { id: 7, name: 'C301', location: 'Third Floor', status: 'available' },
    { id: 8, name: 'C302', location: 'Third Floor', status: 'pending', user: user?.username, pending_until: '2024-01-01T11:15:00Z' },
  ];

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [seats, filters]);

  const fetchSeats = async () => {
    try {
      // Mock API call - replace with actual API endpoint
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setSeats(mockSeats);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch seats. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = seats;

    if (filters.search) {
      filtered = filtered.filter(seat =>
        seat.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        seat.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(seat => seat.status === filters.status);
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(seat => seat.location === filters.location);
    }

    setFilteredSeats(filtered);
  };

  const handleBookSeat = async (seatId: number) => {
    try {
      // Mock API call
      const seat = seats.find(s => s.id === seatId);
      if (!seat) return;

      const updatedSeats = seats.map(s =>
        s.id === seatId
          ? { ...s, status: 'pending' as const, user: user?.username, pending_until: new Date(Date.now() + 5 * 60 * 1000).toISOString() }
          : s
      );
      setSeats(updatedSeats);

      showNotification({
        type: 'success',
        title: '🎉 Seat Booked Successfully!',
        message: `
          <div class="space-y-2">
            <div><strong>Seat:</strong> ${seat.name}</div>
            <div><strong>Location:</strong> ${seat.location}</div>
            <div><strong>Status:</strong> <span class="text-pending-600 font-medium">Pending Confirmation</span></div>
            <div><strong>Confirm Within:</strong> <span class="text-red-600 font-medium">5 minutes</span></div>
            <div class="text-sm text-gray-600 mt-2">Please visit the admin desk to confirm your booking.</div>
          </div>
        `,
        actionButton: {
          label: 'Check My Reservations',
          onClick: () => window.location.href = '/my-reservations'
        }
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Booking Failed',
        message: 'Unable to book seat. Please try again.',
      });
    }
  };

  const handleCancelBooking = async (seatId: number) => {
    try {
      const updatedSeats = seats.map(s =>
        s.id === seatId
          ? { ...s, status: 'available' as const, user: undefined, pending_until: undefined }
          : s
      );
      setSeats(updatedSeats);

      showNotification({
        type: 'info',
        title: 'Booking Cancelled',
        message: 'Your seat booking has been cancelled successfully.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: 'Unable to cancel booking. Please try again.',
      });
    }
  };

  const handleReleaseSeat = async (seatId: number) => {
    try {
      const updatedSeats = seats.map(s =>
        s.id === seatId
          ? { ...s, status: 'available' as const, user: undefined, reserved_until: undefined }
          : s
      );
      setSeats(updatedSeats);

      showNotification({
        type: 'info',
        title: 'Seat Released',
        message: 'Your seat has been released successfully.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Release Failed',
        message: 'Unable to release seat. Please try again.',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      location: 'all',
    });
  };

  const locations = [...new Set(seats.map(seat => seat.location))];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Seat Booking</h1>
          <p className="text-gray-600">Find and book your perfect study spot</p>
        </div>

        {/* Important Announcements */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <i className="fas fa-bullhorn text-blue-600 text-lg"></i>
              <div>
                <h3 className="font-semibold text-blue-900">Library Hours</h3>
                <p className="text-blue-700 text-sm">Open daily from 6:00 AM to 11:00 PM</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <i className="fas fa-clock text-green-600 text-lg"></i>
              <div>
                <h3 className="font-semibold text-green-900">Quick Booking</h3>
                <p className="text-green-700 text-sm">Confirm your booking within 5 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Guide */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-info-circle text-primary mr-2"></i>
            Seat Status Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="status-badge bg-success-100 text-success-700">Available</span>
              <span className="text-sm text-gray-600">Ready to book</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="status-badge bg-pending-100 text-pending-700">Pending</span>
              <span className="text-sm text-gray-600">Awaiting confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="status-badge bg-warning-100 text-warning-700">Reserved</span>
              <span className="text-sm text-gray-600">Currently occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="status-badge bg-gray-100 text-gray-700">Unavailable</span>
              <span className="text-sm text-gray-600">Out of service</span>
            </div>
          </div>
          {user?.is_staff && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-primary-700 text-sm">
                <i className="fas fa-crown mr-1"></i>
                As an admin, you can use the <a href="/admin/checkin" className="font-medium underline">Check-in Portal</a> to confirm pending bookings.
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Seat or location..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="reserved">Reserved</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="btn-primary flex-1"
              >
                <i className="fas fa-filter mr-2"></i>
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                <i className="fas fa-sync mr-2"></i>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Seats Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="seat-card animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredSeats.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No seats found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
            <button onClick={clearFilters} className="btn-primary">
              <i className="fas fa-sync mr-2"></i>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSeats.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                currentUser={user?.username}
                onBook={handleBookSeat}
                onCancel={handleCancelBooking}
                onRelease={handleReleaseSeat}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
