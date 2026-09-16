// Scripted real-world leadership transitions, used as flavor for
// AI-controlled major powers as long as that nation's simulated politics
// haven't diverged from the historical governing party. The player's own
// nation is always resolved by the simulated election system instead.
import type { GameDate } from '../engine/types';

export interface LeaderTransition {
  date: GameDate;
  headOfState: string;
  headOfGovernment: string;
  rulingPartyId: string;
}

export const HISTORICAL_LEADERS: Record<string, LeaderTransition[]> = {
  USA: [
    { date: { year: 1953, month: 1 }, headOfState: 'Dwight D. Eisenhower', headOfGovernment: 'Dwight D. Eisenhower', rulingPartyId: 'us_rep' },
    { date: { year: 1961, month: 1 }, headOfState: 'John F. Kennedy', headOfGovernment: 'John F. Kennedy', rulingPartyId: 'us_dem' },
    { date: { year: 1963, month: 11 }, headOfState: 'Lyndon B. Johnson', headOfGovernment: 'Lyndon B. Johnson', rulingPartyId: 'us_dem' },
    { date: { year: 1969, month: 1 }, headOfState: 'Richard Nixon', headOfGovernment: 'Richard Nixon', rulingPartyId: 'us_rep' },
    { date: { year: 1974, month: 8 }, headOfState: 'Gerald Ford', headOfGovernment: 'Gerald Ford', rulingPartyId: 'us_rep' },
    { date: { year: 1977, month: 1 }, headOfState: 'Jimmy Carter', headOfGovernment: 'Jimmy Carter', rulingPartyId: 'us_dem' },
    { date: { year: 1981, month: 1 }, headOfState: 'Ronald Reagan', headOfGovernment: 'Ronald Reagan', rulingPartyId: 'us_rep' },
    { date: { year: 1989, month: 1 }, headOfState: 'George H. W. Bush', headOfGovernment: 'George H. W. Bush', rulingPartyId: 'us_rep' },
  ],
  GBR: [
    { date: { year: 1951, month: 10 }, headOfState: 'King George VI', headOfGovernment: 'Winston Churchill', rulingPartyId: 'uk_conservative' },
    { date: { year: 1955, month: 4 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Anthony Eden', rulingPartyId: 'uk_conservative' },
    { date: { year: 1957, month: 1 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Harold Macmillan', rulingPartyId: 'uk_conservative' },
    { date: { year: 1963, month: 10 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Alec Douglas-Home', rulingPartyId: 'uk_conservative' },
    { date: { year: 1964, month: 10 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Harold Wilson', rulingPartyId: 'uk_labour' },
    { date: { year: 1970, month: 6 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Edward Heath', rulingPartyId: 'uk_conservative' },
    { date: { year: 1974, month: 3 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Harold Wilson', rulingPartyId: 'uk_labour' },
    { date: { year: 1976, month: 4 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'James Callaghan', rulingPartyId: 'uk_labour' },
    { date: { year: 1979, month: 5 }, headOfState: 'Queen Elizabeth II', headOfGovernment: 'Margaret Thatcher', rulingPartyId: 'uk_conservative' },
  ],
  FRA: [
    { date: { year: 1959, month: 1 }, headOfState: 'Charles de Gaulle', headOfGovernment: 'Michel Debré', rulingPartyId: 'fra_ump' },
    { date: { year: 1962, month: 4 }, headOfState: 'Charles de Gaulle', headOfGovernment: 'Georges Pompidou', rulingPartyId: 'fra_ump' },
    { date: { year: 1969, month: 6 }, headOfState: 'Georges Pompidou', headOfGovernment: 'Jacques Chaban-Delmas', rulingPartyId: 'fra_ump' },
    { date: { year: 1974, month: 5 }, headOfState: 'Valéry Giscard d\'Estaing', headOfGovernment: 'Jacques Chirac', rulingPartyId: 'fra_udf' },
    { date: { year: 1981, month: 5 }, headOfState: 'François Mitterrand', headOfGovernment: 'Pierre Mauroy', rulingPartyId: 'fra_ps' },
    { date: { year: 1986, month: 3 }, headOfState: 'François Mitterrand', headOfGovernment: 'Jacques Chirac', rulingPartyId: 'fra_rpr' },
    { date: { year: 1988, month: 5 }, headOfState: 'François Mitterrand', headOfGovernment: 'Michel Rocard', rulingPartyId: 'fra_ps' },
  ],
  SUN: [
    { date: { year: 1953, month: 3 }, headOfState: 'Georgy Malenkov', headOfGovernment: 'Georgy Malenkov', rulingPartyId: 'cpsu' },
    { date: { year: 1953, month: 9 }, headOfState: 'Nikita Khrushchev', headOfGovernment: 'Georgy Malenkov', rulingPartyId: 'cpsu' },
    { date: { year: 1958, month: 3 }, headOfState: 'Nikita Khrushchev', headOfGovernment: 'Nikita Khrushchev', rulingPartyId: 'cpsu' },
    { date: { year: 1964, month: 10 }, headOfState: 'Anastas Mikoyan', headOfGovernment: 'Leonid Brezhnev', rulingPartyId: 'cpsu' },
    { date: { year: 1982, month: 11 }, headOfState: 'Yuri Andropov', headOfGovernment: 'Yuri Andropov', rulingPartyId: 'cpsu' },
    { date: { year: 1984, month: 2 }, headOfState: 'Konstantin Chernenko', headOfGovernment: 'Konstantin Chernenko', rulingPartyId: 'cpsu' },
    { date: { year: 1985, month: 3 }, headOfState: 'Mikhail Gorbachev', headOfGovernment: 'Mikhail Gorbachev', rulingPartyId: 'cpsu' },
  ],
};
