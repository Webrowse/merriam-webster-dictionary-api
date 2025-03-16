const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const resultBox = document.querySelector('.result-box');
const searchBtn = document.getElementById('search-btn');
const sound = document.getElementById('sound')
const synBtn = document.getElementById('syn-btn')


searchBtn.addEventListener('click', () => {
    let inputWord = document.getElementById('input').value;
    fetch(`${url}${inputWord}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            if (!data || !data[0]) {
                throw new Error('No data found for the word.');
            }

            let resultHTML = `
                <div class="word">
                    <div class="result-word">
                        <h2>${inputWord}</h2>
                        <span>${data[0].phonetic || 'No phonetic available'}</span>
                    </div>
                
                    <button onClick="playSound()">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>`;


            if (data[0].meanings && data[0].meanings.length > 0) {

                data[0].meanings.forEach((meaning) => {
                    resultHTML += `
                        <div class="detail">
                            <p>${meaning.partOfSpeech}</p>
                        </div>`;

                    if (meaning.definitions && meaning.definitions.length > 0) {
                        for (let i = 0; i <= 3; i++) {
                            if (meaning.definitions[i]) {
                                resultHTML += `
                                    <p class="meanings">
                                        ${meaning.definitions[i].definition}
                                    </p>`;
                                if (meaning.definitions[i].example) {
                                    resultHTML += `
                                        <p class="example">
                                            ${meaning.definitions[i].example}
                                        </p>`;
                                }
                            }
                        }
                    } else {
                        resultHTML += `<p class="meanings">No definitions found.</p>`;
                    }
                });
            } else {
                resultHTML += `<p class="meanings">No meanings found.</p>`;
            }


            resultBox.innerHTML = resultHTML;


            if (data[0].phonetics && data[0].phonetics.length > 0) {
                const audioSource = data[0].phonetics.find(p => p.audio); 
            
                if (audioSource) {
                    sound.setAttribute("src", audioSource.audio);
                } else {
                    sound.removeAttribute("src");
                }
            }
            console.log(sound);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            resultBox.innerHTML = `<p class="error">Error fetching data. Please try again.</p>`;
        });
});


synBtn.addEventListener('click', () => {
    let inputWord = input.value;
    fetch(`${url}${inputWord}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            if (!data || !data[0]) {
                throw new Error('No data found for the word.');
            }


            const meanings = data[0].meanings; 
            let synonyms = [];
            let antonyms = [];

           
            meanings.forEach((meaning) => {
                if (meaning.synonyms) {
                    synonyms = synonyms.concat(meaning.synonyms);
                }
                if (meaning.antonyms) {
                    antonyms = antonyms.concat(meaning.antonyms);
                }
            });


            let synonymsHTML = '';
            if (synonyms.length > 0) {
                synonymsHTML = `<p class="synonyms"><strong>Synonyms:</strong> ${synonyms.join(', ')}</p>`;
            } else {
                synonymsHTML = `<p class="synonyms">No synonyms found.</p>`;
            }

            let antonymsHTML = '';
            if (antonyms.length > 0) {
                antonymsHTML = `<p class="antonyms"><strong>Antonyms:</strong> ${antonyms.join(', ')}</p>`;
            } else {
                antonymsHTML = `<p class="antonyms">No antonyms found.</p>`;
            }

            resultBox.innerHTML = `
                <div class="word">
                    <h2>${inputWord}</h2>
                </div>
                ${synonymsHTML}
                ${antonymsHTML}`;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            resultBox.innerHTML = `<p class="error">Error fetching data. Please try again.</p>`;
        });
});



function playSound(){
    sound.play();
}

