document.addEventListener('DOMContentLoaded', () => {
    const WIKI_API = "https://en.wikipedia.org/w/api.php";
    const CATEGORIES = [
        "Category:IUCN_Red_List_endangered_species",
        "Category:IUCN_Red_List_critically_endangered_species"
    ];
    const INVALID_KEYWORDS = ['map', 'locator', 'symbol', 'distribution'];
    const PAIRS_NEEDED = 8;
    const CORS_PROXY = "https://corsproxy.io/?";
    const CACHE_BUSTER = Date.now();

    // Éléments DOM
    const grille = document.querySelector('.grille');
    const speciesImageContainer = document.querySelector('.species-image-container');
    const speciesTextContainer = document.querySelector('.species-text-container');
    let selection = [];
    let matchedPairs = 0;
    let currentSpeciesData = new Map();

    initGame();

    async function initGame() {
        showLoadingGrid();
        try {
            const species = await fetchRandomSpecies();
            const gameData = await prepareGameData(species);
            renderGrid(gameData);
        } catch (error) {
            showError(error.message);
            console.error("Erreur:", error);
        }
    }

    function showLoadingGrid() {
        grille.innerHTML = '';
        const colors = ['#a82e11', '#f6a508', '#317f34'];
        
        for (let i = 0; i < 4; i++) {
            const ligneDiv = document.createElement('div');
            ligneDiv.className = `ligne ${i % 2 ? 'offset' : ''}`;
            
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell loading-cell';
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                cell.innerHTML = `
                    <div class="hexagone loading-hex" style="background-color: ${randomColor}"></div>
                `;
                
                cell.style.animationDelay = `${(i * 4 + j) * 0.1}s`;
                ligneDiv.appendChild(cell);
            }
            grille.appendChild(ligneDiv);
        }
    }

    async function fetchRandomSpecies() {
        let allSpecies = [];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (const category of CATEGORIES) {
            // Faire 3 passes avec des lettres aléatoires différentes
            for (let pass = 0; pass < 3; pass++) {
                const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
                const params = new URLSearchParams({
                    action: "query",
                    list: "categorymembers",
                    cmtitle: category,
                    cmlimit: 100,
                    cmstartsortkeyprefix: randomLetter.toLowerCase(),
                    format: "json",
                    origin: "*",
                    cb: CACHE_BUSTER
                });

                try {
                    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(WIKI_API + '?' + params)}`);
                    if (!response.ok) continue;
                    
                    const data = await response.json();
                    if (!data?.query?.categorymembers) continue;
                    
                    const categorySpecies = data.query.categorymembers
                        .filter(m => m.ns === 0 && !m.title.match(/^(List of|Category:|User:|File:)/i))
                        .map(m => ({
                            title: m.title,
                            category: category.includes('critically') ? 'Critically Endangered' : 'Endangered',
                            firstLetter: m.title.charAt(0).toUpperCase()
                        }));
                    
                    allSpecies = [...allSpecies, ...categorySpecies];
                } catch (error) {
                    console.error(`Erreur sur ${category} (pass ${pass}):`, error);
                }
            }
        }

        if (allSpecies.length === 0) {
            throw new Error('Aucune espèce trouvée après plusieurs tentatives');
        }

        return shuffleArray(allSpecies);
    }

    async function prepareGameData(speciesList) {
        const validData = [];
        const shuffledSpecies = shuffleArray([...speciesList]);
        const letterGroups = {};

        // Groupement par première lettre
        shuffledSpecies.forEach(species => {
            const letter = species.firstLetter;
            if (!letterGroups[letter]) {
                letterGroups[letter] = [];
            }
            letterGroups[letter].push(species);
        });

        // Sélection équilibrée
        const letters = Object.keys(letterGroups);
        const targetPerLetter = Math.max(1, Math.floor(PAIRS_NEEDED / letters.length));

        for (const letter of letters) {
            const group = shuffleArray(letterGroups[letter]).slice(0, targetPerLetter);
            
            for (const species of group) {
                if (validData.length >= PAIRS_NEEDED) break;
                
                try {
                    const {imageUrl, summary} = await fetchSpeciesData(species.title);
                    if (imageUrl && !validData.some(d => d.imageUrl === imageUrl)) {
                        validData.push({
                            imageUrl,
                            summary,
                            title: species.title,
                            category: species.category
                        });
                        currentSpeciesData.set(imageUrl, {
                            summary,
                            title: species.title,
                            category: species.category
                        });
                    }
                } catch (e) {
                    console.warn(`Erreur sur ${species.title}:`, e.message);
                }
            }
        }

        // Complément aléatoire si nécessaire
        if (validData.length < PAIRS_NEEDED) {
            const remaining = shuffleArray(
                shuffledSpecies.filter(sp => !validData.some(v => v.title === sp.title))
            );
            
            for (const species of remaining) {
                if (validData.length >= PAIRS_NEEDED) break;
                
                try {
                    const {imageUrl, summary} = await fetchSpeciesData(species.title);
                    if (imageUrl && !validData.some(d => d.imageUrl === imageUrl)) {
                        validData.push({
                            imageUrl,
                            summary,
                            title: species.title,
                            category: species.category
                        });
                        currentSpeciesData.set(imageUrl, {
                            summary,
                            title: species.title,
                            category: species.category
                        });
                    }
                } catch (e) {
                    console.warn(`Erreur sur ${species.title}:`, e.message);
                }
            }
        }

        if (validData.length < PAIRS_NEEDED) {
            throw new Error(`Seulement ${validData.length} espèces valides trouvées`);
        }

        const pairedData = validData.flatMap(species => [species, species]);
        return shuffleArray(pairedData);
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    async function fetchSpeciesData(title) {
        const params = new URLSearchParams({
            action: "query",
            titles: title,
            prop: "pageimages|extracts",
            pithumbsize: 400,
            exintro: true,
            explaintext: true,
            format: "json",
            origin: "*",
            cb: CACHE_BUSTER
        });

        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(WIKI_API + '?' + params)}`);
        if (!response.ok) throw new Error('Erreur API');
        
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];
        
        if (!page.thumbnail) throw new Error('Pas de miniature');
        
        const imageUrl = page.thumbnail.source;
        if (INVALID_KEYWORDS.some(kw => imageUrl.toLowerCase().includes(kw))) {
            throw new Error('Image non valide');
        }

        return {
            imageUrl,
            summary: page.extract || "Description non disponible",
            title: page.title
        };
    }

    function renderGrid(gameData) {
        if (gameData.length !== 16) {
            throw new Error(`Nombre de cartes invalide : ${gameData.length}/16`);
        }

        document.querySelectorAll('.loading-cell, .loading-hex').forEach(el => {
            el.classList.remove('loading-cell', 'loading-hex');
        });

        matchedPairs = 0;
        const colors = ['#a82e11', '#f6a508', '#317f34'];

        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            cell.innerHTML = `
                <div class="symbole" 
                     style="background-image:url('${gameData[index].imageUrl}')"
                     data-img="${gameData[index].imageUrl}"></div>
                <div class="hexagone" style="background-color: ${randomColor}"></div>
            `;
            
            cell.querySelector('.hexagone').addEventListener('click', handleHexClick);
        });
    }

    function handleHexClick(e) {
        const hex = e.target;
        const symbole = hex.previousElementSibling;
        
        if (selection.length < 2 && !hex.classList.contains('disparu')) {
            hex.classList.add('disparu');
            symbole.style.opacity = '1';
            selection.push({ hex, symbole });
            
            if (selection.length === 2) {
                setTimeout(checkMatch, 600);
            }
        }
    }

    function checkMatch() {
        const [first, second] = selection;
        const isMatch = first.symbole.dataset.img === second.symbole.dataset.img;
        
        if (isMatch) {
            matchedPairs++;
            updateSpeciesDisplay(first.symbole.dataset.img);
            if (matchedPairs === PAIRS_NEEDED) {
                setTimeout(showCongratsModal, 300);
            }
        } else {
            selection.forEach(item => {
                item.hex.classList.remove('disparu');
                item.symbole.style.opacity = '0';
            });
        }
        selection = [];
    }

    function showCongratsModal() {
        const modal = document.createElement('div');
        modal.className = 'congrats-modal';
        modal.innerHTML = `
            <h2 style="font-family: 'Edo'; color: #317f34"> Bravo !</h2>
            <p style="font-family: 'Edo';">Tu as trouvé toutes les paires !</p>
            <p style="font-family: 'Edo';">Tu souhaites nous contacter ?</p>
            <a href="mailto:reda@tool-monde.info?subject=Bonjour" 
            class="mailto-link" 
            style="font-family: 'Arial';">
                Écris-nous à<br>reda@tool-monde.info
            </a>
        `;
        document.body.appendChild(modal);
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.insertBefore(overlay, modal);
        
        overlay.addEventListener('click', () => {
            modal.remove();
            overlay.remove();
        });
    }

    function updateSpeciesDisplay(imageUrl) {
        const species = currentSpeciesData.get(imageUrl);
        if (!species) return;

        const categoryLink = species.category.includes('Critically') 
            ? 'Critically_endangered'
            : 'Endangered_species';

        speciesImageContainer.innerHTML = `<img src="${imageUrl}" alt="${species.title}">`;
        
        speciesTextContainer.innerHTML = `
            <h3><a href="https://en.wikipedia.org/wiki/${species.title.replace(/ /g, '_')}" 
                  target="_blank" 
                  style="color: #317f34; text-decoration:none;">
                  ${species.title}
            </a></h3>
            <p><a href="https://en.wikipedia.org/wiki/${categoryLink}" 
                 target="_blank"
                 style="color: #a82e11; text-decoration: none; font-weight: bold;">
                 ${species.category}
            </a></p>
            <p>${species.summary}</p>
        `;
    }

    function showError(message) {
        grille.innerHTML = `<div class="error">${message}</div>`;
    }

    document.getElementById('reset').addEventListener('click', () => {
        window.location.reload();
    });
});