// ===== SYSTÈME DE RÉSERVATION COMPLET =====
// Configuration EmailJS - À REMPLACER PAR VOS IDENTIFIANTS
const EMAILJS_CONFIG = {
  serviceID: 'service_zdkaqye',              // Ex: 'service_abc123'
  templateID_confirmation: 'template_gl6vu8b',  // Template pour confirmation
  templateID_cancellation: 'template_7fvgnwx',    // Template pour annulation
  publicKey: '62AbIy0Ct3RDZWiCX'               // Ex: 'user_DEF456GHI'
};

// Configuration Formspree pour l'entreprise
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgggeoa'; // Votre endpoint existant

// Données de réservation
let bookingData = {
  service: null,
  serviceName: null,
  price: null,
  date: null,
  time: null,
  customerInfo: {}
};

// Créneaux réservés (stockage local - en production, utiliser une vraie base de données)
let bookedSlots = JSON.parse(localStorage.getItem('bookedSlots') || '[]');

// Générer un numéro de réservation unique
function generateBookingNumber() {
  return 'PP84-' + Date.now().toString(36).toUpperCase();
}

// ===== CHARGER EMAILJS =====
function loadEmailJS() {
  if (typeof emailjs === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      console.log('✅ EmailJS chargé');
    };
    document.head.appendChild(script);
  }
}

// Charger EmailJS au démarrage
loadEmailJS();

// ===== ÉTAPE 1: SÉLECTION DU SERVICE =====
function selectService(serviceId, serviceName, price) {
  bookingData.service = serviceId;
  bookingData.serviceName = serviceName;
  bookingData.price = price;
  
  document.getElementById('selected-service-name').textContent = serviceName;
  document.getElementById('selected-service-price').textContent = price > 0 ? price + '€' : 'Sur devis';
  
  goToStep('calendar');
  setTimeout(generateCalendar, 100);
}

// Ouvrir directement une réservation depuis les tarifs
function openReservation(serviceId) {
  const services = {
    'confort': { name: 'Nettoyage Confort', price: 65 },
    'premium': { name: 'Nettoyage Intérieur Premium', price: 75 },
    'complet': { name: 'Nettoyage Véhicule Complet', price: 95 },
    'moquette': { name: 'Nettoyage Moquette & Tapis', price: 4 },
    'pro-auto': { name: 'Nettoyage Véhicule Pro', price: 20 },
    'vitres': { name: 'Entretien de Vitres', price: 35 },
    'airbnb': { name: 'Nettoyage Airbnb/Location', price: 35 },
    'bureaux': { name: 'Nettoyage Bureaux & Locaux', price: 35 },
    'menage': { name: 'Ménage Régulier', price: 35 },
    'approfondi': { name: 'Nettoyage Approfondi', price: 0 }
  };
  
  const service = services[serviceId];
  if (service) {
    navigateTo('reservation');
    setTimeout(() => {
      selectService(serviceId, service.name, service.price);
    }, 500);
  }
}

// ===== ÉTAPE 2: CALENDRIER =====
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateCalendar() {
  const calendarEl = document.getElementById('calendar');
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  let html = `
    <div class="calendar-header">
      <h3>${monthNames[currentMonth]} ${currentYear}</h3>
      <div class="calendar-nav">
        <button onclick="previousMonth()">←</button>
        <button onclick="nextMonth()">→</button>
      </div>
    </div>
    <div class="calendar-grid">
  `;
  
  // En-têtes des jours
  dayNames.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Jours du mois précédent
  const firstDayOfWeek = firstDay.getDay();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month disabled">${prevMonthLastDay - i}</div>`;
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDate(date);
    const isPast = date < today;
    const isWeekend = date.getDay() === 0; // Dimanche fermé
    
    let classes = 'calendar-day';
    if (isPast) classes += ' past';
    if (isWeekend) classes += ' disabled';
    if (bookingData.date === dateStr) classes += ' selected';
    
    const onclick = (!isPast && !isWeekend) ? `onclick="selectDate('${dateStr}')"` : '';
    html += `<div class="${classes}" ${onclick}>${day}</div>`;
  }
  
  // Jours du mois suivant
  const remainingDays = 42 - (firstDayOfWeek + lastDay.getDate());
  for (let day = 1; day <= remainingDays; day++) {
    html += `<div class="calendar-day other-month disabled">${day}</div>`;
  }
  
  html += '</div>';
  calendarEl.innerHTML = html;
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
}

function selectDate(dateStr) {
  bookingData.date = dateStr;
  document.getElementById('selected-date').textContent = formatDateFr(dateStr);
  generateCalendar();
  goToStep('time');
  setTimeout(generateTimeSlots, 100);
}

