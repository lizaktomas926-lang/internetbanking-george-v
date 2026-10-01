import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import soundAsset from "@/assets/notification.mp3.asset.json";

export type NotifKind = "in" | "out" | "budget";

export type NotifSettings = {
  onIncoming: boolean;
  onOutgoing: boolean;
  onBudget: boolean;
  soundEnabled: boolean;
};

export type NotifItem = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type NotifState = {
  settings: NotifSettings;
  items: NotifItem[];
  loading: boolean;
};

const defaultSettings: NotifSettings = {
  onIncoming: true,
  onOutgoing: true,
  onBudget: true,
  soundEnabled: true,
};

const empty: NotifState = { settings: defaultSettings, items: [], loading: true };

let state: NotifState = empty;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function useNotifications(): NotifState {
  const [snap, setSnap] = useState<NotifState>(state);
  useEffect(() => {
    const l = () => setSnap({ ...state });
    listeners.add(l);
    if (state.loading) void hydrateNotifications();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snap;
}

export async function hydrateNotifications() {
  try {
    const userId = await currentUserId();
    if (!userId) {
      state = { ...empty, loading: false };
      emit();
      return;
    }

    const [settingsRes, itemsRes] = await Promise.all([
      supabase.from("notification_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    let settings = defaultSettings;
    if (settingsRes.data) {
      settings = {
        onIncoming: settingsRes.data.on_incoming,
        onOutgoing: settingsRes.data.on_outgoing,
        onBudget: settingsRes.data.on_budget,
        soundEnabled: settingsRes.data.sound_enabled,
      };
    } else {
      await supabase.from("notification_settings").insert({ user_id: userId });
    }

    const items: NotifItem[] = (itemsRes.data ?? []).map((n) => ({
      id: n.id,
      kind: (n.kind as NotifKind) ?? "in",
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.created_at,
    }));

    state = { settings, items, loading: false };
    emit();
  } catch (e) {
    console.error("hydrateNotifications failed", e);
    state = { ...state, loading: false };
    emit();
  }
}

export function resetNotifications() {
  state = empty;
  emit();
}

export async function updateNotifSettings(patch: Partial<NotifSettings>) {
  const next = { ...state.settings, ...patch };
  state = { ...state, settings: next };
  emit();

  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("notification_settings").upsert({
    user_id: userId,
    on_incoming: next.onIncoming,
    on_outgoing: next.onOutgoing,
    on_budget: next.onBudget,
    sound_enabled: next.soundEnabled,
  });
}

export function playNotificationSound() {
  try {
    const audio = new Audio(soundAsset.url);
    void audio.play().catch(() => undefined);
  } catch {
    // prehratie zlyhalo — ignorujeme
  }
}

export async function notify(kind: NotifKind, title: string, body: string) {
  const enabled =
    kind === "in" ? state.settings.onIncoming : kind === "out" ? state.settings.onOutgoing : state.settings.onBudget;
  if (!enabled) return;

  if (state.settings.soundEnabled) playNotificationSound();
  toast(title, { description: body });

  const userId = await currentUserId();
  if (!userId) return;
  const { data } = await supabase
    .from("notifications")
    .insert({ user_id: userId, kind, title, body })
    .select("id, created_at")
    .maybeSingle();

  state = {
    ...state,
    items: [
      {
        id: data?.id ?? crypto.randomUUID(),
        kind,
        title,
        body,
        read: false,
        createdAt: data?.created_at ?? new Date().toISOString(),
      },
      ...state.items,
    ].slice(0, 50),
  };
  emit();
}

export async function markAllRead() {
  state = { ...state, items: state.items.map((n) => ({ ...n, read: true })) };
  emit();
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export async function clearNotifications() {
  state = { ...state, items: [] };
  emit();
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("notifications").delete().eq("user_id", userId);
}

export function unreadCount(s: NotifState): number {
  return s.items.filter((n) => !n.read).length;
}
