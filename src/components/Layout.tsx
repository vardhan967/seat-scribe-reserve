
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-th-large' },
    { name: 'My Reservations', href: '/my-reservations', icon: 'fas fa-bookmark' },
  ];

  if (user?.is_staff) {
    navigation.push({ name: 'Admin Check-in', href: '/admin/checkin', icon: 'fas fa-qrcode' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-2">
                <i className="fas fa-book text-primary text-2xl"></i>
                <span className="font-bold text-xl text-gray-900">Library Booking</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.href
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <i className={item.icon}></i>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="font-medium text-gray-900">{user?.username}</span>
                {user?.is_staff && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
