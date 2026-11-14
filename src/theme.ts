export const C = { bg: '#1E0F0C', card: '#2A1612', red: '#7A2E1D', copper: '#C9773B', cream: '#F2E6D0', grey: '#A89683', line: 'rgba(201,119,59,0.35)' };
export const TRACKS = [
  { t: 'Nuit à Bamako', d: 222, n: 128 },
  { t: 'Matin doré', d: 250, n: 96 },
  { t: 'Route de Ségou', d: 178, n: 74 },
  { t: 'Fanga', d: 195, n: 51 },
  { t: 'Jam du soir', d: 320, n: 43 },
  { t: 'Dimanche', d: 242, n: 37 },
];
export const fmt = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
