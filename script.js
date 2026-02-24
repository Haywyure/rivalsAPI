// store the global variables
const global = {
    currentPage: window.location.pathname,
    currentHero: '',

    search: {
        term: '',
        type: '',
        page: 1,
        totalPages: 1,
        totalResults: 0,
     },

    api: {
        api_url: "https://marvelrivalsapi.com/api/v1",
        api_key: "2b6cc4c9e345b5d5ee228c9a6b0bdbd434ccd698672ff8199a79ffff2455976f",
        img_URL: "https://marvelrivalsapi.com",
    }
}

// initialize the correct page based on URL
// when the page loads
function init() {
    switch (global.currentPage) {
        case "/":
            global.currentHero = null;
            console.log(global.api.img_url);
            displayHeroes();
            break;
        case "/hero":
            displayHeroPage();
            break;
        case "/search":
            searchHeroes()
            break;
        default:
            console.log("Page not found");
    }
}
document.addEventListener('DOMContentLoaded', init);

// create a headers object for the API key
// to allow access to the API
const headers = {
    "x-api-key": global.api.api_key,
};


// basic get from api 
async function APIFetch(url, headers) {
    showSpinner();
    const response = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    if (!response.ok) {
        //throw new Error(`HTTP error! status: ${response.status}`);
        console.error(`HTTP error! status: ${response.status}`);
        hideSpinner();
        return 0;
    }

    hideSpinner();

    return response.json();
}

// get an image from api    
async function getImage(url){ 
   // use AJAX to get the image from the api
    const fullUrl = global.api.img_URL + url;
    console.log(fullUrl);

    let xhr = new XMLHttpRequest();

    xhr.open("GET", fullUrl, true);
    xhr.dataType = "jsonp";
    
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // The image is loaded successfully
            return this.responseText;
        }
        else if (this.readyState == 4) {
            // The image failed to load
            console.error("Failed to load image:", this.statusText);
            return null;
        }
    }
    xhr.send();
}

// get something from api with the given url
async function getFromAPI(url) {
    const fullUrl = global.api.api_url + url;
    const results = await APIFetch(fullUrl, headers);
    return results;

}

// display the clicked on hero'e's info page
async function displayHeroPage() {
    const header = document.getElementById("header");
    const urlParams = new URLSearchParams(window.location.search);
    const heroID = urlParams.get('id');
    let heroName = urlParams.get('name');

    heroName = toNormalFormat(heroName);
    console.log(heroName);
    const displayName = capitalizeFirstLetters(heroName);
    // create the header
    header.innerHTML= `<img id="main-icon" src="images/mainIcon.png" alt="Main Menu">Hero: ${displayName}<input type="text" id="search-bar" placeholder="Search for a hero..." id="search-bar">`;

    // add event listener to search bar
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("keydown", function(e){
        // only search if the enter key is pressed
        if (e.key === "Enter"){
            window.location.href = `search?term=${e.target.value}`;
            searchHeroes;
        }
        });

    // add link back to the main page on the header icon
    const mainIcon = document.getElementById("main-icon");
    mainIcon.addEventListener("click", (e) => {
        window.location.href = "/";
    });

    // get the heroes info from the api
    showSpinner();
    const hero = await getFromAPI(`/heroes/hero/${heroName}`);
    

    // display their costumes and allow swiping
    let costumes = hero.costumes;
    costumes.forEach(costume => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${costume.name}</strong>`;
        let costumeIcon = `${global.api.img_URL}/rivals${costume.icon}`;
        if (costumeIcon === null) {
            costumeIcon = "images/test-hero.png";
        }
        div.innerHTML += `<img src="${costumeIcon}" alt="${costume.name}" class="costume-icon">`;
        div.classList.add("swiper-slide");
        document.querySelector('.swiper-wrapper').appendChild(div);
    });

    initSwiper();

    // display their bio
    const bio = document.getElementById("hero-bio");
    bio.innerHTML = `${hero.bio}<br><br><br>`;

    // display their abilities
    const abilityList = document.getElementById("ability-list");
    let abilities = hero.abilities;
    abilities.forEach(ability => {
        if (`${ability.name}` !== `undefined`) {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${ability.name}: </strong><br>`;
    
            let abilityIcon = `${global.api.img_URL}/rivals${ability.icon}`;
            if (abilityIcon === null) {
                abilityIcon = "images/test-hero.png";
            }
            li.innerHTML += `<img src="${abilityIcon}" alt="${ability.name}" class="ability-icon">`;
            li.innerHTML += `<br>${ability.description}<br><br>`;

            abilityList.appendChild(li);
        }

    });
    hideSpinner();
}

// navigate to the selected hero's page
function goToHeroPage(heroID, heroName) {
    global.currentHero = heroID;
    heroName = toUrlFormat(heroName);
    window.location.href = `hero?id=${heroID}&name=${heroName}`;
}

