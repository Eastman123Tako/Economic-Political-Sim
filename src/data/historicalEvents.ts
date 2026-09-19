// Conditional historical Cold War events. Each fires only within its date
// window AND while its condition holds, so a sufficiently different history
// (player intervention, divergent stability/relations) can delay, avert, or
// reshape the outcome rather than forcing the script.
import type { HistoricalEventDef, WorldState } from '../engine/types';
import { getRelation } from '../engine/diplomacy';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const has = (w: WorldState, code: string) => !!w.countries[code];

function bump(w: WorldState, code: string, stabilityDelta: number, approvalDelta = 0) {
  const c = w.countries[code];
  if (!c) return;
  c.stabilityIndex = clamp(c.stabilityIndex + stabilityDelta, 0, 100);
  c.politics.approvalPct = clamp(c.politics.approvalPct + approvalDelta, 2, 98);
}

function oilShock(w: WorldState, magnitude: number) {
  const importers = ['USA', 'GBR', 'FRA', 'DEU_W', 'ITA', 'JPN', 'IND'];
  const exporters = ['SAU', 'IRN', 'IRQ', 'VEN', 'DZA'];
  for (const code of importers) {
    const c = w.countries[code];
    if (!c) continue;
    c.economy.energyIndex = clamp(c.economy.energyIndex - magnitude, 5, 100);
    c.economy.inflationPct += magnitude * 0.15;
  }
  for (const code of exporters) {
    const c = w.countries[code];
    if (!c) continue;
    c.economy.gdpBillion *= 1 + magnitude / 200;
    c.economy.foreignReservesBillion *= 1 + magnitude / 100;
  }
}

