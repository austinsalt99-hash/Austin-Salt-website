import { createClient } from "@/lib/supabase/client";

export type PositionedRecord = { id: string; position: number };

export function computePositions(orderedIds: string[]): PositionedRecord[] {
  return orderedIds.map((id, index) => ({ id, position: index }));
}

export async function listOrdered<T>(table: string): Promise<T[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select("*").order("position", { ascending: true });
  if (error) throw error;
  return data as T[];
}

export async function createRecord<T extends Record<string, unknown>>(
  table: string,
  values: T
): Promise<T & { id: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateRecord<T extends Record<string, unknown>>(
  table: string,
  id: string,
  values: Partial<T>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(table).update(values as never).eq("id", id);
  if (error) throw error;
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function reorder(table: string, orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  const updates = computePositions(orderedIds);
  await Promise.all(
    updates.map(({ id, position }) => supabase.from(table).update({ position }).eq("id", id))
  );
}