async function fetchImages(query) {
    const apiKey = ""; 
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=4`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.photos.map(photo => ({
            id: photo.id,
            src: photo.src.medium,
            photographer: photo.photographer
        }));
    } catch (error) {
        console.error("Failed to fetch images:", error);
        return [];
    }
}

async function updateImg() {
    const gamesImages = await fetchImages("games", 3);
    const japanImages = await fetchImages("japan", 3);

    const gamesContainer = document.querySelector(".games-container");
    const wordplayContainer = document.querySelector(".wordplay-container");

    gamesContainer.innerHTML = "";  
    wordplayContainer.innerHTML = "";  

    gamesImages.forEach(img => {
        gamesContainer.innerHTML += `
            <div class="games-card">
                <div class="image">
                    <img src="${img.src}" alt="Game Image">
                </div>
                <div class="article">
                    <p>${img.photographer}</p>
                    <button>Play</button>
                </div>
            </div>
        `;
    });

  
    japanImages.forEach(img => {
        wordplayContainer.innerHTML += `
            <div class="wordplay-card">
                <div class="image">
                    <img src="${img.src}" alt="Japan Image">
                </div>
                <div class="article">
                    <p>${img.photographer}</p>
                </div>
            </div>
        `;
    });
}


updateImg();



const multipleApiKey = 'https://opentdb.com/api.php?amount=5&category=10&difficulty=medium&type=multiple';
const booleanApiKey = 'https://opentdb.com/api.php?amount=5&category=23&difficulty=hard&type=boolean';

async function fetchTriviaData() {
    try {
       
        const [multipleResponse, booleanResponse] = await Promise.all([
            fetch(multipleApiKey),
            fetch(booleanApiKey)
        ]);

        
        if (!multipleResponse.ok || !booleanResponse.ok) {
            throw new Error(`Error: ${multipleResponse.status} ${multipleResponse.statusText} or ${booleanResponse.status} ${booleanResponse.statusText}`);
        }

       
        const multipleData = await multipleResponse.json();
        const booleanData = await booleanResponse.json();

        return {
            multiple: multipleData.results,
            boolean: booleanData.results
        };

    } catch (error) {
        console.error("Failed to fetch trivia data:", error);
        return { multiple: [], boolean: [] };
    }
}

async function loadTrivia() {
    const { multiple, boolean } = await fetchTriviaData();

    let multipleHtml = '';
    let booleanHtml = '';

    multiple.forEach((question, index) => {
        const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
        multipleHtml += `
            <div class="trivia-multiple">
                <p>${question.question}</p>
                ${answers.map(answer => `
                    <label class="answer-label" data-correct="${answer === question.correct_answer}" for="multiple-${index}-${answer}">
                        <input type="radio" name="multiple-${index}" id="multiple-${index}-${answer}" value="${answer}" onchange="checkAnswer(this)">
                        ${answer}
                    </label>
                `).join('')}
            </div>
        `;
    });

    boolean.forEach((question, index) => {
        booleanHtml += `
            <div class="trivia-boolean">
                <p>${question.question}</p>
                <label class="answer-label" data-correct="true" for="boolean-${index}-true">
                    <input type="radio" name="boolean-${index}" id="boolean-${index}-true" value="True" onchange="checkAnswer(this)">
                    True
                </label>
                <label class="answer-label" data-correct="false" for="boolean-${index}-false">
                    <input type="radio" name="boolean-${index}" id="boolean-${index}-false" value="False" onchange="checkAnswer(this)">
                    False
                </label>
            </div>
        `;
    });

    document.querySelector('.right-content').innerHTML = multipleHtml + booleanHtml;
}


function checkAnswer(selectedInput) {
    const parentLabel = selectedInput.parentElement; 
    const isCorrect = parentLabel.getAttribute('data-correct') === "true";

    
    document.querySelectorAll(`input[name="${selectedInput.name}"]`).forEach(input => {
        input.parentElement.style.color = ''; 
    });

   
    parentLabel.style.color = isCorrect ? 'green' : 'red';
}


document.addEventListener('DOMContentLoaded', loadTrivia);



const closeBtn = document.getElementById('closed-btn-sidebar');
const burgerMenu = document.getElementById('burger-menu');
const mobileNav = document.querySelector('.mobile-nav');
const mobileHeader = document.querySelector('.mobile-header-wrapper');
const sidebar = document.querySelector('.content-wrapper');
const content = document.querySelector('.container')


function hideMobileNav(){
    mobileNav.style.display = 'none';
    document.body.style.background = '';
}

function showMobileNav(){
    mobileNav.style.display = 'flex';
    document.body.style.background = 'rgba(0, 0, 0, 0.5)';
}

burgerMenu.addEventListener('click', () =>{
    showMobileNav();
})

closeBtn.addEventListener('click', () =>{
    hideMobileNav();
})