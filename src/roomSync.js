import { createClient } from '@supabase/supabase-js';

/**
 * Cross-device “Live Now” requires a shared store. Set on Railway / Vite:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * SQL (Supabase → SQL editor):
 *
 * create table if not exists public.hiveclash_rooms (
 *   id text primary key,
 *   body jsonb not null,
 *   updated_at timestamptz not null default now()
 * );
 * alter table public.hiveclash_rooms enable row level security;
 * create policy "hiveclash_select" on public.hiveclash_rooms for select using (true);
 * create policy "hiveclash_insert" on public.hiveclash_rooms for insert with check (true);
 * create policy "hiveclash_update" on public.hiveclash_rooms for update using (true);
 * create policy "hiveclash_delete" on public.hiveclash_rooms for delete using (true);
 *
 * Optional (Realtime): Database → Replication → enable hiveclash_rooms, or:
 * alter publication supabase_realtime add table public.hiveclash_rooms;
 */

const TABLE = 'hiveclash_rooms';

const url = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
const key = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : '';

export const supabaseRooms = url && key ? createClient(url, key) : null;

export const isLiveRoomCloudSyncEnabled = () => !!supabaseRooms;

export function mergeRemoteLiveGames(prevGames, remoteLive) {
  if (!remoteLive?.length) return prevGames;
  const map = new Map(prevGames.map((g) => [g.id, { ...g }]));
  for (const g of remoteLive) {
    if (g?.id && g.status === 'live') map.set(g.id, { ...g });
  }
  return Array.from(map.values());
}

export async function upsertLiveRoom(game) {
  if (!supabaseRooms || game.status !== 'live') return;
  const { error } = await supabaseRooms.from(TABLE).upsert({
    id: game.id,
    body: game,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[HiveClash] room upsert', error);
}

export async function deleteLiveRoom(roomId) {
  if (!supabaseRooms || !roomId) return;
  const { error } = await supabaseRooms.from(TABLE).delete().eq('id', roomId);
  if (error) console.error('[HiveClash] room delete', error);
}

export async function fetchLiveRoomsFromCloud() {
  if (!supabaseRooms) return [];
  const { data, error } = await supabaseRooms.from(TABLE).select('body');
  if (error) {
    console.error('[HiveClash] room fetch', error);
    return [];
  }
  return (data || [])
    .map((row) => row.body)
    .filter((g) => g && g.status === 'live');
}

export function subscribeLiveRooms(onRemoteList) {
  if (!supabaseRooms) return () => {};
  const ch = supabaseRooms
    .channel('hiveclash_rooms_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
      fetchLiveRoomsFromCloud()
        .then(onRemoteList)
        .catch(() => {});
    })
    .subscribe();
  return () => {
    void supabaseRooms.removeChannel(ch);
  };
}
