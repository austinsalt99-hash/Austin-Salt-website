import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateContactSubmission } from "@/lib/validation";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const input = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    message: String(body.message ?? ""),
  };

  const result = validateContactSubmission(input);
  if (!result.valid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  });

  if (error) {
    return NextResponse.json(
      { errors: { message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }

  try {
    await sendContactEmail(input);
  } catch (emailError) {
    console.error("Failed to send contact notification email:", emailError);
  }

  return NextResponse.json({ success: true });
}
