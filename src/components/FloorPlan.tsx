import React, { useRef, useState } from 'react';

export interface TableData {
  id: string;
  name: string;
  shape: 'circle' | 'square' | 'rectangle' | 'oval';
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number; // for circle/oval
  capacity: number;
  status: 'Available' | 'Reserved' | 'Maintenance';
}

interface FloorPlanProps {
  tables: TableData[];
  selectedTableId: string | null;
  onSelectTable: (table: TableData) => void;
  isAdminEditor?: boolean;
  onTableUpdate?: (tableId: string, updates: Partial<TableData>) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  isAdminEditor = false,
  onTableUpdate,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  
  // Table dragging in admin mode
  const [activeDragTableId, setActiveDragTableId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Mobile pinch-to-zoom helpers
  const lastTouchDistance = useRef<number | null>(null);

  // Reset view button helper
  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  };

  // Convert client cursor coords to SVG workspace coords
  const getSVGCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 800;
    const y = ((clientY - rect.top) / rect.height) * 600;
    return { x, y };
  };

  // Handle Drag-to-Pan and Table dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const isBackground = target.tagName === 'svg' || target.id === 'floorplan-bg' || target.id === 'grid-pattern';

    if (isAdminEditor && !isBackground) {
      // Check if clicked a table group/shape
      const tableId = target.getAttribute('data-table-id') || target.parentElement?.getAttribute('data-table-id');
      if (tableId) {
        const table = tables.find(t => t.id === tableId);
        if (table) {
          setActiveDragTableId(tableId);
          const coords = getSVGCoords(e.clientX, e.clientY);
          dragOffset.current = {
            x: coords.x - table.cx,
            y: coords.y - table.cy,
          };
          e.stopPropagation();
          return;
        }
      }
    }

    // Otherwise, start Panning
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeDragTableId && isAdminEditor && onTableUpdate) {
      const coords = getSVGCoords(e.clientX, e.clientY);
      const newCx = Math.max(40, Math.min(760, Math.round(coords.x - dragOffset.current.x)));
      const newCy = Math.max(40, Math.min(560, Math.round(coords.y - dragOffset.current.y)));
      
      onTableUpdate(activeDragTableId, { cx: newCx, cy: newCy });
      return;
    }

    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setActiveDragTableId(null);
  };

  // Touch handlers for mobile pinching and dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const target = e.target as SVGElement;
      const isBackground = target.tagName === 'svg' || target.id === 'floorplan-bg';
      
      if (isAdminEditor && !isBackground) {
        const tableId = target.getAttribute('data-table-id') || target.parentElement?.getAttribute('data-table-id');
        if (tableId) {
          const table = tables.find(t => t.id === tableId);
          if (table) {
            setActiveDragTableId(tableId);
            const coords = getSVGCoords(e.touches[0].clientX, e.touches[0].clientY);
            dragOffset.current = {
              x: coords.x - table.cx,
              y: coords.y - table.cy,
            };
            e.stopPropagation();
            return;
          }
        }
      }

      setIsPanning(true);
      panStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeDragTableId && isAdminEditor && onTableUpdate && e.touches.length === 1) {
      const coords = getSVGCoords(e.touches[0].clientX, e.touches[0].clientY);
      const newCx = Math.max(40, Math.min(760, Math.round(coords.x - dragOffset.current.x)));
      const newCy = Math.max(40, Math.min(560, Math.round(coords.y - dragOffset.current.y)));
      
      onTableUpdate(activeDragTableId, { cx: newCx, cy: newCy });
      return;
    }

    if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - panStart.current.x,
        y: e.touches[0].clientY - panStart.current.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const zoomFactor = dist / lastTouchDistance.current;
      setScale(s => Math.max(1, Math.min(3.5, s * zoomFactor)));
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setActiveDragTableId(null);
    lastTouchDistance.current = null;
  };

  // Helper to render chairs around rectangle/square tables
  const renderChairs = (cx: number, cy: number, w: number, h: number, capacity: number) => {
    const chairs = [];
    const radius = 7;
    const padding = 14; 
    const chairsPerRow = Math.ceil(capacity / 2);

    const topY = cy - h / 2 - padding;
    const bottomY = cy + h / 2 + padding;

    for (let i = 0; i < chairsPerRow; i++) {
      let xOffset = 0;
      if (chairsPerRow > 1) {
        const startX = cx - w / 2 + 15;
        const endX = cx + w / 2 - 15;
        const step = (endX - startX) / (chairsPerRow - 1);
        xOffset = startX + i * step - cx;
      }

      chairs.push(
        <circle
          key={`top-${i}`}
          cx={cx + xOffset}
          cy={topY}
          r={radius}
          fill="#d4b26f"
          fillOpacity="0.15"
          stroke="#d4b26f"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
      );

      // Avoid placing extra chair if capacity is odd
      if (i + chairsPerRow < capacity || capacity % 2 === 0) {
        chairs.push(
          <circle
            key={`bottom-${i}`}
            cx={cx + xOffset}
            cy={bottomY}
            r={radius}
            fill="#d4b26f"
            fillOpacity="0.15"
            stroke="#d4b26f"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
        );
      }
    }
    return chairs;
  };

  // Helper to render radial chairs for circle/oval tables
  const renderRadialChairs = (cx: number, cy: number, r: number, capacity: number) => {
    const chairs = [];
    const radius = 7;
    const chairDistance = r + 14;

    for (let i = 0; i < capacity; i++) {
      const angle = (i * 2 * Math.PI) / capacity - Math.PI / 2; // start from top
      const chairX = cx + chairDistance * Math.cos(angle);
      const chairY = cy + chairDistance * Math.sin(angle);

      chairs.push(
        <circle
          key={`radial-${i}`}
          cx={chairX}
          cy={chairY}
          r={radius}
          fill="#d4b26f"
          fillOpacity="0.15"
          stroke="#d4b26f"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
      );
    }
    return chairs;
  };

  return (
    <div className="relative w-full aspect-[4/3] max-w-[800px] mx-auto bg-[#130d0a] border border-[#2d1e18] rounded-2xl overflow-hidden shadow-2xl select-none">
      
      {/* Zoom / Pan Controller GUI */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={() => setScale(s => Math.min(3.5, s + 0.25))}
          className="w-10 h-10 rounded-lg bg-black/60 border border-[#2d1e18] text-white flex items-center justify-center font-bold text-lg hover:bg-[#d4b26f] hover:text-black transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(1, s - 0.25))}
          className="w-10 h-10 rounded-lg bg-black/60 border border-[#2d1e18] text-white flex items-center justify-center font-bold text-lg hover:bg-[#d4b26f] hover:text-black transition-colors"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="px-3 h-10 rounded-lg bg-black/60 border border-[#2d1e18] text-white flex items-center justify-center text-xs font-semibold hover:bg-[#d4b26f] hover:text-black transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* Interactive SVG Workspace */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212, 178, 111, 0.03)" strokeWidth="1" />
          </pattern>
          {/* Animated Gold Stroke Pattern for Selected Table */}
          <linearGradient id="gold-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#d4b26f" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>

        <rect id="floorplan-bg" width="100%" height="100%" fill="#130d0a" />
        <rect width="100%" height="100%" fill="url(#grid)" id="grid-pattern" />

        {/* Cafe Boundary Wall & Layout (translates and scales based on user inputs) */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} className="origin-center transition-transform duration-100 ease-out">
          
          {/* Cafe Walls */}
          <rect x="20" y="20" width="760" height="560" fill="none" stroke="#2d1e18" strokeWidth="6" rx="10" />
          <rect x="25" y="25" width="750" height="550" fill="none" stroke="#d4b26f" strokeWidth="1" strokeOpacity="0.1" rx="8" />

          {/* Entrance Label (Bottom Center) */}
          <g transform="translate(400, 570)">
            <rect x="-60" y="-12" width="120" height="24" rx="4" fill="#1b110e" stroke="#2d1e18" strokeWidth="2" />
            <text textAnchor="middle" y="5" fill="#9ca3af" fontSize="11" fontWeight="bold" letterSpacing="2">ENTRANCE</text>
          </g>

          {/* Order Counter & Bar Area (Top Right) */}
          <g transform="translate(520, 40)">
            {/* Wooden Counter Deck */}
            <rect x="0" y="0" width="240" height="110" rx="10" fill="#1b110e" stroke="#2d1e18" strokeWidth="3" />
            {/* Glossmorphic bar trim */}
            <rect x="5" y="90" width="230" height="15" rx="4" fill="rgba(212, 178, 111, 0.15)" stroke="#d4b26f" strokeWidth="1" />
            <text x="120" y="50" textAnchor="middle" fill="#d4b26f" fontSize="14" fontWeight="bold" letterSpacing="3">ORDER COUNTER</text>
            <text x="120" y="72" textAnchor="middle" fill="#9fa0a6" fontSize="10" fontWeight="500" letterSpacing="1">BARISTA ZONE</text>
            
            {/* Espresso machine icons (rect circles) */}
            <rect x="20" y="20" width="25" height="15" fill="#2d1e18" rx="2" />
            <rect x="30" y="10" width="5" height="10" fill="#d4b26f" />
            <rect x="200" y="20" width="20" height="15" fill="#2d1e18" rx="2" />
          </g>

          {/* Render Tables & Chairs */}
          {tables.map(table => {
            const isSelected = selectedTableId === table.id;
            
            // Availability state classes
            let statusColor = '';
            let glowFilter = '';
            
            if (table.status === 'Available') {
              statusColor = 'stroke-emerald-500 fill-emerald-500/10 hover:fill-emerald-500/25';
              glowFilter = 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.45))';
            } else if (table.status === 'Reserved') {
              statusColor = 'stroke-red-500 fill-red-500/10';
              glowFilter = 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.2))';
            } else { // Maintenance
              statusColor = 'stroke-gray-500 fill-gray-500/10';
              glowFilter = 'drop-shadow(0 0 2px rgba(156, 163, 175, 0.15))';
            }

            // Override color if selected
            if (isSelected) {
              statusColor = 'stroke-[url(#gold-glow)] stroke-[2.5px] fill-amber-500/20';
              glowFilter = 'drop-shadow(0 0 10px rgba(212, 178, 111, 0.6))';
            }

            // Click Handler
            const handleClick = (e: React.MouseEvent) => {
              if (isAdminEditor) return; // ignore standard click in admin editor drag
              if (table.status === 'Available') {
                onSelectTable(table);
              }
              e.stopPropagation();
            };

            return (
              <g
                key={table.id}
                data-table-id={table.id}
                onClick={handleClick}
                className={`transition-all duration-300 ${table.status === 'Available' && !isAdminEditor ? 'cursor-pointer' : ''}`}
                style={{ filter: glowFilter }}
              >
                {/* Render Chairs First so they are behind/around the table */}
                {table.shape === 'circle' || table.shape === 'oval'
                  ? renderRadialChairs(table.cx, table.cy, table.r, table.capacity)
                  : renderChairs(table.cx, table.cy, table.w, table.h, table.capacity)
                }

                {/* Render Table Shape */}
                {table.shape === 'circle' && (
                  <circle
                    cx={table.cx}
                    cy={table.cy}
                    r={table.r}
                    className={`transition-all duration-300 stroke-[1.8] ${statusColor}`}
                  />
                )}

                {table.shape === 'oval' && (
                  <ellipse
                    cx={table.cx}
                    cy={table.cy}
                    rx={table.r}
                    ry={table.r * 0.7}
                    className={`transition-all duration-300 stroke-[1.8] ${statusColor}`}
                  />
                )}

                {table.shape === 'square' && (
                  <rect
                    x={table.cx - table.w / 2}
                    y={table.cy - table.h / 2}
                    width={table.w}
                    height={table.h}
                    rx="8"
                    className={`transition-all duration-300 stroke-[1.8] ${statusColor}`}
                  />
                )}

                {table.shape === 'rectangle' && (
                  <rect
                    x={table.cx - table.w / 2}
                    y={table.cy - table.h / 2}
                    width={table.w}
                    height={table.h}
                    rx="10"
                    className={`transition-all duration-300 stroke-[1.8] ${statusColor}`}
                  />
                )}

                {/* Animated Gold Ring border overlay if selected */}
                {isSelected && (
                  <>
                    {table.shape === 'circle' && (
                      <circle
                        cx={table.cx}
                        cy={table.cy}
                        r={table.r + 3}
                        fill="none"
                        stroke="#d4b26f"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        className="animate-[spin_20s_linear_infinite]"
                      />
                    )}
                    {(table.shape === 'square' || table.shape === 'rectangle') && (
                      <rect
                        x={table.cx - table.w / 2 - 3}
                        y={table.cy - table.h / 2 - 3}
                        width={table.w + 6}
                        height={table.h + 6}
                        rx="12"
                        fill="none"
                        stroke="#d4b26f"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        className="animate-pulse"
                      />
                    )}
                  </>
                )}

                {/* Table Label Text */}
                <text
                  x={table.cx}
                  y={table.cy + 3}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : table.status === 'Maintenance' ? '#9ca3af' : '#f8f9fa'}
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none transition-colors duration-300"
                >
                  {table.name}
                </text>

                {/* Table Capacity Label */}
                <text
                  x={table.cx}
                  y={table.cy + 17}
                  textAnchor="middle"
                  fill="#9fa0a6"
                  fontSize="8"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {table.capacity} Pax
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Visual Key Legends */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-x-4 gap-y-2 justify-center bg-black/60 border border-[#2d1e18] px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold text-white">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#d4b26f] border border-amber-300 drop-shadow-[0_0_4px_rgba(212,178,111,0.5)]"></span>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-500 border border-gray-400"></span>
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};
