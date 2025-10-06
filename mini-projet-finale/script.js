let apiQuestions = []
let score = 0
let timer
let timeLeft = 60

const apiQuizContainer = document.getElementById('api-quiz');
const apiQuestionsContainer = document.getElementById('api-questions-container');
const apiSubmitBtn = document.getElementById('api-submit-btn');
const generateBtn = document.getElementById('generate-btn');
const returnBtn = document.getElementById('return-btn');
const scoreContainer = document.getElementById('score-container');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const timerElement = document.getElementById('time');

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    apiSubmitBtn.addEventListener('click', submitApiQuiz);
    generateBtn.addEventListener('click', generateApiQuiz);
    returnBtn.addEventListener('click', returnToForm);
});
//fonction timer
function startTimer() {
    clearInterval(timer);
    timeLeft = 60;
    timerElement.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 10) { timerElement.style.color = 'red'; } else { timerElement.style.color = 'white'; }
        if (timeLeft <= 0) {
            clearInterval(timer)
            if (!apiQuestionsContainer.classList.contains('hidden')) {
                submitApiQuiz();
            }
        }
    }, 1000);
}
//fonction pour categories charger les catégories de l'API
async function loadCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        const categorySelect = document.getElementById('category');
        data.trivia_categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des categories:', error);
    }
}
//function pour generer un quiz apartir de l api
async function generateApiQuiz() {
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const type = document.getElementById('type').value;
    // Construire l'URL de l'API
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;
    if (category) apiUrl += `&category=${category}`;
    if (difficulty) apiUrl += `&difficulty=${difficulty}`;
    if (type) apiUrl += `&type=${type}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.response_code === 0) {
            apiQuestions = data.results;
            displayApiQuestions();

            // Cacher le formulaire et afficher les questions
            document.getElementById('quiz-form').classList.add('hidden');

            const apiQuestionsContainer = document.getElementById('api-questions-container');
            const returnBtn = document.getElementById('return-btn');
            const apiSubmitBtn = document.getElementById('api-submit-btn');
            
            apiQuestionsContainer.classList.remove('hidden');
            returnBtn.classList.remove('hidden');
            apiSubmitBtn.classList.remove('hidden');
            
            // Réinitialiser et démarrer le timer
            startTimer();
            
        } else {
            alert('Erreur lors de la generation du quiz ')

        }
    } catch (error) {

        console.error('Erreur lors de la generation du quiz:', error);
        alert('Une erreur est servenue.  Verifier votre conexion internet et ressayer');
    }
}

//Fonction pour afficher les questions de l'API

function displayApiQuestions() {
    apiQuestionsContainer.innerHTML = '';

    apiQuestions.forEach((q, qIndex) => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question');

                // Décoder les entités HTML
                const questionText = decodeHTMLEntities(q.question);

                // Créer un tableau avec toutes les options (correctes et incorrectes)
                const allOptions = [...q.incorrect_answers, q.correct_answer];

                // Mélanger les options
                shuffleArray(allOptions);

                // Trouver l'index de la bonne réponse dans le tableau mélangé
                const correctIndex = allOptions.indexOf(q.correct_answer);

                questionDiv.innerHTML = `<h3>Question ${qIndex + 1}: ${questionText}</h3>
                <ul class="options">${allOptions.map((option, oIndex) => `<li class="option" data-question="${qIndex}" data-option="${oIndex}" data-correct="${oIndex === correctIndex}">${decodeHTMLEntities(option)}</li>`).join('')}</ul>`;
        
        apiQuestionsContainer.appendChild(questionDiv);
    });
    
    // Ajouter les écouteurs d'événements pour les options
    document.querySelectorAll('#api-questions-container .option').forEach(option => {
        option.addEventListener('click', selectApiOption);
    });
    
    // Mettre à jour le nombre total de questions
    totalQuestionsElement.textContent = apiQuestions.length;
}

    // fonction pour selectionne une option dans le quiz de API :

    function selectApiOption(e) {
        const questionIndex = parseInt(e.target.dataset.question);

        // Deselectionner toutes les options de cette question :
       document.querySelectorAll(`#api-questions-container .option[data-question="${questionIndex}"]`).forEach(opt => {
            opt.classList.remove('selected');
        });

        // Selectionner l'option cliquee : 
        e.target.classList.add('selected');
    }

    // Fonction pour soumettre le quiz API:
    function submitApiQuiz() {
        clearInterval(timer);

        let userScore = 0;

        // Verifier les reponses :
        apiQuestions.forEach((q, qIndex) => {
    const selectedOption = document.querySelector(
        `#api-questions-container .option.selected[data-question="${qIndex}"]`
    );

    if (selectedOption) {
        const isCorrect = selectedOption.dataset.correct === 'true';

        if (isCorrect) {
            userScore++;
            selectedOption.classList.add('correct');
        } else {
            selectedOption.classList.add('incorrect');
            document
                .querySelector(
                    `#api-questions-container .option[data-question="${qIndex}"][data-correct="true"]`
                )
                .classList.add('correct');
        }
    } else {
        // Aucune option sélectionnée → montrer la bonne réponse directement
        document
            .querySelector(
                `#api-questions-container .option[data-question="${qIndex}"][data-correct="true"]`
            )
            .classList.add('correct');
    }
});


        // mettre a jour et afficher le score 

        score = userScore;
        scoreElement.textContent = score;
        scoreContainer.classList.remove('hidden');
        scoreContainer.classList.add('fade-in');

        // desactiver le bouton de soumission 
        apiSubmitBtn.disabled = true;

        //defiler vers le haut 
        window.scrollTo({ top: 0, behavior: 'smooth' })

    }

    // fonction pour retourner au formulaire 
    function returnToForm() {
        document.getElementById('quiz-form').classList.remove('hidden');
        apiQuestionsContainer.classList.add('hidden');
        apiSubmitBtn.classList.add('hidden');
        returnBtn.classList.add('hidden');
        apiSubmitBtn.disabled = false;
        scoreContainer.classList.add('hidden');
        clearInterval(timer);
        
        // Réinitialiser le timer à 0
        timeLeft = 0;
        timerElement.textContent = timeLeft;
        timerElement.style.color = 'white';
    }
    // fonction utilitaire pour decoder les entites HTML :

    function decodeHTMLEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    // fonction utilitaire pour melanger un tableau 
    function shuffleArray(Array) {
    for (let i = Array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [Array[i], Array[j]] = [Array[j], Array[i]];
    }
    return Array;
}