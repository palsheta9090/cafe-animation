import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Map, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus, 
  Trash2, 
  Check, 
  X as CloseIcon, 
  DollarSign 
} from 'lucide-react';
import { TableData, FloorPlan } from './FloorPlan';
import { BookingData } from './ReservationModal';

interface AdminDashboardProps {
  tables: TableData[];
  bookings: BookingData[];
  onAddTable: (table: TableData) => void;
  onDeleteTable: (tableId: string) => void;
  onUpdateTable: (tableId: string, updates: Partial<TableData>) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingData['status']) => void;
  onDeleteBooking: (bookingId: string) => void;
  onClose: () => void;
}

type TabType = 'Dashboard' | 'Reservations' | 'TableManagement' | 'Customers' | 'Analytics' | 'Settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tables,
  bookings,
  onAddTable,
  onDeleteTable,
  onUpdateTable,
  onUpdateBookingStatus,
  onDeleteBooking,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [selectedEditorTableId, setSelectedEditorTableId] = useState<string | null>(null);

  const selectedEditorTable = tables.find(t => t.id === selectedEditorTableId) || null;

  // Stats calculations
  const totalBookings = bookings.length;
  const occupiedTables = tables.filter(t => t.status === 'Reserved').length;
  const availableTables = tables.filter(t => t.status === 'Available').length;
  const maintenanceTables = tables.filter(t => t.status === 'Maintenance').length;
  const estimatedRevenue = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + (b.guests * 350), 0); // ₹350 estimated per cover

  // Add Table Helper
  const handleAddNewTable = () => {
    const nextNum = tables.length + 1;
    const newId = `table_${Date.now()}`;
    const newTable: TableData = {
      id: newId,
      name: `T${nextNum}`,
      shape: 'square',
      cx: 400,
      cy: 300,
      w: 70,
      h: 70,
      r: 35,
      capacity: 4,
      status: 'Available',
    };
    onAddTable(newTable);
    setSelectedEditorTableId(newId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0807] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#140d0c] border-b md:border-b-0 md:border-r border-[#2d1e18] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2d1e18] flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-[#d4b26f] tracking-wider">AMORA</h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Admin Workspace</p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg bg-[#2d1e18] text-gray-400 hover:text-white"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'Reservations', label: 'Reservations', icon: CalendarRange },
            { id: 'TableManagement', label: 'Table Editor', icon: Map },
            { id: 'Customers', label: 'Customers', icon: Users },
            { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'Settings', label: 'Settings', icon: SettingsIcon },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#d4b26f] text-black shadow-lg shadow-[#d4b26f]/15' 
                    : 'text-gray-400 hover:bg-[#2d1e18] hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-6 border-t border-[#2d1e18] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4b26f] text-black font-bold flex items-center justify-center">
              AD
            </div>
            <div className="text-left">
              <p className="text-xs font-bold">Admin Director</p>
              <p className="text-[10px] text-gray-500">System Operator</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hidden md:flex p-2 rounded-lg bg-[#2d1e18] text-gray-400 hover:text-white hover:bg-red-950/30 transition-colors"
            title="Exit Admin Panel"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0807] overflow-y-auto p-6 md:p-8">
        
        {/* Dynamic Panel Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2d1e18] pb-6 mb-8 shrink-0">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold font-headline-md tracking-wide">
              {activeTab === 'Dashboard' && 'Operational Summary'}
              {activeTab === 'Reservations' && 'Booking Ledger'}
              {activeTab === 'TableManagement' && 'Visual Layout Editor'}
              {activeTab === 'Customers' && 'Guest Profiles'}
              {activeTab === 'Analytics' && 'Performance Charts'}
              {activeTab === 'Settings' && 'System Parameters'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Live updates syncing in real-time with customer portal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2d1e18] border border-[#2d1e18] text-white hover:bg-white hover:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Go to Customer View
          </button>
        </header>

        {/* VIEW: Dashboard */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "Total Bookings", value: totalBookings, icon: CalendarRange, color: "text-[#d4b26f]" },
                { title: "Active Tables", value: occupiedTables, icon: Map, color: "text-emerald-500" },
                { title: "Available Seats", value: availableTables, icon: Users, color: "text-blue-400" },
                { title: "Est. Revenue", value: `₹${estimatedRevenue}`, icon: DollarSign, color: "text-amber-500" }
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="bg-[#140d0c] border border-[#2d1e18] p-5 rounded-2xl flex items-center justify-between shadow-lg">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{kpi.title}</p>
                      <h4 className="text-xl md:text-2xl font-bold tracking-tight">{kpi.value}</h4>
                    </div>
                    <div className={`p-3 rounded-xl bg-black/40 border border-[#2d1e18] ${kpi.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick overview grids */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Recent Bookings Panel */}
              <div className="lg:col-span-2 bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold tracking-wide text-left">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('Reservations')} className="text-xs text-[#d4b26f] hover:underline font-bold">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#2d1e18] text-gray-500 uppercase tracking-wider font-bold">
                        <th className="pb-3">Guest</th>
                        <th className="pb-3">Table</th>
                        <th className="pb-3">Date/Time</th>
                        <th className="pb-3">Pax</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d1e18]/45">
                      {bookings.slice(-5).reverse().map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 font-semibold">{b.customerName}</td>
                          <td className="py-3.5 font-bold text-[#d4b26f]">{b.tableName}</td>
                          <td className="py-3.5">{b.date} • {b.time}</td>
                          <td className="py-3.5">{b.guests} Guests</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              b.status === 'Confirmed' ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400' :
                              b.status === 'Pending' ? 'bg-amber-950/60 border border-amber-500/30 text-amber-400' :
                              'bg-gray-800 text-gray-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No reservations on record yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cafe layout quick stat */}
              <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl text-left space-y-6 flex flex-col justify-between">
                <h3 className="text-lg font-bold tracking-wide">Table Inventory</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Available Tables', count: availableTables, percent: (availableTables/tables.length)*100 || 0, color: 'bg-emerald-500' },
                    { label: 'Occupied Tables', count: occupiedTables, percent: (occupiedTables/tables.length)*100 || 0, color: 'bg-red-500' },
                    { label: 'Maintenance Zone', count: maintenanceTables, percent: (maintenanceTables/tables.length)*100 || 0, color: 'bg-gray-500' },
                  ].map((inv, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-400">{inv.label}</span>
                        <span>{inv.count} ({Math.round(inv.percent)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-black/40 border border-[#2d1e18] rounded-full overflow-hidden">
                        <div className={`h-full ${inv.color} rounded-full`} style={{ width: `${inv.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveTab('TableManagement')}
                  className="w-full py-3 bg-[#2d1e18] hover:bg-[#d4b26f] hover:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Manage Layout Map
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: Reservations */}
        {activeTab === 'Reservations' && (
          <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2d1e18] text-gray-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Guest Name</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Table</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d1e18]/45">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono font-bold text-gray-400">{b.id}</td>
                      <td className="py-4">
                        <div className="font-semibold text-white">{b.customerName}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{b.email}</div>
                      </td>
                      <td className="py-4">{b.phone}</td>
                      <td className="py-4">{b.date} • {b.time}</td>
                      <td className="py-4 font-semibold text-[#d4b26f]">{b.guests} Guests</td>
                      <td className="py-4 font-bold">{b.tableName}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          b.status === 'Confirmed' ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400' :
                          b.status === 'Pending' ? 'bg-amber-950/60 border border-amber-500/30 text-amber-400' :
                          b.status === 'Cancelled' ? 'bg-red-950/60 border border-red-500/30 text-red-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 text-right flex gap-1.5 justify-end">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors"
                            title="Confirm"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'Cancelled')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
                            title="Cancel"
                          >
                            <CloseIcon size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteBooking(b.id)}
                          className="p-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-white hover:text-black transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        No customer reservations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: TableManagement */}
        {activeTab === 'TableManagement' && (
          <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            
            {/* Visual Workspace Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-semibold bg-[#140d0c] px-3 py-1.5 border border-[#2d1e18] rounded-lg">
                  💡 Drag tables in the map grid below to reposition them
                </span>
                <button
                  onClick={handleAddNewTable}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#d4b26f] text-black rounded-lg text-xs font-bold hover:bg-white transition-all shadow-md"
                >
                  <Plus size={14} />
                  Add New Table
                </button>
              </div>

              {/* Render reusable FloorPlan in admin mode */}
              <FloorPlan
                tables={tables}
                selectedTableId={selectedEditorTableId}
                onSelectTable={(table) => setSelectedEditorTableId(table.id)}
                isAdminEditor={true}
                onTableUpdate={(tableId, updates) => onUpdateTable(tableId, updates)}
              />
            </div>

            {/* Properties Editor Sidebar */}
            <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl text-left space-y-6 self-start">
              <h3 className="text-lg font-bold tracking-wide border-b border-[#2d1e18] pb-3">
                Table Configuration
              </h3>
              
              {selectedEditorTable ? (
                <div className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                      Table Name / Label
                    </label>
                    <input
                      type="text"
                      value={selectedEditorTable.name}
                      onChange={(e) => onUpdateTable(selectedEditorTable.id, { name: e.target.value })}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4b26f]"
                    />
                  </div>

                  {/* Shape dropdown */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                      Geometric Shape
                    </label>
                    <select
                      value={selectedEditorTable.shape}
                      onChange={(e) => onUpdateTable(selectedEditorTable.id, { shape: e.target.value as TableData['shape'] })}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4b26f]"
                    >
                      <option value="square">Square</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="circle">Circle</option>
                      <option value="oval">Oval</option>
                    </select>
                  </div>

                  {/* Dimension inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEditorTable.shape === 'circle' || selectedEditorTable.shape === 'oval' ? (
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                          Radius Size (pixels)
                        </label>
                        <input
                          type="number"
                          value={selectedEditorTable.r}
                          onChange={(e) => onUpdateTable(selectedEditorTable.id, { r: Number(e.target.value) })}
                          className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                            Width
                          </label>
                          <input
                            type="number"
                            value={selectedEditorTable.w}
                            onChange={(e) => onUpdateTable(selectedEditorTable.id, { w: Number(e.target.value) })}
                            className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                            Height
                          </label>
                          <input
                            type="number"
                            value={selectedEditorTable.h}
                            onChange={(e) => onUpdateTable(selectedEditorTable.id, { h: Number(e.target.value) })}
                            className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Position Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                        X Coord (Grid)
                      </label>
                      <input
                        type="number"
                        value={selectedEditorTable.cx}
                        onChange={(e) => onUpdateTable(selectedEditorTable.id, { cx: Number(e.target.value) })}
                        className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                        Y Coord (Grid)
                      </label>
                      <input
                        type="number"
                        value={selectedEditorTable.cy}
                        onChange={(e) => onUpdateTable(selectedEditorTable.id, { cy: Number(e.target.value) })}
                        className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Capacity dropdown */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                      Seating Capacity (Guests)
                    </label>
                    <select
                      value={selectedEditorTable.capacity}
                      onChange={(e) => onUpdateTable(selectedEditorTable.id, { capacity: Number(e.target.value) })}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4b26f]"
                    >
                      {[2, 4, 6, 8, 10, 12].map(cap => (
                        <option key={cap} value={cap}>{cap} Seats</option>
                      ))}
                    </select>
                  </div>

                  {/* Availability status */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">
                      Operating Status
                    </label>
                    <select
                      value={selectedEditorTable.status}
                      onChange={(e) => onUpdateTable(selectedEditorTable.id, { status: e.target.value as TableData['status'] })}
                      className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4b26f]"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <div className="pt-4 border-t border-[#2d1e18] flex gap-2">
                    <button
                      onClick={() => {
                        onDeleteTable(selectedEditorTable.id);
                        setSelectedEditorTableId(null);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black rounded-lg text-xs font-bold uppercase transition-all"
                    >
                      <Trash2 size={14} />
                      Delete Table
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Click a table on the map layout grid to configure its dimensions, shape, status, or capacity.
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW: Customers */}
        {activeTab === 'Customers' && (
          <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2d1e18] text-gray-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Customer Name</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Reservations Count</th>
                    <th className="pb-3">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d1e18]/45">
                  {Array.from(new Set(bookings.map(b => b.customerName))).map((name, idx) => {
                    const custBookings = bookings.filter(b => b.customerName === name);
                    const lastBooking = custBookings[custBookings.length - 1];
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-semibold text-white">{name}</td>
                        <td className="py-4">{lastBooking.phone}</td>
                        <td className="py-4">{lastBooking.email}</td>
                        <td className="py-4 font-bold text-[#d4b26f]">{custBookings.length} Times</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            custBookings.length > 2 
                              ? 'bg-amber-950/60 border border-[#d4b26f]/30 text-[#d4b26f]' 
                              : 'bg-[#2d1e18] text-gray-400'
                          }`}>
                            {custBookings.length > 2 ? 'VIP Guest' : 'Regular'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No customer logs stored yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: Analytics */}
        {activeTab === 'Analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* SVG Charts Simulation for luxury dashboard feeling */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Daily Reservations Bar Chart */}
              <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl text-left">
                <h3 className="text-base font-bold tracking-wide mb-6">Daily Reservations</h3>
                <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 border-b border-[#2d1e18] border-l border-[#2d1e18]/40 px-4 relative">
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-[#2d1e18]/30 border-dashed pointer-events-none"></div>
                  <div className="absolute left-0 right-0 top-2/4 border-t border-[#2d1e18]/30 border-dashed pointer-events-none"></div>
                  <div className="absolute left-0 right-0 top-3/4 border-t border-[#2d1e18]/30 border-dashed pointer-events-none"></div>

                  {[
                    { day: 'Mon', count: 12, hPct: '40%' },
                    { day: 'Tue', count: 16, hPct: '53%' },
                    { day: 'Wed', count: 24, hPct: '80%' },
                    { day: 'Thu', count: 18, hPct: '60%' },
                    { day: 'Fri', count: 30, hPct: '100%' },
                    { day: 'Sat', count: 28, hPct: '93%' },
                    { day: 'Sun', count: 22, hPct: '73%' },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative group z-10">
                      {/* Tooltip value */}
                      <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#d4b26f]/30 text-[#d4b26f] font-mono text-[10px] py-0.5 px-2 rounded-md font-bold">
                        {bar.count}
                      </span>
                      <div className="w-full bg-gradient-to-t from-[#2d1e18] to-[#d4b26f] rounded-t-md transition-all duration-1000 origin-bottom hover:brightness-110 shadow-lg shadow-[#d4b26f]/5" style={{ height: bar.hPct }}></div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase mt-1.5">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Reservations Area Chart */}
              <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl text-left">
                <h3 className="text-base font-bold tracking-wide mb-6">Monthly Volume Chart</h3>
                
                {/* SVG Line Graph */}
                <div className="h-64 w-full relative pt-6 border-b border-[#2d1e18] border-l border-[#2d1e18]/40 px-2 flex flex-col justify-end">
                  <svg className="absolute inset-0 w-full h-[88%] z-10 px-2" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* Fill */}
                    <path
                      d="M0 50 L0 30 Q25 15 50 25 T100 10 L100 50 Z"
                      fill="url(#area-glow)"
                    />
                    {/* Line */}
                    <path
                      d="M0 30 Q25 15 50 25 T100 10"
                      fill="none"
                      stroke="#d4b26f"
                      strokeWidth="1.5"
                    />
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="area-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d4b26f" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#d4b26f" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Axis labels */}
                  <div className="w-full flex justify-between text-[10px] text-gray-500 font-bold uppercase pt-1.5 z-20">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                    <span>Nov</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: Settings */}
        {activeTab === 'Settings' && (
          <div className="bg-[#140d0c] border border-[#2d1e18] rounded-2xl p-6 shadow-xl text-left max-w-xl animate-in fade-in duration-300 space-y-6">
            <h3 className="text-lg font-bold tracking-wide border-b border-[#2d1e18] pb-3">General Parameters</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">
                  Cafe WhatsApp Contact (International Format)
                </label>
                <input
                  type="text"
                  defaultValue="919999999999"
                  className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">
                  Operating Hours Open
                </label>
                <input
                  type="text"
                  defaultValue="08:00 AM"
                  className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">
                  Operating Hours Close
                </label>
                <input
                  type="text"
                  defaultValue="11:00 PM"
                  className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">
                  Default Currency Symbol
                </label>
                <input
                  type="text"
                  defaultValue="₹"
                  className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#2d1e18]">
                <button className="py-2.5 px-6 bg-[#d4b26f] text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-all text-[11px]">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
