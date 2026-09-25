"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth/auth-provider";

export const TAGS = ["Resume", "DSA Sheets", "Interview", "Applied", "Other"] as const;
export type Tag = (typeof TAGS)[number];
export const STATUSES = ["todo", "inprogress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  tag: Tag;
  status: Status;
  position: number;
  due_date: string | null;
  reference: string | null;
  notes: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export type TaskInput = Pick<Task, "title" | "tag" | "status" | "due_date" | "reference" | "notes">;

const COLUMNS = "id, title, tag, status, position, due_date, reference, notes, completed_at, archived_at, created_at";

function byPosition(a: Task, b: Task) {
  return a.position - b.position || a.created_at.localeCompare(b.created_at);
}

/**
 * The signed-in user's board, persisted to Supabase.
 *
 * Every change is applied to local state first so the board feels instant,
 * then written; if the write fails the change is rolled back and `onError`
 * explains why. Row-level security keeps each user to their own tasks.
 */
export function useTasks(onError: (message: string) => void) {
  const { user, loading: authLoading } = useAuth();
  const supabase = supabaseBrowser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const fail = useCallback(
    (error: { message?: string } | null | undefined, fallback: string) => {
      const msg = error?.message ?? "";
      onError(/limit reached/i.test(msg) ? msg : /JWT|auth/i.test(msg) ? "Your session expired. Please sign in again." : fallback);
    },
    [onError],
  );

  const load = useCallback(async () => {
    if (!user) return;
    const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const [board, done, profile] = await Promise.all([
      supabase.from("tasks").select(COLUMNS).is("archived_at", null).order("position"),
      // Completion history (archived included) drives the streak and weekly meter.
      supabase.from("tasks").select("completed_at").not("completed_at", "is", null).gte("completed_at", since),
      supabase.from("profiles").select("task_weekly_goal").eq("id", user.id).maybeSingle(),
    ]);
    if (board.error) {
      fail(board.error, "Couldn't load your board. Check your connection and refresh.");
    } else {
      setTasks((board.data as Task[]).sort(byPosition));
      setSyncedAt(new Date());
    }
    if (!done.error) setCompletedDays((done.data ?? []).map((r) => r.completed_at as string));
    if (profile.data?.task_weekly_goal) setWeeklyGoal(profile.data.task_weekly_goal as number);
    setLoaded(true);
  }, [user, supabase, fail]);

  /* eslint-disable react-hooks/set-state-in-effect -- loading remote data on sign-in */
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setTasks([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    load();
  }, [user, authLoading, load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Pick up changes made in another tab or device when the user comes back.
  useEffect(() => {
    if (!user) return;
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [user, load]);

  /** Applies a local change, runs the write, rolls back on failure. */
  const optimistic = useCallback(
    async (
      apply: (prev: Task[]) => Task[],
      write: () => PromiseLike<{ error: { message?: string } | null }>,
      failMessage: string,
    ) => {
      const before = tasksRef.current;
      setTasks((prev) => apply(prev).sort(byPosition));
      const { error } = await write();
      if (error) {
        setTasks(before);
        fail(error, failMessage);
        return false;
      }
      setSyncedAt(new Date());
      return true;
    },
    [fail],
  );

  const nextPosition = (status: Status) => {
    const col = tasksRef.current.filter((t) => t.status === status);
    return col.length ? Math.max(...col.map((t) => t.position)) + 1 : 1;
  };

  const create = useCallback(
    async (input: TaskInput) => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, position: nextPosition(input.status), user_id: user.id })
        .select(COLUMNS)
        .single();
      if (error || !data) {
        fail(error, "Couldn't save the task.");
        return false;
      }
      setTasks((prev) => [...prev, data as Task].sort(byPosition));
      if ((data as Task).completed_at) setCompletedDays((d) => [...d, (data as Task).completed_at!]);
      setSyncedAt(new Date());
      return true;
    },
    [user, supabase, fail],
  );

  /** Adds several tasks in one request (starter tasks). */
  const createMany = useCallback(
    async (inputs: TaskInput[]) => {
      if (!user) return false;
      const rows = inputs.map((input, i) => ({ ...input, position: nextPosition(input.status) + i, user_id: user.id }));
      const { data, error } = await supabase.from("tasks").insert(rows).select(COLUMNS);
      if (error || !data) {
        fail(error, "Couldn't add the tasks.");
        return false;
      }
      setTasks((prev) => [...prev, ...(data as Task[])].sort(byPosition));
      setSyncedAt(new Date());
      return true;
    },
    [user, supabase, fail],
  );

  const update = useCallback(
    async (id: string, patch: Partial<TaskInput>) => {
      const completing = patch.status === "done" && tasksRef.current.find((t) => t.id === id)?.status !== "done";
      const ok = await optimistic(
        (prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  completed_at: patch.status ? (patch.status === "done" ? t.completed_at ?? new Date().toISOString() : null) : t.completed_at,
                }
              : t,
          ),
        () => supabase.from("tasks").update(patch).eq("id", id),
        "Couldn't save your change.",
      );
      if (ok && completing) setCompletedDays((d) => [...d, new Date().toISOString()]);
      return ok;
    },
    [optimistic, supabase],
  );

  /**
   * Moves a task to `status`, placed just before `beforeId` (or at the end).
   * Positions are midpoints, so only the moved row is written.
   */
  const move = useCallback(
    async (id: string, status: Status, beforeId?: string | null) => {
      const current = tasksRef.current.find((t) => t.id === id);
      if (!current || id === beforeId) return false;
      const col = tasksRef.current.filter((t) => t.status === status && t.id !== id).sort(byPosition);
      let position: number;
      const idx = beforeId ? col.findIndex((t) => t.id === beforeId) : -1;
      if (idx === -1) position = col.length ? col[col.length - 1].position + 1 : 1;
      else if (idx === 0) position = col[0].position - 1;
      else position = (col[idx - 1].position + col[idx].position) / 2;
      if (current.status === status && current.position === position) return true;

      const completing = status === "done" && current.status !== "done";
      const ok = await optimistic(
        (prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, status, position, completed_at: status === "done" ? t.completed_at ?? new Date().toISOString() : null }
              : t,
          ),
        () => supabase.from("tasks").update({ status, position }).eq("id", id),
        "Couldn't move the task.",
      );
      if (ok && completing) setCompletedDays((d) => [...d, new Date().toISOString()]);
      return ok;
    },
    [optimistic, supabase],
  );

  /** Deletes a task; returns the removed row so the caller can offer Undo. */
  const remove = useCallback(
    async (id: string) => {
      const task = tasksRef.current.find((t) => t.id === id) ?? null;
      const ok = await optimistic(
        (prev) => prev.filter((t) => t.id !== id),
        () => supabase.from("tasks").delete().eq("id", id),
        "Couldn't delete the task.",
      );
      return ok ? task : null;
    },
    [optimistic, supabase],
  );

  /** Puts a deleted task back exactly as it was (same id, column and place). */
  const restore = useCallback(
    async (task: Task) => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          id: task.id,
          user_id: user.id,
          title: task.title,
          tag: task.tag,
          status: task.status,
          position: task.position,
          due_date: task.due_date,
          reference: task.reference,
          notes: task.notes,
          completed_at: task.completed_at,
          created_at: task.created_at,
        })
        .select(COLUMNS)
        .single();
      if (error || !data) {
        fail(error, "Couldn't restore the task.");
        return false;
      }
      if (!(data as Task).archived_at) setTasks((prev) => [...prev, data as Task].sort(byPosition));
      setSyncedAt(new Date());
      return true;
    },
    [user, supabase, fail],
  );

  /** Moves every Done task off the board into the archive. */
  const archiveDone = useCallback(async () => {
    const ids = tasksRef.current.filter((t) => t.status === "done").map((t) => t.id);
    if (!ids.length) return 0;
    const ok = await optimistic(
      (prev) => prev.filter((t) => !ids.includes(t.id)),
      () => supabase.from("tasks").update({ archived_at: new Date().toISOString() }).in("id", ids),
      "Couldn't archive the tasks.",
    );
    return ok ? ids.length : 0;
  }, [optimistic, supabase]);

  const loadArchive = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(COLUMNS)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false })
      .limit(300);
    if (error) {
      fail(error, "Couldn't load the archive.");
      return [];
    }
    return data as Task[];
  }, [supabase, fail]);

  /** Brings an archived task back to the bottom of its column. */
  const unarchive = useCallback(
    async (task: Task) => {
      const position = nextPosition(task.status);
      const { data, error } = await supabase
        .from("tasks")
        .update({ archived_at: null, position })
        .eq("id", task.id)
        .select(COLUMNS)
        .single();
      if (error || !data) {
        fail(error, "Couldn't restore the task.");
        return false;
      }
      setTasks((prev) => [...prev, data as Task].sort(byPosition));
      setSyncedAt(new Date());
      return true;
    },
    [supabase, fail],
  );

  const deleteArchived = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) fail(error, "Couldn't delete the task.");
      return !error;
    },
    [supabase, fail],
  );

  const saveWeeklyGoal = useCallback(
    async (goal: number) => {
      if (!user) return false;
      const clean = Math.min(200, Math.max(1, Math.round(goal)));
      const before = weeklyGoal;
      setWeeklyGoal(clean);
      const { error } = await supabase.from("profiles").update({ task_weekly_goal: clean }).eq("id", user.id);
      if (error) {
        setWeeklyGoal(before);
        fail(error, "Couldn't save your weekly goal.");
        return false;
      }
      return true;
    },
    [user, supabase, weeklyGoal, fail],
  );

  return {
    signedIn: !!user,
    loading: authLoading || !loaded,
    tasks,
    syncedAt,
    completedDays,
    weeklyGoal,
    create,
    createMany,
    update,
    move,
    remove,
    restore,
    archiveDone,
    loadArchive,
    unarchive,
    deleteArchived,
    saveWeeklyGoal,
    reload: load,
  };
}
