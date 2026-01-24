// ===== VARIABLES GLOBALES =====
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const scrollTopBtn = document.getElementById('scrollTop');
const pages = document.querySelectorAll('.page');

// ===== NAVIGATION ENTRE PAGES =====
function navigateTo(pageId) {
  // Masquer toutes les pages
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Afficher la page sélectionnée
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Si c'est la page tarifs, afficher toutes les sections
    if (pageId === 'tarifs') {
      showAllTarifs();
    }
  }
  
  // Fermer le menu mobile
  navLinks.classList.remove('active');
  burger.classList.remove('active');
  
  // Scroll vers le haut
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // Mettre à jour l'URL sans recharger la page
  history.pushState({ page: pageId }, '', `#${pageId}`);
}

// ===== FONCTIONS POUR AFFICHER LES SECTIONS SPÉCIFIQUES =====
function showAllTarifs() {
  const tarifsVehicules = document.getElementById('tarifs-vehicules');
  const tarifsImmobilier = document.getElementById('tarifs-immobilier');
  
  if (tarifsVehicules) tarifsVehicules.style.display = 'block';
  if (tarifsImmobilier) tarifsImmobilier.style.display = 'block';
}

function goTarifsVehicules() {
  // Aller sur la page tarifs
  navigateTo('tarifs');
  
  // Masquer la section immobilier
  const tarifsImmobilier = document.getElementById('tarifs-immobilier');
  if (tarifsImmobilier) {
    tarifsImmobilier.style.display = 'none';
  }
  
  // Afficher seulement la section véhicules
  const tarifsVehicules = document.getElementById('tarifs-vehicules');
  if (tarifsVehicules) {
    tarifsVehicules.style.display = 'block';
    
    // Scroll vers la section avec un petit délai
    setTimeout(() => {
      tarifsVehicules.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function goTarifsImmobilier() {
  // Aller sur la page tarifs
  navigateTo('tarifs');
  
  // Masquer la section véhicules
  const tarifsVehicules = document.getElementById('tarifs-vehicules');
  if (tarifsVehicules) {
    tarifsVehicules.style.display = 'none';
  }
  
  // Afficher seulement la section immobilier
  const tarifsImmobilier = document.getElementById('tarifs-immobilier');
  if (tarifsImmobilier) {
    tarifsImmobilier.style.display = 'block';
    
    // Scroll vers la section avec un petit délai
    setTimeout(() => {
      tarifsImmobilier.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// ===== EXPORT DES FONCTIONS POUR LES RENDRE ACCESSIBLES GLOBALEMENT =====
window.navigateTo = navigateTo;
window.goTarifsVehicules = goTarifsVehicules;
window.goTarifsImmobilier = goTarifsImmobilier;

// ===== GESTION DU MENU BURGER =====
burger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  burger.classList.toggle('active');
});

// Fermer le menu en cliquant sur un lien
navLinks.querySelectorAll('a:not(.btn-nav)').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    burger.classList.remove('active');
  });
});

// Fermer le menu en cliquant en dehors
document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !burger.contains(e.target)) {
    navLinks.classList.remove('active');
    burger.classList.remove('active');
  }
});

// ===== NAVBAR AU SCROLL =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Ajouter classe scrolled
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  // Bouton retour en haut
  if (currentScroll > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
  
  lastScroll = currentScroll;
});

// ===== BOUTON RETOUR EN HAUT =====
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ===== GESTION DE L'HISTORIQUE DU NAVIGATEUR =====
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    navigateTo(e.state.page);
  } else {
    navigateTo('home');
  }
});

// ===== CHARGER LA PAGE AU DÉMARRAGE =====
window.addEventListener('DOMContentLoaded', () => {
  // Vérifier s'il y a un hash dans l'URL
  const hash = window.location.hash.substring(1);
  
  if (hash && document.getElementById(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }
  
  // Initialiser l'historique
  history.replaceState({ page: hash || 'home' }, '', window.location.href);
});

// ===== ANIMATIONS AU SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observer les éléments à animer
document.querySelectorAll('.card, .feature, .tarif-block').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== SMOOTH SCROLL POUR LES ANCRES =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Si c'est une ancre interne (pas une page)
    if (href.startsWith('#') && href.length > 1) {
      const targetId = href.substring(1);
      
      // Si c'est une page
      if (document.getElementById(targetId) && document.getElementById(targetId).classList.contains('page')) {
        e.preventDefault();
        navigateTo(targetId);
      }
    }
  });
});

