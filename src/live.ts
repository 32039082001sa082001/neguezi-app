import { URL, KEY } from './ecoutes';
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
export async function appel(body: any): Promise<any> {
  try {
    const r = await fetch(URL + '/functions/v1/salles', { method: 'POST', headers: H, body: JSON.stringify(body) });
    return await r.json();
  } catch (e) { return { erreur: 'Pas de connexion' }; }
}
export const lister = () => appel({ action: 'lister' });
export const creer = (nom: string, pseudo: string) => appel({ action: 'creer', nom, pseudo });
export const entrer = (pseudo: string, code?: string, id?: string) => appel({ action: 'entrer', pseudo, code, id });
