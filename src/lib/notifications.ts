import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import soundAsset from "@/assets/notification.mp3.asset.json";

export type NotifSettings = {
  onIncoming: boolean;
  onOutgoing: boolean;
  onBudget: boolean;
  soundEnabled: boolean;
};

export type Notif = {
  id: string;
  kind: "in" | "out" | "budget";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NotifState = {
  settings: NotifSettings;
  items: Notif[];
  loading: boolean;
};

const defaults: NotifSettings = {
  onIncoming: true,
  onOutgoing: true,
  onBudget: true,
  soundEnabled: true,
};

let state: NotifState = { settings: defaults, items: [], loading: true };
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(soundAsset.url);
    audio.volume = 0.7;
    void audio.play().catch(() => undefined);
  } catch {
    /* prehrávanie zvuku môže byť blokované prehliadačom */
  }
}

export async function loadNotifications() {
  const userId = await currentUserId();
  if (!userId) {
    state = { settings: defaults, items: [], loading: false };
    emit();
    return;
  }

  let { data: row } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!row) {
    const inserted = await supabase
      .from("notification_settings")
      .insert({ user_id: userId })
      .select("*")
      .maybeSingle();
    row = inserted.data;
  }

  const { data: items } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  state = {
    settings: {
      onIncoming: row?.on_incoming ?? true,
      onOutgoing: row?.on_outgoing ?? true,
      onBudget: row?.on_budget ?? true,
      soundEnabled: row?.sound_enabled ?? true,
    },
    items: (items ?? []).map((n) => ({
      id: n.id,
      kind: n.kind === "in" ? "in" : n.kind === "budget" ? "budget" : "out",
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.created_at,
    })),
    loading: false,
  };
  emit();
}

export function hydrateNotifications() {
  if (!loadPromise) {
    loadPromise = loadNotifications().catch((error: unknown) => {
      console.error(error);
      state = { settings: defaults, items: [], loading: false };
      emit();
    });
  }
  return loadPromise;
}

export function resetNotifications() {
  loadPromise = null;
  state = { settings: defaults, items: [], loading: true };
  emit();
}

export function useNotifications() {
  const [snap, setSnap] = useState<NotifState>(state);
  useEffect(() => {
    const l = () => setSnap(state);
    listeners.add(l);
    if (snap.loading) void hydrateNotifications();
    l();
    return () => {
      listeners.delete(l);
    };
  }, [snap.loading]);
  return snap;
}

export async function updateNotifSettings(patch: Partial<NotifSettings>) {
  const userId = await currentUserId();
  if (!userId) return;
  const next = { ...state.settings, ...patch };
  state.settings = next;
  emit();
  await supabase.from("notification_settings").upsert(
    {
      user_id: userId,
      on_incoming: next.onIncoming,
      on_outgoing: next.onOutgoing,
      on_budget: next.onBudget,
      sound_enabled: next.soundEnabled,
    },
    { onConflict: "user_id" },
  );
}

export async function notify(kind: Notif["kind"], title: string, body: string) {
  await hydrateNotifications();
  const s = state.settings;
  const enabled = kind === "in" ? s.onIncoming : kind === "out" ? s.onOutgoing : s.onBudget;
  if (!enabled) return;

  const userId = await currentUserId();
  if (!userId) return;

  if (kind === "budget") toast.warning(title, { description: body });
  else toast.success(title, { description: body });
  if (s.soundEnabled) playNotificationSound();

  const { data } = await supabase
    .from("notifications")
    .insert({ user_id: userId, kind, title, body })
    .select("id, created_at")
    .maybeSingle();

  state.items = [
    {
      id: data?.id ?? crypto.randomUUID(),
      kind,
      title,
      body,
      read: false,
      createdAt: data?.created_at ?? new Date().toISOString(),
    },
    ...state.items,
  ];
  emit();
}

export async function markAllRead() {
  const userId = await currentUserId();
  if (!userId) return;
  state.items = state.items.map((n) => ({ ...n, read: true }));
  emit();
  await supabase.from("notifications").update({ read: true }).eq("read", false);
}

export async function clearNotifications() {
  const userId = await currentUserId();
  if (!userId) return;
  state.items = [];
  emit();
  await supabase.from("notifications").delete().eq("user_id", userId);
}

export function unreadCount(s: NotifState) {
  return s.items.filter((n) => !n.read).length;
}
