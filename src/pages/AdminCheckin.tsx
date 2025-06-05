
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useNotification } from '@/contexts/NotificationContext';

interface PendingSeat {
  id: number;
  seat_name: string;
  location: string;
  user: string;
  pending_until: string;
}

const AdminCheckin = () => {
  const [pendingSeats, setPendingSeats] = useState<PendingSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedRollNumber, setScannedRollNumber] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showNotification } = useNotification();

  // Mock data for demonstration
  const mockPendingSeats: PendingSeat[] = [
    {
      id: 2,
      seat_name: 'A102',
      location: 'Main Floor',
      user: 'john_doe',
      pending_until: '2024-01-01T10:30:00Z'
    },
    {
      id: 8,
      seat_name: 'C302',
      location: 'Third Floor',
      user: 'jane_smith',
      pending_until: '2024-01-01T11:15:00Z'
    },
  ];

  useEffect(() => {
    fetchPendingSeats();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchPendingSeats = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setPendingSeats(mockPendingSeats);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch pending seats. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        
        // Mock QR code detection - in real implementation, use ZXing-JS
        setTimeout(() => {
          const mockRollNumber = 'STU' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          setScannedRollNumber(mockRollNumber);
          showNotification({
            type: 'success',
            title: 'QR Code Scanned',
            message: `Roll number detected: ${mockRollNumber}`,
          });
        }, 3000);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Camera Error',
        message: 'Unable to access camera. Please check permissions.',
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const confirmSeat = async (seatId: number, rollNumber: string) => {
    if (!rollNumber.trim()) {
      showNotification({
        type: 'warning',
        title: 'Missing Roll Number',
        message: 'Please enter or scan a roll number before confirming.',
      });
      return;
    }

    try {
      // Mock API call
      const seat = pendingSeats.find(s => s.id === seatId);
      if (!seat) return;

      const updatedSeats = pendingSeats.filter(s => s.id !== seatId);
      setPendingSeats(updatedSeats);
      setScannedRollNumber('');
      setSelectedSeatId(null);

      showNotification({
        type: 'success',
        title: '✅ Seat Confirmed Successfully!',
        message: `
          <div class="space-y-2">
            <div><strong>Seat:</strong> ${seat.seat_name}</div>
            <div><strong>Location:</strong> ${seat.location}</div>
            <div><strong>Student:</strong> ${rollNumber}</div>
            <div><strong>Status:</strong> <span class="text-success-600 font-medium">Confirmed & Reserved</span></div>
          </div>
        `,
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Confirmation Failed',
        message: 'Unable to confirm seat. Please try again.',
      });
    }
  };

  const formatTimeLeft = (until: string) => {
    const now = new Date().getTime();
    const target = new Date(until).getTime();
    const difference = target - now;

    if (difference <= 0) return 'Expired';

    const minutes = Math.floor(difference / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <i className="fas fa-crown text-primary text-2xl"></i>
            <h1 className="text-3xl font-bold text-gray-900">Admin Check-in Portal</h1>
          </div>
          <p className="text-gray-600">Scan QR codes and confirm student seat bookings</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* QR Code Scanner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-qrcode text-primary mr-2"></i>
              QR Code Scanner
            </h2>

            <div className="space-y-4">
              <div className="flex space-x-3">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <i className="fas fa-camera"></i>
                    <span>Start Scanner</span>
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <i className="fas fa-stop"></i>
                    <span>Stop Scanner</span>
                  </button>
                )}
              </div>

              {/* Video Feed */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <i className="fas fa-video text-4xl mb-3 opacity-50"></i>
                      <p className="text-lg font-medium">Camera Preview</p>
                      <p className="text-sm opacity-75">Click "Start Scanner" to begin</p>
                    </div>
                  </div>
                )}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Position QR Code Here</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanned Output */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scanned Roll Number
                </label>
                <input
                  type="text"
                  value={scannedRollNumber}
                  onChange={(e) => setScannedRollNumber(e.target.value)}
                  placeholder="Roll number will appear here or enter manually"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Pending Seats */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-clock text-pending-600 mr-2"></i>
              Pending Confirmations
              <span className="ml-2 status-badge bg-pending-100 text-pending-700">
                {pendingSeats.length}
              </span>
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : pendingSeats.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-check-circle text-success-400 text-4xl mb-3"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-1">All Clear!</h3>
                <p className="text-gray-600">No pending confirmations at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedSeatId === seat.id
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{seat.seat_name}</h3>
                        <p className="text-sm text-gray-600">{seat.location}</p>
                        <p className="text-sm text-gray-600">User: {seat.user}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Expires in</div>
                        <div className="text-sm font-medium text-pending-600">
                          {formatTimeLeft(seat.pending_until)}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={selectedSeatId === seat.id ? scannedRollNumber : ''}
                        onChange={(e) => {
                          setSelectedSeatId(seat.id);
                          setScannedRollNumber(e.target.value);
                        }}
                        placeholder="Enter roll number"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        onClick={() => confirmSeat(seat.id, selectedSeatId === seat.id ? scannedRollNumber : '')}
                        className="btn-success text-sm flex items-center space-x-1"
                      >
                        <i className="fas fa-check"></i>
                        <span>Confirm</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCheckin;
