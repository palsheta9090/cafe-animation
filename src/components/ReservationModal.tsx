import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TableData } from './FloorPlan';

interface ReservationModalProps {
  table: TableData | null;
  onClose: () => void;
  onReserve: (tableId: string, booking: BookingData) => void;
}

export interface BookingData {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  tableName: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  table,
  onClose,
  onReserve,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [time, setTime] = useState('18:00');
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus cleanup on mount
  useEffect(() => {
    if (table) {
      setGuests(Math.min(table.capacity, 2)); // default to capacity or 2
      setErrorMsg(null);
    }
  }, [table]);

  if (!table) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (guests > table.capacity) {
      setErrorMsg('This table cannot accommodate your group size.');
      return;
    }

    if (!customerName || !phone || !email || !date || !time) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setErrorMsg(null);

    const booking: BookingData = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      email,
      date,
      time,
      guests,
      tableId: table.id,
      tableName: table.name,
      notes,
      status: 'Confirmed', // immediately confirm for UX
    };

    // Trigger WhatsApp compilation
    const whatsappNumber = '919999999999'; // Cafe WhatsApp Business number
    const text = `Hello,\nI would like to reserve Table ${table.name}.\n\nDate: ${date}\nTime: ${time}\nGuests: ${guests}\n\nName: ${customerName}\nPhone: ${phone}\nSpecial Notes: ${notes || 'None'}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    // Callback to update parent/localstorage state
    onReserve(table.id, booking);

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Close Modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Click-out backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main panel - acts as bottom-sheet on mobile, modal on desktop */}
      <div 
        className="relative w-full md:max-w-[500px] bg-[#160d0a] border-t md:border border-[#2d1e18] rounded-t-3xl md:rounded-2xl p-6 md:p-8 shadow-2xl z-10 transition-transform duration-300 transform translate-y-0 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#2d1e18] pb-4 mb-6">
          <div className="text-left">
            <h3 className="font-headline-md text-xl font-bold text-white tracking-wide">
              Reserve Table {table.name}
            </h3>
            <p className="text-xs text-[#d4b26f] font-semibold tracking-wider mt-1 uppercase">
              Capacity: {table.capacity} Guests Max
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-[#2d1e18] text-[#9fa0a6] hover:bg-[#d4b26f] hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Table Name
              </label>
              <input
                type="text"
                disabled
                value={table.name}
                className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-[#d4b26f] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Max Capacity
              </label>
              <input
                type="text"
                disabled
                value={`${table.capacity} Seats`}
                className="w-full bg-[#1b110e] border border-[#2d1e18] rounded-lg px-3 py-2 text-sm text-[#9fa0a6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
              Customer Name <span className="text-[#d4b26f]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Phone Number <span className="text-[#d4b26f]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Email Address <span className="text-[#d4b26f]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Booking Date <span className="text-[#d4b26f]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
                Booking Time <span className="text-[#d4b26f]">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
              Guest Count <span className="text-[#d4b26f]">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-10 h-10 rounded-lg bg-[#2d1e18] border border-[#2d1e18] text-white flex items-center justify-center font-bold text-lg hover:bg-[#d4b26f] hover:text-black transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-white font-bold text-lg">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests(g => Math.min(table.capacity + 2, g + 1))} // Allow overflow to demonstrate validation!
                className="w-10 h-10 rounded-lg bg-[#2d1e18] border border-[#2d1e18] text-white flex items-center justify-center font-bold text-lg hover:bg-[#d4b26f] hover:text-black transition-colors"
              >
                +
              </button>
              <span className="text-[10px] text-[#9fa0a6] font-semibold">
                (Capacity: {table.capacity})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#9fa0a6] tracking-widest mb-1.5">
              Special Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Window side, birthday celebration, food allergies"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1b110e] border border-[#2d1e18] focus:border-[#d4b26f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#d4b26f] text-[#000] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-[#d4b26f]/10"
            >
              Reserve & Open WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
