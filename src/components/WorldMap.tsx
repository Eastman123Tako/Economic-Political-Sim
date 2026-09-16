import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useGameStore } from '../store/gameStore';
import { MAP_ID_ALIASES } from '../data/worldData';
import type { Alignment } from '../engine/types';

const GEO_URL = '/geo/countries-110m.json';

const ALIGNMENT_COLOR: Record<Alignment, string> = {
  NATO: '#2563eb',
  WarsawPact: '#dc2626',
  NonAligned: '#16a34a',
  Other: '#4b5563',
};

export default function WorldMap() {
  const world = useGameStore((s) => s.world)!;
  const selectedCountryCode = useGameStore((s) => s.selectedCountryCode);
  const selectCountry = useGameStore((s) => s.selectCountry);
  const [hoverName, setHoverName] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const idToCode = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of Object.values(world.countries)) map[c.mapId] = c.code;
    for (const [aliasId, code] of Object.entries(MAP_ID_ALIASES)) map[aliasId] = code;
    return map;
  }, [world.countries]);

  return (
    <div className="relative w-full h-full bg-[#0a1622]">
      <ComposableMap projectionConfig={{ scale: 148 }} className="w-full h-full">
        <ZoomableGroup center={[10, 15]} zoom={1} minZoom={1} maxZoom={6}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = idToCode[geo.id as string];
                const c = code ? world.countries[code] : undefined;
                const isPlayer = code === world.playerCode;
                const isSelected = code === selectedCountryCode;
                const fill = c ? ALIGNMENT_COLOR[c.alignment] : '#1e2433';
                const isHovered = hoveredKey === geo.rsmKey;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => code && selectCountry(code)}
                    onMouseEnter={() => { setHoverName(c ? c.name : (geo.properties?.name as string)); setHoveredKey(geo.rsmKey); }}
                    onMouseLeave={() => { setHoverName(null); setHoveredKey(null); }}
                    fill={fill}
                    stroke={isHovered || isSelected ? '#fbbf24' : isPlayer ? '#fbbf24' : '#0a1622'}
                    strokeWidth={isHovered || isSelected ? 1.3 : isPlayer ? 1.2 : 0.4}
                    style={{ outline: 'none', cursor: code ? 'pointer' : 'default' }}
                    className={isSelected ? 'opacity-100' : c ? 'opacity-95' : 'opacity-60'}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hoverName && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 pointer-events-none">
          {hoverName}
        </div>
      )}

      <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 space-y-1">
        <Legend color={ALIGNMENT_COLOR.NATO} label="NATO" />
        <Legend color={ALIGNMENT_COLOR.WarsawPact} label="Warsaw Pact" />
        <Legend color={ALIGNMENT_COLOR.NonAligned} label="Non-Aligned" />
        <Legend color={ALIGNMENT_COLOR.Other} label="Other" />
        <Legend color="#1e2433" label="Unmodeled" outline />
      </div>
    </div>
  );
}

function Legend({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color, border: outline ? '1px solid #475569' : undefined }} />
      <span>{label}</span>
    </div>
  );
}
