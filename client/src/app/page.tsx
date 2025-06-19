"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import clsx from "clsx";

const greetings = [
  "Hello",
  "Hi",
  "Hey",
  "Howdy",
  "Greetings",
  "Welcome",
  "Good day",
  "Good morning",
  "Good afternoon",
  "Good evening",
  "Salutations",
  "What's up",
  "Yo",
  "Ahoy",
  "Bonjour",
  "Hola",
  "Ciao",
  "Olá",
  "Hallo",
  "Hej",
  "Salut",
  "Shalom",
  "Konnichiwa",
  "Annyeong",
  "Namaste",
  "Sawubona",
  "Merhaba",
  "Privet",
  "G'day",
  "Aloha",
];

const uid = () => crypto.randomUUID();

const debounce = (fn: (...a: any[]) => void, ms = 400) => {
  let h: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
};

interface Task {
  id: string;
  label: string;
  done: boolean;
}

export default function Page() {
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ------------------ LIFECYCLE ------------------ //
  useEffect(() => {
    const now = new Date();
    setGreeting(`👋 ${greetings[Math.floor(Math.random() * greetings.length)]}, Danny`);
    setDateStr(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  // Load tasks from localStorage – or seed defaults (at least 1)
  useEffect(() => {
    const raw = localStorage.getItem("daily-planner-tasks");
    if (raw) {
      const parsed: Task[] = JSON.parse(raw);
      setTasks(parsed.length ? parsed : [{ id: uid(), label: "Task 1", done: false }]);
    } else {
      setTasks([{ id: uid(), label: "Task 1", done: false }]);
    }
  }, []);

  // Persist tasks (debounced)
  const debouncedSave = useRef(
    debounce((next: Task[]) => {
      localStorage.setItem("daily-planner-tasks", JSON.stringify(next));
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSave(tasks);
  }, [tasks, debouncedSave]);

  // ------------------ HELPERS ------------------ //
  const toggle = (id: string, done: boolean) =>
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, done } : task)));

  const addTask = () => {
    if (!newLabel.trim()) return;
    setTasks((t) => [...t, { id: uid(), label: newLabel.trim(), done: false }]);
    setNewLabel("");
    inputRef.current?.focus();
  };

  const deleteTask = (id: string) =>
    setTasks((t) => (t.length > 1 ? t.filter((task) => task.id !== id) : t));

  const clearCompleted = () =>
    setTasks((t) => {
      const remaining = t.filter((task) => !task.done);
      return remaining.length ? remaining : t; // keep list non‑empty
    });

  const startEdit = (id: string) => setEditingId(id);
  const saveEdit = (id: string, label: string) => {
    setTasks((t) =>
      t.map((task) => (task.id === id ? { ...task, label: label.trim() || task.label } : task))
    );
    setEditingId(null);
  };

  // ------------------ METRICS ------------------ //
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  if (!greeting) return null;

  // ------------------ UI ------------------ //
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10">
      <Card className="w-full max-w-full sm:max-w-lg bg-zinc-900 text-neutral-200 shadow-xl/30 rounded-2xl px-6 py-6">
        {/* --------- HEADER --------- */}
        <CardHeader className="pb-4 space-y-2 px-6 pt-8 sm:pt-10">
          <CardTitle className="text-primary-200 tracking-wide text-lg sm:text-xl">
            {dateStr}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {greeting}
          </CardDescription>
        </CardHeader>

        {/* --------- PROGRESS --------- */}
        <div className="px-6 pb-6">
          <Progress value={pct} className="h-3 rounded bg-zinc-800">
            <div
              style={{ width: `${pct}%` }}
              className="h-full rounded bg-gradient-to-r from-blue-700 to-blue-800 transition-all"
            />
          </Progress>
          <p className="pt-3 text-xs text-right text-muted-foreground">
            {completed}/{total} done
          </p>
        </div>

        {/* --------- TASK LIST --------- */}
        <CardContent className="space-y-4 pb-6 px-6">
          {tasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-3" role="listitem">
              <Checkbox
                id={task.id}
                checked={task.done}
                onCheckedChange={(val) => toggle(task.id, !!val)}
                className="border-white cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:border-white"
                aria-label={task.label}
              />
              {editingId === task.id ? (
                <Input
                  defaultValue={task.label}
                  onBlur={(e) => saveEdit(task.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 w-full bg-transparent border-b border-zinc-600 px-1 text-sm focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <label
                  htmlFor={task.id}
                  onDoubleClick={() => startEdit(task.id)}
                  className={clsx(
                    "flex-1 text-sm select-none cursor-pointer",
                    task.done && "line-through opacity-50"
                  )}
                >
                  {task.label}
                </label>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground text-xs"
                aria-label="Delete task"
              >
                ✕
              </button>
            </div>
          ))}
        </CardContent>

        {/* --------- FOOTER --------- */}
        <CardFooter className="flex flex-col gap-5 px-6 pb-4">
          {/* Add Task */}
          <div className="flex w-full gap-3 items-center">
            <Input
              ref={inputRef}
              placeholder="Add a task…"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? addTask() : null)}
              className="bg-zinc-800 border-zinc-700 h-10 text-sm flex-1"
            />
            <Button
              onClick={addTask}
              disabled={!newLabel.trim()}
              className="cursor-pointer h-10 px-5"
            >
              Add
            </Button>
          </div>

          {/* Clear Completed */}
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground pt-2">
            <span>{pct === 100 ? "🎉 All done!" : ""}</span>
            <button
              onClick={clearCompleted}
              disabled={completed === 0}
              className="cursor-pointer hover:underline"
            >
              Clear completed
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
