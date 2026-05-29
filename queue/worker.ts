import { emailQueue, orderQueue } from "./index";

emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;
  console.log(`[Email] Sending ${template} to ${to} - ${subject}`);
  // Integrate with Resend or nodemailer
  // await resend.emails.send({ from: "orders@luxe.com", to, subject, react: EmailTemplate(data) });
});

orderQueue.process(async (job) => {
  const { orderId, action } = job.data;
  console.log(`[Order] Processing ${action} for order ${orderId}`);
  // Update inventory, trigger emails, update analytics
});

console.log("[Queue Worker] Running...");
