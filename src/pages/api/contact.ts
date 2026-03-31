import type { APIRoute } from "astro";
import { contactSchema } from "@schemas/contact";
import MailingService from "@services/email.services";
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

    // Send email using Nodemailer
    const emailSubject = `New Contact Form Submission from ${name}`;
    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #1F3A6D;">New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin-top: 20px; border: 0; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">Sent via AM Solar Services Landing Page</p>
      </div>
    `;

    const mailingResult = await MailingService.sendMail({
      to: import.meta.env.MAILING_TO || import.meta.env.MAILING_USER,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!mailingResult.success) {
      throw new Error("Failed to send email");
    }

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