// ===== ÉTAPE 3: CRÉNEAUX HORAIRES =====
function generateTimeSlots() {
  const timeSlotsEl = document.getElementById('time-slots');
  const hours = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
  ];
  
  let html = '';
  
  hours.forEach(time => {
    const slotKey = `${bookingData.date}_${time}`;
    const isBooked = bookedSlots.includes(slotKey);
    const classes = isBooked ? 'time-slot disabled' : 'time-slot';
    const onclick = !isBooked ? `onclick="selectTime('${time}')"` : '';
    
    html += `<div class="${classes}" ${onclick}>
      ${time}
      ${isBooked ? '<br><small>(Réservé)</small>' : ''}
    </div>`;
  });
  
  timeSlotsEl.innerHTML = html;
}

function selectTime(time) {
  bookingData.time = time;
  
  // Mettre à jour le récapitulatif
  document.getElementById('summary-service').textContent = bookingData.serviceName;
  document.getElementById('summary-date').textContent = formatDateFr(bookingData.date);
  document.getElementById('summary-time').textContent = time;
  document.getElementById('summary-price').textContent = bookingData.price > 0 ? bookingData.price + '€' : 'Sur devis';
  
  goToStep('info');
}

// ===== ÉTAPE 4: INFORMATIONS CLIENT =====
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Désactiver le bouton de soumission
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
      
      try {
        const formData = new FormData(bookingForm);
        bookingData.customerInfo = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          notes: formData.get('notes') || ''
        };
        
        // Générer numéro de réservation
        const bookingNumber = generateBookingNumber();
        
        // Enregistrer le créneau comme réservé
        const slotKey = `${bookingData.date}_${bookingData.time}`;
        bookedSlots.push(slotKey);
        localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
        
        // Enregistrer la réservation complète
        const booking = {
          number: bookingNumber,
          ...bookingData,
          createdAt: new Date().toISOString()
        };
        
        let allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
        allBookings.push(booking);
        localStorage.setItem('allBookings', JSON.stringify(allBookings));
        
        // Envoyer les emails
        await Promise.all([
          sendEmailToCustomer(booking),      // EmailJS pour le client
          sendEmailToCompany(booking)        // Formspree pour l'entreprise
        ]);
        
        // Afficher la confirmation
        document.getElementById('booking-number').textContent = bookingNumber;
        document.getElementById('confirm-service').textContent = bookingData.serviceName;
        document.getElementById('confirm-date').textContent = formatDateFr(bookingData.date);
        document.getElementById('confirm-time').textContent = bookingData.time;
        
        goToStep('confirmation');
        
      } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement au 07 48 14 80 90.');
        
        // Libérer le créneau en cas d'erreur
        const slotKey = `${bookingData.date}_${bookingData.time}`;
        bookedSlots = bookedSlots.filter(slot => slot !== slotKey);
        localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});

// ===== ENVOI EMAIL AU CLIENT (EmailJS) =====
async function sendEmailToCustomer(booking) {
  try {
    // Attendre que EmailJS soit chargé
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS non chargé, email client non envoyé');
      return;
    }

    const templateParams = {
      to_email: booking.customerInfo.email,
      to_name: booking.customerInfo.name,
      booking_number: booking.number,
      service_name: booking.serviceName,
      booking_date: formatDateFr(booking.date),
      booking_time: booking.time,
      booking_price: booking.price > 0 ? booking.price + '€' : 'Sur devis',
      customer_address: booking.customerInfo.address,
      customer_phone: booking.customerInfo.phone,
      customer_notes: booking.customerInfo.notes || 'Aucune',
      cancellation_link: `https://provencaleproprete84.fr/annulation?ref=${booking.number}`,
      company_phone: '07 48 14 80 90'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceID,
      EMAILJS_CONFIG.templateID_confirmation,  // Utiliser le template de confirmation
      templateParams
    );

    console.log('✅ Email client envoyé via EmailJS:', response.status);
    return response;
    
  } catch (error) {
    console.error('❌ Erreur EmailJS:', error);
    throw error;
  }
}

