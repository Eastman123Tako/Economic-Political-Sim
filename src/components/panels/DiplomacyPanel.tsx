import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getRelation } from '../../engine/diplomacy';

export default function DiplomacyPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const [aidDrafts, setAidDrafts] = useState<Record<string, number>>({});

  const others = Object.values(world.countries)
    .filter((o) => o.code !== c.code)
    .sort((a, b) => getRelation(c, b.code).relationScore - getRelation(c, a.code).relationScore);

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="brackets bg-void-900/60 border border-void-700 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-void-950/60 text-void-500 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Nation</th>
              <th className="text-left px-3 py-2">Alignment</th>
              <th className="text-right px-3 py-2">Relations</th>
              <th className="text-right px-3 py-2">Trade</th>
              <th className="text-center px-3 py-2">Flags</th>
              <th className="text-right px-3 py-2">Aid ($M/yr)</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {others.map((o) => {
              const rel = getRelation(c, o.code);
              const draft = aidDrafts[o.code] ?? rel.aidFlowMillionPerYear;
              return (
                <tr key={o.code} className="border-t border-void-800 hover:bg-void-900/40">
                  <td className="px-3 py-1.5 text-void-200">{o.name}{o.isMajor ? ' ★' : ''}</td>
                  <td className="px-3 py-1.5 text-void-400">{o.alignment}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums font-medium ${rel.relationScore >= 0 ? 'text-sage-400' : 'text-brick-400'}`}>{rel.relationScore.toFixed(0)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-void-400">${rel.tradeVolumeBillion.toFixed(2)}B</td>
                  <td className="px-3 py-1.5 text-center text-xs text-void-500">
                    {rel.sanctioned && <span className="text-brick-400 mr-1">SANC</span>}
                    {rel.militaryCooperation && <span className="text-steel-400 mr-1">MIL</span>}
                    {rel.intelligenceSharing && <span className="text-khaki-400">INT</span>}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <input
                      type="number" min={0} step={10} value={draft}
                      onChange={(e) => setAidDrafts((d) => ({ ...d, [o.code]: parseFloat(e.target.value) || 0 }))}
                      onBlur={() => dispatch({ type: 'setAidFlow', to: o.code, millionPerYear: draft })}
                      className="w-20 bg-void-800 border border-void-700 rounded px-1.5 py-0.5 text-right text-xs text-void-200"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex gap-1 flex-wrap">
                      <ActionBtn onClick={() => dispatch({ type: 'setRelationAction', to: o.code, action: rel.sanctioned ? 'unsanction' : 'sanction' })}>
                        {rel.sanctioned ? 'Unsanction' : 'Sanction'}
                      </ActionBtn>
                      <ActionBtn onClick={() => dispatch({ type: 'setRelationAction', to: o.code, action: 'militaryCoop' })} disabled={rel.militaryCooperation}>
                        Mil. Coop.
                      </ActionBtn>
                      <ActionBtn onClick={() => dispatch({ type: 'setRelationAction', to: o.code, action: 'shareIntel' })} disabled={rel.intelligenceSharing}>
                        Share Intel
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-void-500 mt-2">NATO / Warsaw Pact membership shown under each nation's alignment. Trade and relation scores drift automatically based on bloc alignment, cooperation, sanctions, and aid.</p>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-0.5 rounded text-xs ${disabled ? 'bg-void-800 text-void-600' : 'bg-void-800 text-void-300 hover:bg-void-700'}`}
    >
      {children}
    </button>
  );
}
