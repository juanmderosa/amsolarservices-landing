import type { APIRoute } from "astro";
import { contactSchema } from "../../schemas/contact";
import z from "zod";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Server-side validation with Zod
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      // Flatten errors into field-level messages
      const fieldErrors = z.treeifyError(result.error);
      console.log(fieldErrors);
      return new Response(JSON.stringify({ success: false, fieldErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, company, email, message } = result.data;

    // TODO: Integrate with an email provider (e.g. Resend, Sendgrid, Nodemailer)
    console.log("📧 New contact form submission:", {
      name,
      company,
      email,
      message,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message received. We will be in touch soon.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        errors: ["Server error. Please try again later."],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
