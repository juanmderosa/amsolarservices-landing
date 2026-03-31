import { contactSchema } from "@schemas/contact";

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll("[data-error]").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
    const successEl = document.getElementById("formSuccess");
    const errorEl = document.getElementById("formError");
    successEl?.classList.add("hidden");
    errorEl?.classList.add("hidden");

    const nameEl = document.getElementById("name");
    const companyEl = document.getElementById("company");
    const emailEl = document.getElementById("email");
    const messageEl = document.getElementById("message");

    // Validate with Zod
    const result = contactSchema.safeParse({
      name: nameEl.value,
      company: companyEl.value,
      email: emailEl.value,
      message: messageEl.value,
    });

    if (!result.success) {
      // Show field-level errors
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];
        const errorSpan = document.querySelector(`[data-error="${fieldName}"]`);
        if (errorSpan) {
          errorSpan.textContent = issue.message;
          errorSpan.classList.remove("hidden");
        }
      }
      return;
    }

    // Submit via fetch
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Sending…";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const json = await res.json();

      if (res.ok) {
        successEl?.classList.remove("hidden");
        form.reset();
      } else {
        // Show server-side field errors if present
        if (json.fieldErrors) {
          for (const [field, messages] of Object.entries(json.fieldErrors)) {
            const errorSpan = document.querySelector(
              `[data-error="${field}"]`
            );
            if (errorSpan) {
              errorSpan.textContent = messages.join(" ");
              errorSpan.classList.remove("hidden");
            }
          }
        } else if (json.errors) {
          if (errorEl) {
            errorEl.textContent = `❌ ${json.errors.join(" ")}`;
            errorEl.classList.remove("hidden");
          }
        } else {
          errorEl?.classList.remove("hidden");
          if (errorEl) errorEl.textContent = "❌ Something went wrong. Please try again.";
        }
      }
    } catch {
      if (errorEl) {
        errorEl.textContent = "❌ Network error. Please try again.";
        errorEl.classList.remove("hidden");
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "Start a Conversation";
    }
  });
}
