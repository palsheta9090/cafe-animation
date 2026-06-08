import React, { useState, useEffect } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { TableData } from './components/FloorPlan';
import { ReservationModal, BookingData } from './components/ReservationModal';
import { CustomerPage } from './components/CustomerPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Lock, User, ArrowLeft, Coffee } from 'lucide-react';

// Default Tables Layout Configuration (as requested T1-T8)
const DEFAULT_TABLES: TableData[] = [
  { id: 't1', name: 'T1', shape: 'square', cx: 160, cy: 160, w: 60, h: 50, r: 25, capacity: 2, status: 'Available' },
  { id: 't2', name: 'T2', shape: 'square', cx: 160, cy: 290, w: 60, h: 50, r: 25, capacity: 2, status: 'Available' },
  { id: 't3', name: 'T3', shape: 'square', cx: 370, cy: 160, w: 70, h: 70, r: 35, capacity: 4, status: 'Available' },
  { id: 't4', name: 'T4', shape: 'square', cx: 370, cy: 290, w: 70, h: 70, r: 35, capacity: 4, status: 'Available' },
  { id: 't5', name: 'T5', shape: 'circle', cx: 610, cy: 190, w: 70, h: 70, r: 36, capacity: 4, status: 'Available' },
  { id: 't6', name: 'T6', shape: 'rectangle', cx: 160, cy: 450, w: 110, h: 65, r: 40, capacity: 6, status: 'Available' },
  { id: 't7', name: 'T7', shape: 'square', cx: 370, cy: 450, w: 70, h: 70, r: 35, capacity: 4, status: 'Available' },
  { id: 't8', name: 'T8', shape: 'rectangle', cx: 610, cy: 450, w: 130, h: 65, r: 45, capacity: 8, status: 'Available' },
];

