// CONTACTO CON EMAILJS — AutoParts MX

document.addEventListener('DOMContentLoaded', () => {
  emailjs.init({
    publicKey: 'msmG_jXlTuL-Dtx5S'
  });

  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('contactName').value.trim();
    const correo = document.getElementById('contactEmail').value.trim();
    const mensaje = document.getElementById('contactMessage').value.trim();
    const submitButton = contactForm.querySelector('.contact-submit');

    if (!nombre || !correo || !mensaje) {
      contactStatus.textContent = 'Completa todos los campos antes de enviar.';
      contactStatus.className = 'contact-status error';
      return;
    }

    const templateParams = {
      nombre: nombre,
      correo: correo,
      mensaje: mensaje
    };

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      contactStatus.textContent = 'Enviando solicitud...';
      contactStatus.className = 'contact-status loading';

      await emailjs.send(
        'service_wv46kjq',
        'template_0rev40n',
        templateParams
      );

      contactStatus.textContent = 'Solicitud enviada correctamente. Te contactaremos pronto.';
      contactStatus.className = 'contact-status success';

      contactForm.reset();

    } catch (error) {
      console.error('Error EmailJS:', error);

      contactStatus.textContent = 'No se pudo enviar la solicitud. Intenta nuevamente.';
      contactStatus.className = 'contact-status error';

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar solicitud';
    }
  });
});