// ===== VALIDATION DU FORMULAIRE =====
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    const inputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#dc3545';
        
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    });
    
    if (!isValid) {
      e.preventDefault();
      alert('Veuillez remplir tous les champs obligatoires');
    }
  });
  
  // Réinitialiser la couleur de bordure lors de la saisie
  contactForm.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';
    });
  });
}

// ===== EFFET PARALLAXE SUR LE HERO =====
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 768) { // Désactiver sur mobile
    const scrolled = window.pageYOffset;
    if (scrolled < window.innerHeight) { // Limiter l'effet
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  }
});

// ===== COMPTEUR D'ANIMATIONS =====
let hasAnimated = false;

window.addEventListener('scroll', () => {
  if (!hasAnimated) {
    const features = document.querySelectorAll('.feature');
    const firstFeature = features[0];
    
    if (firstFeature) {
      const rect = firstFeature.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight - 100) {
        hasAnimated = true;
        
        features.forEach((feature, index) => {
          setTimeout(() => {
            feature.style.animation = `slideInUp 0.6s ease forwards`;
          }, index * 100);
        });
      }
    }
  }
});

// ===== PRELOADER (optionnel) =====
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// ===== GESTION DES CLICS SUR LES CARTES =====
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    // Animation de clic
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 200);
  });
});

// ===== DÉTECTION DU MOBILE =====
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Désactiver certaines animations sur mobile pour de meilleures performances
  const heroShine = document.querySelector('.hero::before');
  if (heroShine) {
    heroShine.style.animation = 'none';
  }
}

// ===== LAZY LOADING DES IMAGES =====
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  // Fallback pour les navigateurs qui ne supportent pas loading="lazy"
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
  document.body.appendChild(script);
}

// ===== BOUTONS DE NAVIGATION RAPIDE DANS LA PAGE TARIFS =====
// Ajouter des boutons pour basculer entre les sections sur la page tarifs
function addTarifsSwitchButtons() {
  const tarifsPage = document.getElementById('tarifs');
  if (!tarifsPage) return;
  
  const section = tarifsPage.querySelector('.section');
  if (!section) return;
  
  // Vérifier si les boutons existent déjà
  if (section.querySelector('.tarifs-switch')) return;
  
  // Créer le conteneur des boutons
  const switchContainer = document.createElement('div');
  switchContainer.className = 'tarifs-switch';
  switchContainer.innerHTML = `
    <button class="switch-btn active" onclick="showAllTarifsSections()">Tous les tarifs</button>
    <button class="switch-btn" onclick="showOnlyVehicules()">🚗 Véhicules</button>
    <button class="switch-btn" onclick="showOnlyImmobilier()">🏠 Immobilier</button>
  `;
  
  // Insérer avant le premier tarif-category
  const firstCategory = section.querySelector('.tarif-category');
  if (firstCategory) {
    section.insertBefore(switchContainer, firstCategory);
  }
}

function showAllTarifsSections() {
  showAllTarifs();
  updateSwitchButtons(0);
}

function showOnlyVehicules() {
  const tarifsVehicules = document.getElementById('tarifs-vehicules');
  const tarifsImmobilier = document.getElementById('tarifs-immobilier');
  
  if (tarifsVehicules) tarifsVehicules.style.display = 'block';
  if (tarifsImmobilier) tarifsImmobilier.style.display = 'none';
  
  updateSwitchButtons(1);
  
  setTimeout(() => {
    tarifsVehicules.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function showOnlyImmobilier() {
  const tarifsVehicules = document.getElementById('tarifs-vehicules');
  const tarifsImmobilier = document.getElementById('tarifs-immobilier');
  
  if (tarifsVehicules) tarifsVehicules.style.display = 'none';
  if (tarifsImmobilier) tarifsImmobilier.style.display = 'block';
  
  updateSwitchButtons(2);
  
  setTimeout(() => {
    tarifsImmobilier.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function updateSwitchButtons(activeIndex) {
  const buttons = document.querySelectorAll('.switch-btn');
  buttons.forEach((btn, index) => {
    if (index === activeIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Export des nouvelles fonctions
window.showAllTarifsSections = showAllTarifsSections;
window.showOnlyVehicules = showOnlyVehicules;
window.showOnlyImmobilier = showOnlyImmobilier;

// Ajouter les boutons au chargement
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(addTarifsSwitchButtons, 500);
});

// ===== ANALYTICS (optionnel - décommenter si besoin) =====
/*
function trackPageView(page) {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: '/' + page
    });
  }
}
*/

// ===== CONSOLE LOG POUR DEBUG =====
console.log('✅ Script Provençale Propreté 84 chargé avec succès');
console.log('📱 Mobile:', isMobile);
console.log('🌐 Page actuelle:', window.location.hash || 'home');