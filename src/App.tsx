import React, { useState, useEffect } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { TableData } from './components/FloorPlan';
import { ReservationModal, BookingData } from './components/ReservationModal';
import { CustomerPage } from './components/CustomerPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Shield } from 'lucide-react';

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
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Real-time synchronization channel
  const [channel] = useState(() => new BroadcastChannel('amora-realtime'));

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

  return (
    <div className="w-full">
      {isAdminView ? (
        // Admin workspace dashboard view
        <AdminDashboard
          tables={tables}
          bookings={bookings}
          onAddTable={handleAddTable}
          onDeleteTable={handleDeleteTable}
          onUpdateTable={handleUpdateTable}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onDeleteBooking={handleDeleteBooking}
          onClose={() => setIsAdminView(false)}
        />
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

          {/* Floating Admin Button */}
          <button
            onClick={() => setIsAdminView(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-[#d4b26f] text-black font-bold rounded-full shadow-2xl hover:bg-white hover:scale-105 transition-all text-xs uppercase tracking-wider"
            title="Open Admin Control Panel"
          >
            <Shield size={16} />
            <span>Admin Dashboard</span>
          </button>

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