// ===== ENVOI EMAIL À L'ENTREPRISE (Formspree) =====
async function sendEmailToCompany(booking) {
  try {
    const emailBody = `
📋 NOUVELLE RÉSERVATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Numéro: ${booking.number}
Date de création: ${new Date(booking.createdAt).toLocaleString('fr-FR')}

PRESTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: ${booking.serviceName}
Date d'intervention: ${formatDateFr(booking.date)}
Heure: ${booking.time}
Prix: ${booking.price > 0 ? booking.price + '€' : 'Sur devis'}

INFORMATIONS CLIENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom: ${booking.customerInfo.name}
Email: ${booking.customerInfo.email}
Téléphone: ${booking.customerInfo.phone}
Adresse: ${booking.customerInfo.address}

${booking.customerInfo.notes ? `Notes:\n${booking.customerInfo.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Lien d'annulation client:
https://provencaleproprete84.fr/annulation?ref=${booking.number}
    `;

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        subject: `Nouvelle réservation - ${booking.number}`,
        message: emailBody,
        _replyto: booking.customerInfo.email,
        booking_number: booking.number,
        customer_name: booking.customerInfo.name,
        customer_email: booking.customerInfo.email,
        customer_phone: booking.customerInfo.phone,
        service: booking.serviceName,
        date: formatDateFr(booking.date),
        time: booking.time,
        price: booking.price > 0 ? booking.price + '€' : 'Sur devis'
      })
    });

    if (!response.ok) {
      throw new Error('Erreur Formspree: ' + response.status);
    }

    console.log('✅ Email entreprise envoyé via Formspree');
    return response;
    
  } catch (error) {
    console.error('❌ Erreur Formspree:', error);
    throw error;
  }
}

// ===== ANNULATION DE RÉSERVATION =====
function cancelBooking(bookingNumber) {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
    return;
  }
  
  let allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
  const booking = allBookings.find(b => b.number === bookingNumber);
  
  if (booking) {
    // Libérer le créneau
    const slotKey = `${booking.date}_${booking.time}`;
    bookedSlots = bookedSlots.filter(slot => slot !== slotKey);
    localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
    
    // Supprimer la réservation
    allBookings = allBookings.filter(b => b.number !== bookingNumber);
    localStorage.setItem('allBookings', JSON.stringify(allBookings));
    
    // Envoyer emails d'annulation
    sendCancellationEmails(booking);
    
    alert('Votre réservation a bien été annulée. Un email de confirmation vous a été envoyé.');
  } else {
    alert('Réservation introuvable.');
  }
}

// ===== ENVOI EMAILS D'ANNULATION =====
async function sendCancellationEmails(booking) {
  // Email au client via EmailJS
  try {
    if (typeof emailjs !== 'undefined') {
      const templateParams = {
        to_email: booking.customerInfo.email,
        to_name: booking.customerInfo.name,
        booking_number: booking.number,
        service_name: booking.serviceName,
        booking_date: formatDateFr(booking.date),
        booking_time: booking.time,
        company_phone: '07 48 14 80 90'
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID_cancellation,  // Utiliser le template d'annulation
        templateParams
      );
      console.log('✅ Email annulation client envoyé');
    }
  } catch (error) {
    console.error('❌ Erreur envoi email annulation client:', error);
  }

  // Email à l'entreprise via Formspree
  try {
    const emailBody = `
❌ ANNULATION DE RÉSERVATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Numéro: ${booking.number}
Date d'annulation: ${new Date().toLocaleString('fr-FR')}

DÉTAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: ${booking.serviceName}
Date prévue: ${formatDateFr(booking.date)}
Heure: ${booking.time}

CLIENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom: ${booking.customerInfo.name}
Email: ${booking.customerInfo.email}
Téléphone: ${booking.customerInfo.phone}
    `;

    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: `Annulation réservation - ${booking.number}`,
        message: emailBody,
        _replyto: booking.customerInfo.email
      })
    });
    console.log('✅ Email annulation entreprise envoyé');
  } catch (error) {
    console.error('❌ Erreur envoi email annulation entreprise:', error);
  }
}

// ===== VÉRIFIER ANNULATION DEPUIS URL =====
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingRef = urlParams.get('ref');
  
  if (bookingRef && window.location.pathname.includes('annulation')) {
    setTimeout(() => {
      cancelBooking(bookingRef);
    }, 500);
  }
});

// ===== NAVIGATION ENTRE ÉTAPES =====
function goToStep(stepName) {
  document.querySelectorAll('.reservation-step').forEach(step => {
    step.classList.remove('active');
  });
  
  const targetStep = document.getElementById(`step-${stepName}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ===== FONCTIONS UTILITAIRES =====
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateFr(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
}

// Export des fonctions
window.selectService = selectService;
window.openReservation = openReservation;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.selectDate = selectDate;
window.selectTime = selectTime;
window.goToStep = goToStep;
window.cancelBooking = cancelBooking;

console.log('✅ Système de réservation chargé');
console.log('📅 Créneaux réservés:', bookedSlots.length);
console.log('📧 EmailJS:', typeof emailjs !== 'undefined' ? 'Chargé' : 'En attente...');