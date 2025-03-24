document.addEventListener('DOMContentLoaded', () => {
  const mainImage = document.getElementById('mainImage');
  const mainLogo = document.getElementById('mainLogo');
  const defaultState = {
    image: 'images/default.jpg',
    alt: "Accueil - Présentation des projets tool.monde",
    logoActive: 'images/logo-active.png',
    logoDefault: 'images/logo-default.png'
  };
  let activeProject = null;

  // Initialisation
  mainImage.src = '';
  mainImage.alt = defaultState.alt;
  mainLogo.src = defaultState.logoActive;
  mainLogo.alt = "Afficher le projet spécial - Image5";
  mainLogo.style.cursor = 'pointer';

  // Configuration des images
  const imageConfig = {
    projets: [
      { src: 'images/image2.jpg', alt: "Section Réfléchir : En allant à la racine des problèmes pour réfléchir ensemble aux enjeux de notre époque et aux alternatives en cours et à construire" },
      { src: 'images/image3.jpg', alt: "Section Agir : En facilitant notre capacité à agir et à developper un mode de vie solidaire et écologique" },
      { src: 'images/image4.jpg', alt: "Section Mobiliser : En cultivant des liens entre tou•te•s celles et ceux qui souhaitent se mobiliser sur le plan collectif" },
      { src: 'images/image5.jpg', alt: "L’association Tool a été créée à l’initiative d’un collectif de recruteurs de donateurs de Greenpeace. En wolof, langue parlée dans une partie de l’Afrique de l’Ouest, le terme Tool désigne un petit lopin de terre à cultiver, ainsi que le fait d’ensemencer, de cultiver. En anglais, cela signifie un outil, un moyen d’action. Ce nom, suggéré par l’un des membres du collectif, nous a paru convenir tout particulièrement à ce que nous imaginions pour celle-ci : ouverte sur le monde mais ancrée dans les réalités locales, à même d’agir concrètement et favorisant les échanges de savoir ainsi que le partage dans sa globalité." }
    ],
    animation: [
      { src: 'images/bg1.jpg', alt: "Animation démarrage - Phase 1" },
      { src: 'images/bg2.jpg', alt: "Animation démarrage - Phase 2" },
      { src: 'images/bg3.jpg', alt: "Animation démarrage - Phase 3" }
    ]
  };

  // Animation de démarrage
  imageConfig.animation.forEach((img, index) => {
    setTimeout(() => {
      mainImage.src = img.src;
      mainImage.alt = img.alt;
    }, index * 1000);
  });

  // Après 3 secondes
  setTimeout(() => {
    mainImage.src = defaultState.image;
    mainImage.alt = defaultState.alt;
    mainImage.classList.add("default-img");
    document.querySelectorAll('.control-text').forEach(el => {
      el.classList.remove('invisible');
    });
  }, 3000);

  // Gestion des projets textes
  document.querySelectorAll('.control-text').forEach((text, index) => {
    const projet = imageConfig.projets[index];

    text.addEventListener('mouseenter', () => {
      if (!activeProject) {
        mainImage.src = projet.src;
        mainImage.alt = projet.alt;
        mainImage.classList.add("shift-left");
      }
    });

    text.addEventListener('mouseleave', () => {
      if (!activeProject) {
        mainImage.src = defaultState.image;
        mainImage.alt = defaultState.alt;
        mainImage.classList.remove("shift-left");
      }
    });

    text.addEventListener('click', () => {
      activeProject = projet.src;
      mainImage.src = projet.src;
      mainImage.alt = projet.alt;
      mainImage.classList.add("shift-left");
      mainLogo.src = defaultState.logoActive;
      mainImage.title = "Cliquez pour revenir à l'accueil";
    });
  });

  // Gestion du logo
  mainLogo.addEventListener('click', () => {
    const projetSpecial = imageConfig.projets[3];
    
    if (mainLogo.src.includes('logo-active.png')) {
      activeProject = projetSpecial.src;
      mainImage.src = projetSpecial.src;
      mainImage.alt = projetSpecial.alt;
      mainImage.classList.add("shift-left");
      mainLogo.src = defaultState.logoDefault;
      mainImage.title = "Cliquez pour revenir à l'accueil";
    } else {
      activeProject = null;
      mainImage.src = defaultState.image;
      mainImage.alt = defaultState.alt;
      mainImage.classList.remove("shift-left");
      mainLogo.src = defaultState.logoActive;
      mainImage.removeAttribute('title');
    }
  });

  // Gestion clic image
  mainImage.addEventListener('click', () => {
    if (activeProject) {
      activeProject = null;
      mainImage.src = defaultState.image;
      mainImage.alt = defaultState.alt;
      mainImage.classList.remove("shift-left");
      mainLogo.src = defaultState.logoActive;
      mainImage.removeAttribute('title');
    }
  });
});