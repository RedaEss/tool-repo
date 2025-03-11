document.addEventListener('DOMContentLoaded', () => {
  const mainImage = document.getElementById('mainImage');
  const mainLogo = document.getElementById('mainLogo');
  const defaultState = {
    image: 'images/default.jpg',
    logo: 'images/logo-default.png'
  };
  let activeProject = null;
  
  // Animation de chargement : séquence d'images sur 3 secondes
  setTimeout(() => {
    mainImage.src = 'images/bg1.jpg';
  }, 0);
  setTimeout(() => {
    mainImage.src = 'images/bg2.jpg';
  }, 1000);
  setTimeout(() => {
    mainImage.src = 'images/bg3.jpg';
  }, 2000);
  setTimeout(() => {
    mainImage.src = defaultState.image;
    mainImage.classList.add("default-img");
    mainImage.classList.remove("shift-left");
    
    // Faire apparaître le texte et le logo du control-panel
    document.querySelectorAll('.control-text, .logo').forEach(el => {
      el.classList.remove('invisible');
    });
  }, 3000);
  
  // Écouteurs d'événements pour les textes des projets
  document.querySelectorAll('.control-text').forEach((text, index) => {
    const projectImage = `images/image${index + 2}.jpg`;
    
    // Effet de survol (hover)
    text.addEventListener('mouseenter', () => {
      if (!activeProject) {
        mainImage.src = projectImage;
        mainImage.classList.add("shift-left");
        mainImage.classList.remove("default-img");
      }
    });
    
    text.addEventListener('mouseleave', () => {
      if (!activeProject) {
        mainImage.src = defaultState.image;
        mainImage.classList.add("default-img");
        mainImage.classList.remove("shift-left");
      }
    });
    
    // Effet au clic : afficher l'image projet et changer le logo
    text.addEventListener('click', () => {
      activeProject = projectImage;
      mainImage.src = projectImage;
      mainImage.classList.add("shift-left");
      mainImage.classList.remove("default-img");
      mainLogo.src = 'images/logo-active.png';
    });
  });
  
  // Au clic sur le logo, revenir à l'état par défaut
  mainLogo.addEventListener('click', () => {
    if (mainLogo.src.includes('logo-active.png')) {
      activeProject = null;
      mainImage.src = defaultState.image;
      mainImage.classList.add("default-img");
      mainImage.classList.remove("shift-left");
      mainLogo.src = defaultState.logo;
    }
  });
});