export const App: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  
  // Custom router state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('amora_admin_auth') === 'true';
  });
  
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Real-time synchronization channel
  const [channel] = useState(() => new BroadcastChannel('amora-realtime'));

  // Sync window path state on back/forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    // Periodically poll path in case history.pushState is called
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 100);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [currentPath]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Load state from local storage or defaults on startup
  useEffect(() => {
    const savedTables = localStorage.getItem('amora_tables');
    const savedBookings = localStorage.getItem('amora_bookings');
    
    const initialTables = savedTables ? JSON.parse(savedTables) : DEFAULT_TABLES;
    const initialBookings = savedBookings ? JSON.parse(savedBookings) : [];

    setTables(initialTables);
    setBookings(initialBookings);

    // Initial storage save if first run
    if (!savedTables) localStorage.setItem('amora_tables', JSON.stringify(DEFAULT_TABLES));
    if (!savedBookings) localStorage.setItem('amora_bookings', JSON.stringify([]));

    // Handle incoming cross-tab messages
    channel.onmessage = (event) => {
      if (event.data) {
        if (event.data.tables) setTables(event.data.tables);
        if (event.data.bookings) setBookings(event.data.bookings);
      }
    };

    return () => {
      channel.close();
    };
  }, [channel]);

  // Synchronize state and notify all other open tabs in real-time
  const syncState = (updatedTables: TableData[], updatedBookings: BookingData[]) => {
    setTables(updatedTables);
    setBookings(updatedBookings);
    
    localStorage.setItem('amora_tables', JSON.stringify(updatedTables));
    localStorage.setItem('amora_bookings', JSON.stringify(updatedBookings));
    
    // Broadcast state to other tabs immediately
    channel.postMessage({ tables: updatedTables, bookings: updatedBookings });
  };

  // Handle a new reservation booking
  const handleReserveTable = (tableId: string, newBooking: BookingData) => {
    const updatedTables = tables.map(t => t.id === tableId ? { ...t, status: 'Reserved' as const } : t);
    const updatedBookings = [...bookings, newBooking];
    syncState(updatedTables, updatedBookings);
  };

  // Admin layouts updates
  const handleAddTable = (newTable: TableData) => {
    const updatedTables = [...tables, newTable];
    syncState(updatedTables, bookings);
  };

  const handleDeleteTable = (tableId: string) => {
    const updatedTables = tables.filter(t => t.id !== tableId);
    syncState(updatedTables, bookings);
  };

  const handleUpdateTable = (tableId: string, updates: Partial<TableData>) => {
    const updatedTables = tables.map(t => t.id === tableId ? { ...t, ...updates } : t);
    syncState(updatedTables, bookings);
  };

  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingData['status']) => {
    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    
    // If completed or cancelled, release the table status back to Available
    let updatedTables = [...tables];
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
      updatedTables = tables.map(t => t.id === booking.tableId ? { ...t, status: 'Available' as const } : t);
    } else if (booking && newStatus === 'Confirmed') {
      updatedTables = tables.map(t => t.id === booking.tableId ? { ...t, status: 'Reserved' as const } : t);
    }
    
    syncState(updatedTables, updatedBookings);
  };

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    let updatedTables = [...tables];
    if (booking) {
      updatedTables = tables.map(t => t.id === booking.tableId ? { ...t, status: 'Available' as const } : t);
    }
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    syncState(updatedTables, updatedBookings);
  };

  // Admin portal authentication logic
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === 'admin' && loginPass === 'admin@123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('amora_admin_auth', 'true');
      setLoginError('');
      setLoginId('');
      setLoginPass('');
    } else {
      setLoginError('Invalid Administrator credentials.');
    }
  };

  // Check if current page is the admin path
  const isAdminPath = currentPath === '/admin' || currentPath === '/admin/';

  return (
    <div className="w-full">
      {isAdminPath ? (
        isAuthenticated ? (
          // Authenticated Admin Dashboard Workspace
          <AdminDashboard
            tables={tables}
            bookings={bookings}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onUpdateTable={handleUpdateTable}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onDeleteBooking={handleDeleteBooking}
            onClose={() => navigateTo('/')}
          />
        ) : (
          // Luxury Admin Portal Login Panel
          <div className="min-h-screen w-full flex items-center justify-center bg-[#0c0807] px-4 relative overflow-hidden">
            {/* Ambient gold background glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#d4b26f]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d4b26f]/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-[420px] bg-[#160d0a] border border-[#2d1e18] rounded-2xl p-8 shadow-2xl relative z-10">
              
              {/* Portal Header */}
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex p-3 bg-[#d4b26f]/10 rounded-full text-[#d4b26f] mb-2">
                  <Coffee size={32} />
                </div>
                <h2 className="font-headline-md text-3xl font-bold text-white tracking-widest uppercase">
                  AMORA
                </h2>
                <p className="text-[10px] text-[#d4b26f] uppercase font-bold tracking-widest">
                  Admin Portal Access
                </p>
              </div>

              {/* Error display */}
              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-200 text-xs font-semibold mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#9fa0a6]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter admin ID"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] focus:ring-1 focus:ring-[#d4b26f] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#9fa0a6]">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] focus:ring-1 focus:ring-[#d4b26f] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#d4b26f] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white hover:scale-[1.01] transition-all shadow-lg shadow-[#d4b26f]/5"
                >
                  Authenticate
                </button>
              </form>

              {/* Home button */}
              <button
                onClick={() => navigateTo('/')}
                className="mt-6 w-full flex items-center justify-center gap-2 text-xs text-[#9fa0a6] hover:text-[#d4b26f] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Return to Cafe Site</span>
              </button>

            </div>
          </div>
        )
      ) : (
        // Standard Customer landing view
        <>
          {/* Scroll Canvas Animation */}
          <ScrollAnimation onLoaded={() => {}} />

          {/* Customer Main Layout */}
          <CustomerPage
            tables={tables}
            selectedTableId={selectedTable ? selectedTable.id : null}
            onSelectTable={(table) => setSelectedTable(table)}
          />

          {/* Reservation Modal Popup */}
          <ReservationModal
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onReserve={handleReserveTable}
          />
        </>
      )}
    </div>
  );
};

