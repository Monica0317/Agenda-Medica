import emailjs from "emailjs-com";

export const sendReminderEmail = async (toEmail, toName, message) => {
  try {
    const serviceID = "service_u3s47ct"; // tu service ID
    const templateID = "template_edl8r4q"; // tu template ID en EmailJS
    const publicKey = "8ROXRj7OtEuZajGej"; // reemplázalo por tu clave pública de EmailJS

    const templateParams = {
      to_name: toName,
      message: message,
      reply_to: toEmail,
    };

    await emailjs.send(serviceID, templateID, templateParams, publicKey);

    console.log("✅ Recordatorio enviado correctamente a:", toEmail);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar recordatorio:", error);
    return false;
  }
};
