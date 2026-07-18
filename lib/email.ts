import { Resend } from "resend";
import type { ContactInput } from "./validation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(input: ContactInput) {
  await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL!,
    replyTo: input.email,
    subject: `New message from ${input.name}`,
    text: input.message,
  });
}
