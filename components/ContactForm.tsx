"use client";

import { useState } from "react";

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data.errors ?? {});
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-brown-900">Thanks — I'll get back to you soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        placeholder="Name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.name && <p className="text-sm text-error">{errors.name}</p>}

      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.email && <p className="text-sm text-error">{errors.email}</p>}

      <textarea
        placeholder="Message"
        rows={5}
        value={values.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
        className="rounded-lg border border-beige bg-cream px-4 py-2"
      />
      {errors.message && <p className="text-sm text-error">{errors.message}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-5 py-2 font-medium text-cream disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
