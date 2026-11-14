import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export function Icone({ k, on }: { k: string; on: boolean }) {
  const p = { stroke: on ? '#4D8DFF' : '#8899BB', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {k === 'sons' && <><Path d="M9 18V5l11-2v13" {...p} /><Circle cx="6" cy="18" r="3" {...p} /><Circle cx="17" cy="16" r="3" {...p} /></>}
      {k === 'salles' && <><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...p} /><Circle cx="9" cy="7" r="4" {...p} /><Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...p} /></>}
      {k === 'classement' && <><Circle cx="12" cy="8" r="7" {...p} /><Path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" {...p} /></>}
      {k === 'profil' && <><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...p} /><Circle cx="12" cy="7" r="4" {...p} /></>}
    </Svg>
  );
}
