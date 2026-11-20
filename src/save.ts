import { openDB } from 'idb';
import type { World } from './engine/types';
import { serialize, deserialize } from './engine/sim';

const dbp = openDB('new-world-order', 1, { upgrade(db) { db.createObjectStore('saves', { keyPath: 'slot' }); } });
export interface SaveMeta { slot: string; name: string; savedAt: string; date: string; country: string; version: number }

export async function saveGame(slot: string, name: string, w: World) {
  const db = await dbp;
  await db.put('saves', { slot, name, savedAt: new Date().toISOString(), date: `${w.year}/${w.month}`, country: w.countries[w.playerId]?.nameFa ?? w.playerId, version: w.version, data: serialize(w) });
}
export async function loadGame(slot: string): Promise<World | null> {
  const db = await dbp; const row = await db.get('saves', slot);
  return row ? deserialize(row.data) : null;
}
export async function listSaves(): Promise<SaveMeta[]> {
  const db = await dbp; const rows = await db.getAll('saves');
  return rows.map(r => ({ slot: r.slot, name: r.name, savedAt: r.savedAt, date: r.date, country: r.country, version: r.version })).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
export async function deleteSave(slot: string) { const db = await dbp; await db.delete('saves', slot); }
export function exportSave(w: World) {
  const blob = new Blob([serialize(w)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `new-world-order-${w.year}-${w.month}.json`; a.click(); URL.revokeObjectURL(a.href);
}
export async function importSave(file: File): Promise<World> { return deserialize(await file.text()); }