// get all heroes from api and display them in the select box
async function displayHeroes() {
    // get the heroes from the api and display them
    const heroes = await getFromAPI("/heroes");
    const heroList = document.getElementById("character-list");
    heroes.forEach(hero => {
        const currHero = document.createElement("div");

        // locate the hero's image
        let portrait = global.api.img_URL + hero.imageUrl;
        console.log(global.api.img_URL + hero.imageUrl);

        // format the hero's id and name for later use
        let heroID = replaceSpaces(hero.name);
        let heroText = capitalizeFirstLetters(hero.name);

        // create the hero within the div
        currHero.innerHTML = `<id="${heroID}" class="character-item">
            <img id="hero-thumbnail" src="${portrait}" alt="${heroText}">
            </li>`;
        
        // add an event listener to the hero's image 
        // to go to their info page
        currHero.addEventListener("click", (e) => {goToHeroPage(heroID, hero.name)});
        currHero.id = heroID;

        // add evenet listener to the search bar
        const searchBar = document.getElementById("search-bar");
        searchBar.addEventListener("keydown", function(e){
            // only search if the enter key is pressed
            if (e.key === "Enter"){
                window.location.href = `search?term=${e.target.value}`;
                searchHeroes;
            }
            });

        // add the hero to the list of heroes
        heroList.appendChild(currHero);
    });

    // sort the list of heroes alphabetically by their id
    const listItems = Array.from(heroList.children);
    listItems.sort((a, b) => a.id.localeCompare(b.id));
    

    heroList.innerHTML = ""; // clear the list before adding sorted items
    listItems.forEach(item => heroList.appendChild(item));
}

// allow for searching for heroes by their explicit name
async function searchHeroes() {
    // add a click event listener to the main icon
    // to go back to the main page
    const mainIcon = document.getElementById("main-icon");
    mainIcon.addEventListener("click", (e) => {
        window.location.href = "/";
    });

    // add event listener to search bar
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("keydown", function(e){
        // only search if the enter key is pressed
        if (e.key === "Enter"){
            window.location.href = `search?term=${e.target.value}`;
            searchHeroes;
        }
        });

    // get the search term from the url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // add the type and term to the global object
    //global.search.type = urlParams.get('type');
    global.search.term = urlParams.get('term');
    let searchURL = `/heroes/hero/${global.search.term}`;

    // ensure cloak & dagger is handled due to strange API naming
    console.log(searchURL);
    if (global.search.term === 'cloak & dagger' || global.search.term === 'cloak and dagger'){
        searchURL = '/heroes/hero/cloak & dagger';
    }

    // if the search term is not empty, get the hero from the api
    if (global.search.term !== '' && global.search.term !== null){
        const hero = await getFromAPI(searchURL);

        // if there is no result, inform user
        if (hero === 0){
            showAlert("No results found");
            return;
        }

        // display the searched for hero's image
        displaySearchResults(hero);

        // clear the search term from the input box
        document.querySelector('#search-term').value = '';
    }
    else{
        // if the search term is empty, inform user
        showAlert("Please enter a search term");
        return;
    }
}

// display the searched for hero's image
function displaySearchResults(hero) {
    // get and format the search results info
    const heroName = hero.name;
    const heroID = replaceSpaces(heroName);
    const heroImage = global.api.img_URL + hero.imageUrl;
       
    // display the hero's image and create a 
    // click eventlistener to their info page
    const heroItem = document.createElement("div");
    heroItem.innerHTML = `<img src="${heroImage}" alt="${heroName}" class="character-item" id="hero-thumbnail">`;

    heroItem.addEventListener("click", (e) => {
        goToHeroPage(heroID, heroName);
    });

    document.getElementById("search-results").appendChild(heroItem);
}

// show an alert message for a preset amount of time
function showAlert(message, className = 'error'){
    // select the alert div and create a new alert element
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert', className);
    alertElement.appendChild(document.createTextNode(message));

    // add the alert element to the alert div
    document.querySelector('#alert').appendChild(alertElement);

    // clear the alert
    setTimeout(() => {
        alertElement.remove();
    }, 3000)
}

// initialize the swiper
function initSwiper(){
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 25,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        breakpoints: {
            500: {
                slidesPerView: 2
            },
            700: {
                slidesPerView: 3
            },
            1200: {
                slidesPerView: 4
            },
        }
    })
}

// show the spinner
function showSpinner(){
    document.querySelector('.spinner').classList.add('show');
}

// hide the spinner
function hideSpinner(){
    document.querySelector('.spinner').classList.remove('show');
}

// capitalize the first letter of each word in a string
// accounting for hyphenated names as well
function capitalizeFirstLetters(name) {
    name = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// replace spaces with dashes
function replaceSpaces(name) {
    return name.replace(/\s+/g, '-').toLowerCase();
}

// replace spaces with underscores for URL use
function toUrlFormat(name) {
    return name.replace(/\s+/g, '_').toLowerCase();
}

// replace underscores with spaces for JS use
function toNormalFormat(name) {
    if (name === 'cloak_') {
        return 'cloak & dagger';
    }
    return name.replace(/_/g, ' ').toLowerCase();
}