export const HISTORICAL_EVENTS: HistoricalEventDef[] = [
  {
    id: 'chinese_communist_victory',
    title: 'Chinese Communist Revolution',
    earliestDate: { year: 1949, month: 9 }, latestDate: { year: 1949, month: 12 },
    condition: (w) => has(w, 'CHN'),
    apply: (w) => {
      const c = w.countries.CHN;
      c.government = "People's Republic (Communist, est. Oct 1949)";
      c.flags.communistVictory = true;
      return 'Mao Zedong proclaims the People\'s Republic of China after the Communist victory in the civil war.';
    },
    oneTime: true,
  },
  {
    id: 'korean_war_outbreak',
    title: 'Korean War Begins',
    earliestDate: { year: 1950, month: 6 }, latestDate: { year: 1950, month: 9 },
    condition: (w) => has(w, 'KOR_N') && has(w, 'KOR_S'),
    apply: (w) => {
      w.countries.KOR_S.stabilityIndex = clamp(w.countries.KOR_S.stabilityIndex - 25, 0, 100);
      w.countries.KOR_N.stabilityIndex = clamp(w.countries.KOR_N.stabilityIndex - 10, 0, 100);
      if (has(w, 'USA')) { w.countries.USA.flags.koreanWarActive = true; w.countries.USA.budget.spending.defense *= 1.8; }
      if (has(w, 'SUN')) w.countries.SUN.flags.koreanWarActive = true;
      return 'North Korean forces invade South Korea, triggering a US-led UN intervention.';
    },
    oneTime: true,
  },
  {
    id: 'korean_armistice',
    title: 'Korean Armistice',
    earliestDate: { year: 1953, month: 7 }, latestDate: { year: 1955, month: 12 },
    condition: (w) => !!w.countries.USA?.flags.koreanWarActive,
    apply: (w) => {
      if (has(w, 'USA')) w.countries.USA.flags.koreanWarActive = false;
      if (has(w, 'SUN')) w.countries.SUN.flags.koreanWarActive = false;
      bump(w, 'KOR_S', 10); bump(w, 'KOR_N', 5);
      return 'An armistice at Panmunjom ends fighting in Korea, leaving the peninsula divided near the 38th parallel.';
    },
    oneTime: true,
  },
  {
    id: 'stalin_death',
    title: "Stalin's Death",
    earliestDate: { year: 1953, month: 3 }, latestDate: { year: 1953, month: 4 },
    condition: (w) => w.playerCode === 'SUN',
    apply: (w) => {
      const c = w.countries.SUN;
      c.politics.unrestIndex = clamp(c.politics.unrestIndex + 15, 0, 100);
      c.politics.headOfState = 'Collective Leadership (Politburo)';
      return 'Joseph Stalin dies; a collective leadership struggle begins in the Politburo.';
    },
    oneTime: true,
  },
  {
    id: 'hungarian_revolution',
    title: 'Hungarian Revolution',
    earliestDate: { year: 1956, month: 10 }, latestDate: { year: 1957, month: 2 },
    condition: (w) => has(w, 'HUN') && w.countries.HUN.stabilityIndex < 68,
    apply: (w) => {
      bump(w, 'HUN', -20);
      if (has(w, 'SUN')) getRelation(w.countries.SUN, 'USA').relationScore = clamp(getRelation(w.countries.SUN, 'USA').relationScore - 15, -100, 100);
      return 'A popular uprising in Hungary is crushed by Soviet tanks, straining East-West relations.';
    },
    oneTime: true,
  },
  {
    id: 'suez_crisis',
    title: 'Suez Crisis',
    earliestDate: { year: 1956, month: 10 }, latestDate: { year: 1957, month: 1 },
    condition: (w) => has(w, 'EGY') && (has(w, 'GBR') || has(w, 'FRA')),
    apply: (w) => {
      bump(w, 'EGY', 15);
      if (has(w, 'GBR')) { w.countries.GBR.flags.sterlingCrisisRisk = 60; w.countries.GBR.politics.approvalPct = clamp(w.countries.GBR.politics.approvalPct - 10, 2, 98); }
      if (has(w, 'FRA')) w.countries.FRA.politics.approvalPct = clamp(w.countries.FRA.politics.approvalPct - 6, 2, 98);
      return 'The Suez Crisis exposes the limits of British and French power as US and Soviet pressure forces withdrawal.';
    },
    oneTime: true,
  },
  {
    id: 'fifth_republic_founded',
    title: 'Founding of the Fifth Republic',
    earliestDate: { year: 1958, month: 9 }, latestDate: { year: 1959, month: 1 },
    condition: (w) => has(w, 'FRA'),
    apply: (w) => {
      const c = w.countries.FRA;
      c.politics.parties = [
        { id: 'fra_unr', name: 'UNR (Gaullist)', ideology: 'Gaullist/Nationalist', seatSharePct: 42, popularSupportPct: 40, inGovernment: true },
        { id: 'fra_sfio', name: 'SFIO (Socialist)', ideology: 'Socialist', seatSharePct: 18, popularSupportPct: 17, inGovernment: false },
        { id: 'fra_mrp', name: 'MRP (Christian Democrat)', ideology: 'Christian Democrat', seatSharePct: 15, popularSupportPct: 14, inGovernment: false },
        { id: 'fra_pcf', name: 'French Communist Party (PCF)', ideology: 'Communist', seatSharePct: 19, popularSupportPct: 20, inGovernment: false },
        { id: 'fra_independents', name: 'Independent Republicans', ideology: 'Liberal-Conservative', seatSharePct: 6, popularSupportPct: 9, inGovernment: false },
      ];
      c.politics.rulingPartyId = 'fra_unr';
      c.politics.headOfState = 'Charles de Gaulle';
      c.politics.headOfGovernment = 'Michel Debré';
      c.politics.legislatureName = 'National Assembly (Fifth Republic)';
      c.politics.electionCycleMonths = 84;
      c.politics.nextElectionDate = { year: 1965, month: 12 };
      c.politics.coalitionStabilityPct = 100;
      c.politics.approvalPct = clamp(c.politics.approvalPct + 10, 2, 98);
      c.flags.termsSinceLeaderChange = 1;
      return 'Facing the Algerian crisis, France adopts a new constitution: Charles de Gaulle becomes President of a far more stable semi-presidential Fifth Republic.';
    },
    oneTime: true,
  },
  {
    id: 'sputnik',
    title: 'Sputnik Launch',
    earliestDate: { year: 1957, month: 10 }, latestDate: { year: 1959, month: 12 },
    condition: (w) => has(w, 'SUN') && w.countries.SUN.economy.techIndex >= 62,
    apply: (w) => {
      w.countries.SUN.economy.techIndex = clamp(w.countries.SUN.economy.techIndex + 4, 0, 100);
      if (has(w, 'USA')) { w.countries.USA.politics.approvalPct = clamp(w.countries.USA.politics.approvalPct - 8, 2, 98); w.countries.USA.budget.spending.research *= 1.5; }
      return 'The USSR launches Sputnik, the first artificial satellite, shocking American confidence in its technological lead.';
    },
    oneTime: true,
  },
  {
    id: 'cuban_revolution',
    title: 'Cuban Revolution',
    earliestDate: { year: 1959, month: 1 }, latestDate: { year: 1959, month: 6 },
    condition: (w) => has(w, 'CUB') && w.countries.CUB.alignment !== 'WarsawPact',
    apply: (w) => {
      const c = w.countries.CUB;
      c.government = 'Revolutionary Government (Castro)';
      c.alignment = 'NonAligned';
      c.stabilityIndex = clamp(c.stabilityIndex + 5, 0, 100);
      return 'Fidel Castro\'s revolutionaries overthrow the Batista government in Cuba.';
    },
    oneTime: true,
  },
  {
    id: 'berlin_wall_erected',
    title: 'Berlin Wall Erected',
    earliestDate: { year: 1961, month: 6 }, latestDate: { year: 1961, month: 12 },
    condition: () => true,
    apply: (w) => {
      if (has(w, 'DEU_W')) w.countries.DEU_W.flags.berlinWallUp = true;
      if (has(w, 'SUN')) w.countries.SUN.flags.berlinWallUp = true;
      if (has(w, 'USA')) w.countries.USA.flags.berlinWallUp = true;
      return 'East Germany erects the Berlin Wall, sealing the border and freezing the front line of the Cold War in Europe.';
    },
    oneTime: true,
  },
  {
    id: 'cuban_missile_crisis',
    title: 'Cuban Missile Crisis',
    earliestDate: { year: 1962, month: 10 }, latestDate: { year: 1963, month: 2 },
    condition: (w) => has(w, 'CUB') && has(w, 'USA') && has(w, 'SUN'),
    apply: (w) => {
      w.countries.CUB.alignment = 'WarsawPact';
      w.countries.USA.flags.hotlineEstablished = true;
      w.countries.SUN.flags.hotlineEstablished = true;
      bump(w, 'USA', 0, 6);
      bump(w, 'SUN', 0, 3);
      return 'The world approaches the brink over Soviet missiles in Cuba; a tense standoff ends peacefully, followed by a Moscow-Washington hotline.';
    },
    oneTime: true,
  },
  {
    id: 'sino_soviet_split',
    title: 'Sino-Soviet Split',
    earliestDate: { year: 1960, month: 1 }, latestDate: { year: 1963, month: 12 },
    condition: (w) => has(w, 'CHN') && has(w, 'SUN') && getRelation(w.countries.SUN, 'CHN').relationScore < 60,
    apply: (w) => {
      w.countries.CHN.alignment = 'NonAligned';
      getRelation(w.countries.SUN, 'CHN').relationScore = -40;
      return 'Ideological and strategic rivalry splits the Communist bloc as China breaks with Moscow.';
    },
    oneTime: true,
  },
  {
    id: 'six_day_war',
    title: 'Six-Day War',
    earliestDate: { year: 1967, month: 6 }, latestDate: { year: 1967, month: 8 },
    condition: (w) => has(w, 'ISR') && has(w, 'EGY') && has(w, 'SYR'),
    apply: (w) => {
      bump(w, 'ISR', 10, 8);
      bump(w, 'EGY', -12);
      bump(w, 'SYR', -10);
      return 'Israel decisively defeats a coalition of Arab states in the Six-Day War, reshaping the regional balance of power.';
    },
    oneTime: true,
  },
  {
    id: 'moroccan_tunisian_independence',
    title: 'Moroccan and Tunisian Independence',
    earliestDate: { year: 1956, month: 1 }, latestDate: { year: 1957, month: 6 },
    condition: (w) => (has(w, 'MAR') && w.countries.MAR.colonialRuler === 'FRA') || (has(w, 'TUN') && w.countries.TUN.colonialRuler === 'FRA'),
    apply: (w) => {
      for (const code of ['MAR', 'TUN']) {
        const c = w.countries[code];
        if (c && c.colonialRuler === 'FRA') { c.colonialRuler = undefined; c.alignment = 'NonAligned'; c.stabilityIndex = clamp(c.stabilityIndex + 8, 0, 100); }
      }
      if (has(w, 'FRA')) w.countries.FRA.politics.approvalPct = clamp(w.countries.FRA.politics.approvalPct - 3, 2, 98);
      return 'Facing rising nationalist pressure, France grants independence to Morocco and Tunisia through negotiated settlements.';
    },
    oneTime: true,
  },
  {
    id: 'congo_crisis',
    title: 'Congo Crisis',
    earliestDate: { year: 1960, month: 6 }, latestDate: { year: 1961, month: 12 },
    condition: (w) => has(w, 'COD'),
    apply: (w) => {
      const c = w.countries.COD;
      c.government = 'Independent Republic (Political Crisis)';
      c.stabilityIndex = clamp(c.stabilityIndex - 25, 0, 100);
      return 'Belgium abruptly grants Congolese independence; the new state immediately descends into secession crises and army mutiny, drawing in UN peacekeepers and Cold War rivalry over its mineral wealth.';
    },
    oneTime: true,
  },
  {
    id: 'french_west_africa_independence',
    title: 'French West Africa Decolonization',
    earliestDate: { year: 1960, month: 1 }, latestDate: { year: 1960, month: 12 },
    condition: (w) => has(w, 'SEN') && w.countries.SEN.colonialRuler === 'FRA',
    apply: (w) => {
      w.countries.SEN.colonialRuler = undefined;
      w.countries.SEN.alignment = 'NonAligned';
      w.countries.SEN.stabilityIndex = clamp(w.countries.SEN.stabilityIndex + 8, 0, 100);
      return "France's sub-Saharan African colonies, including Senegal, gain independence in a wave of negotiated transitions across 1960 -- the 'Year of Africa'.";
    },
    oneTime: true,
  },
  {
    id: 'prague_spring',
    title: 'Prague Spring',
    earliestDate: { year: 1968, month: 8 }, latestDate: { year: 1969, month: 3 },
    condition: (w) => has(w, 'TCH') && (!has(w, 'SUN') || getRelation(w.countries.SUN, 'TCH').relationScore < 65),
    apply: (w) => {
      bump(w, 'TCH', -15);
      if (has(w, 'SUN')) w.countries.SUN.politics.approvalPct = clamp(w.countries.SUN.politics.approvalPct - 3, 2, 98);
      return 'Warsaw Pact forces invade Czechoslovakia to crush Alexander Dubček\'s liberalizing reforms.';
    },
    oneTime: true,
  },
  {
    id: 'vietnam_geneva_partition',
    title: 'Geneva Accords Partition Vietnam',
    earliestDate: { year: 1954, month: 5 }, latestDate: { year: 1955, month: 6 },
    condition: (w) => has(w, 'VNM') && w.countries.VNM.colonialRuler === 'FRA',
    apply: (w) => {
      w.countries.VNM.colonialRuler = undefined;
      w.countries.VNM.alignment = 'Other';
      w.countries.VNM.flags.vietnamDivided = true;
      if (has(w, 'FRA')) {
        const col = w.countries.FRA.colonies?.find((x) => x.id === 'VNM');
        if (col) { col.independent = true; col.independenceDate = { ...w.date }; }
      }
      return 'French defeat at Dien Bien Phu leads to the Geneva Accords, partitioning Vietnam at the 17th parallel.';
    },
    oneTime: true,
  },
  {
    id: 'vietnam_us_escalation',
    title: 'US Escalation in Vietnam',
    earliestDate: { year: 1965, month: 3 }, latestDate: { year: 1966, month: 12 },
    condition: (w) => !!w.countries.VNM?.flags.vietnamDivided && has(w, 'USA'),
    apply: (w) => {
      w.countries.USA.flags.vietnamWarActive = true;
      w.countries.USA.budget.spending.defense *= 1.25;
      bump(w, 'VNM', -10);
      return 'The United States commits ground combat troops to South Vietnam, sharply escalating the war.';
    },
    oneTime: true,
  },
  {
    id: 'fall_of_saigon',
    title: 'Fall of Saigon',
    earliestDate: { year: 1973, month: 6 }, latestDate: { year: 1976, month: 12 },
    condition: (w) => !!w.countries.USA?.flags.vietnamWarActive,
    apply: (w) => {
      w.countries.USA.flags.vietnamWarActive = false;
      w.countries.VNM.alignment = 'WarsawPact';
      w.countries.VNM.flags.vietnamReunified = true;
      bump(w, 'USA', -5, -8);
      return 'North Vietnamese forces capture Saigon; Vietnam is reunified under communist rule.';
    },
    oneTime: true,
  },
  {
    id: 'yom_kippur_oil_shock',
    title: 'Yom Kippur War & Oil Embargo',
    earliestDate: { year: 1973, month: 10 }, latestDate: { year: 1974, month: 3 },
    condition: (w) => has(w, 'ISR') && has(w, 'EGY'),
    apply: (w) => {
      bump(w, 'ISR', -5); bump(w, 'EGY', 8); bump(w, 'SYR', 4);
      oilShock(w, 18);
      return 'War in the Middle East triggers an Arab oil embargo; energy prices spike and Western economies slide toward stagflation.';
    },
    oneTime: true,
  },
  {
    id: 'detente_salt1',
    title: 'Détente and SALT I',
    earliestDate: { year: 1972, month: 1 }, latestDate: { year: 1973, month: 12 },
    condition: (w) => has(w, 'USA') && has(w, 'SUN') && getRelation(w.countries.USA, 'SUN').relationScore > -60,
    apply: (w) => {
      w.countries.USA.nuclear.readinessPct = clamp(w.countries.USA.nuclear.readinessPct - 10, 5, 100);
      w.countries.SUN.nuclear.readinessPct = clamp(w.countries.SUN.nuclear.readinessPct - 10, 5, 100);
      w.countries.USA.flags.detente = true; w.countries.SUN.flags.detente = true;
      return 'The SALT I accords and a broader détente ease superpower tensions and cap strategic arsenals.';
    },
    oneTime: true,
  },
  {
    id: 'iranian_revolution',
    title: 'Iranian Revolution',
    earliestDate: { year: 1978, month: 10 }, latestDate: { year: 1979, month: 6 },
    condition: (w) => has(w, 'IRN') && w.countries.IRN.stabilityIndex < 55,
    apply: (w) => {
      const c = w.countries.IRN;
      c.government = 'Islamic Republic (Revolutionary)';
      c.stabilityIndex = clamp(c.stabilityIndex - 10, 0, 100);
      oilShock(w, 12);
      return 'The Shah is overthrown in the Iranian Revolution; a second oil shock ripples through the world economy.';
    },
    oneTime: true,
  },
  {
    id: 'soviet_afghan_war',
    title: 'Soviet Invasion of Afghanistan',
    earliestDate: { year: 1979, month: 12 }, latestDate: { year: 1980, month: 6 },
    condition: (w) => has(w, 'AFG') && w.countries.AFG.stabilityIndex < 55,
    apply: (w) => {
      bump(w, 'AFG', -20);
      if (has(w, 'SUN')) {
        w.countries.SUN.flags.afghanWarActive = true;
        w.countries.SUN.budget.debtBillion += 8;
        w.countries.SUN.politics.unrestIndex = clamp(w.countries.SUN.politics.unrestIndex + 8, 0, 100);
      }
      if (has(w, 'USA')) getRelation(w.countries.USA, 'SUN').relationScore = clamp(getRelation(w.countries.USA, 'SUN').relationScore - 30, -100, 100);
      return 'Soviet forces invade Afghanistan to prop up its communist government, beginning a decade-long quagmire.';
    },
    oneTime: true,
  },
  {
    id: 'polish_solidarity',
    title: 'Solidarity Movement in Poland',
    earliestDate: { year: 1980, month: 8 }, latestDate: { year: 1982, month: 6 },
    condition: (w) => has(w, 'POL') && w.countries.POL.stabilityIndex < 58,
    apply: (w) => {
      bump(w, 'POL', -10);
      w.countries.POL.flags.martialLaw = true;
      return 'The independent Solidarity trade union movement rocks communist Poland; martial law is imposed to contain it.';
    },
    oneTime: true,
  },
  {
    id: 'euromissile_crisis',
    title: 'Euromissile Crisis',
    earliestDate: { year: 1983, month: 1 }, latestDate: { year: 1984, month: 12 },
    condition: (w) => has(w, 'SUN') && has(w, 'USA') && w.countries.SUN.nuclear.warheads > 500,
    apply: (w) => {
      if (has(w, 'DEU_W')) w.countries.DEU_W.stabilityIndex = clamp(w.countries.DEU_W.stabilityIndex - 5, 0, 100);
      getRelation(w.countries.USA, 'SUN').relationScore = clamp(getRelation(w.countries.USA, 'SUN').relationScore - 15, -100, 100);
      return 'NATO deploys Pershing II and cruise missiles in Europe to counter Soviet SS-20s, spiking public protest and superpower tension.';
    },
    oneTime: true,
  },
  {
    id: 'chernobyl',
    title: 'Chernobyl Disaster',
    earliestDate: { year: 1986, month: 4 }, latestDate: { year: 1986, month: 6 },
    condition: (w) => has(w, 'SUN'),
    apply: (w) => {
      const c = w.countries.SUN;
      c.economy.energyIndex = clamp(c.economy.energyIndex - 8, 0, 100);
      c.stabilityIndex = clamp(c.stabilityIndex - 8, 0, 100);
      c.politics.approvalPct = clamp(c.politics.approvalPct - 6, 2, 98);
      return 'A reactor explosion at the Chernobyl nuclear plant exposes the failures of Soviet secrecy and infrastructure.';
    },
    oneTime: true,
  },
  {
    id: 'inf_treaty',
    title: 'INF Treaty',
    earliestDate: { year: 1987, month: 12 }, latestDate: { year: 1988, month: 6 },
    condition: (w) => has(w, 'USA') && has(w, 'SUN') && getRelation(w.countries.USA, 'SUN').relationScore > -25,
    apply: (w) => {
      w.countries.USA.flags.infTreaty = true; w.countries.SUN.flags.infTreaty = true;
      w.countries.USA.nuclear.readinessPct = clamp(w.countries.USA.nuclear.readinessPct - 15, 5, 100);
      w.countries.SUN.nuclear.readinessPct = clamp(w.countries.SUN.nuclear.readinessPct - 15, 5, 100);
      return 'The INF Treaty eliminates an entire class of intermediate-range nuclear missiles, a landmark arms-control breakthrough.';
    },
    oneTime: true,
  },
  {
    id: 'fall_of_berlin_wall',
    title: 'Fall of the Berlin Wall',
    earliestDate: { year: 1989, month: 9 }, latestDate: { year: 1990, month: 6 },
    condition: (w) => !!w.countries.SUN?.flags.berlinWallUp && w.countries.SUN.stabilityIndex < 68,
    apply: (w) => {
      if (has(w, 'DEU_W')) { w.countries.DEU_W.flags.berlinWallUp = false; w.countries.DEU_W.stabilityIndex = clamp(w.countries.DEU_W.stabilityIndex + 15, 0, 100); }
      w.countries.SUN.flags.berlinWallUp = false;
      for (const code of ['POL', 'HUN', 'TCH', 'ROU', 'BGR']) bump(w, code, 20);
      return 'Mass protests bring down the Berlin Wall as Soviet-bloc governments lose their grip across Eastern Europe.';
    },
    oneTime: true,
  },
  {
    id: 'dissolution_warsaw_pact',
    title: 'Dissolution of the Warsaw Pact',
    earliestDate: { year: 1991, month: 3 }, latestDate: { year: 1991, month: 8 },
    condition: (w) => has(w, 'SUN') && w.countries.SUN.stabilityIndex < 60,
    apply: (w) => {
      for (const code of ['POL', 'HUN', 'TCH', 'ROU', 'BGR']) {
        const c = w.countries[code];
        if (c) { c.alignment = 'NonAligned'; c.alliances.warsawPactMember = false; }
      }
      return 'Facing Soviet retreat and economic crisis across the bloc, the Warsaw Pact formally dissolves.';
    },
    oneTime: true,
  },
  {
    id: 'collapse_of_ussr',
    title: 'Collapse of the Soviet Union',
    earliestDate: { year: 1991, month: 10 }, latestDate: { year: 1991, month: 12 },
    condition: (w) => has(w, 'SUN') && w.countries.SUN.stabilityIndex < 55,
    apply: (w) => {
      w.countries.SUN.flags.ussrCollapsed = true;
      w.countries.SUN.alliances.warsawPactMember = false;
      w.countries.SUN.economyType = 'mixed';
      return 'After years of economic stagnation and political upheaval, the Soviet Union dissolves into its constituent republics.';
    },
    oneTime: true,
  },
];
