// Espera a que el contenido del DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    const questionText = document.getElementById("question-text");
    const exerciseContainer = document.getElementById("exercise-container");
    const exerciseInput = document.getElementById("exercise-input");
    const submitBtn = document.getElementById("submit-btn");
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("next-btn");
    const scoreDisplay = document.getElementById("score");
    const levelDisplay = document.getElementById("level");
    const resultsContainer = document.getElementById("results-container");
    const finalScore = document.getElementById("final-score");
    const restartBtn = document.getElementById("restart-btn");
    const scoreContainer = document.getElementById("score-container");
    const questionContainer = document.getElementById("question-container");
    const answerContainer = document.getElementById("answer-container");
    const levelContainer = document.getElementById("level-container");
    
    const dogImg = document.getElementById("dog-img");
    const successSound = document.getElementById("success-sound");

    // --- 2. ESTADO DEL JUEGO ---
    let currentLevel = 1;
    let score = 0;
    let currentCorrectAnswer; 
    let answerChecked = false;

    // --- INICIO DE LA MODIFICACIÓN (Niveles) ---
    const maxLevels = 8; // Aumentamos el total de niveles
    // --- FIN DE LA MODIFICACIÓN ---

    // --- 3. FUNCIONES AUXILIARES ---

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- INICIO DE LA MODIFICACIÓN (Nuevas Ecuaciones) ---
    /**
     * Genera una ecuación basada en el nivel actual
     * Retorna un objeto: { text: "Pregunta", answer: (respuesta numérica) }
     */
    function generateEquation(level) {
        let n1, n2, n3, n4, n5, n6;
        let questionText;
        let answer;

        // Aseguramos que los denominadores nunca sean 1 para que sean fracciones
        n2 = getRandomInt(2, 6);
        n4 = getRandomInt(2, 6);
        n6 = getRandomInt(2, 6);
        // Aseguramos que los numeradores no sean 0
        n1 = getRandomInt(1, 7);
        n3 = getRandomInt(1, 7);
        n5 = getRandomInt(1, 7);


        switch (level) {
            case 1:
                // Nivel 1: x + a/b = c/b (denominador común)
                n3 = getRandomInt(n1 + 1, 10); // c (asegura que c > a)
                questionText = `x + ${n1}/${n2} = ${n3}/${n2}`;
                answer = (n3 / n2) - (n1 / n2);
                break;
            
            case 2:
                // Nivel 2: x - a/b = c/b
                questionText = `x - ${n1}/${n2} = ${n3}/${n2}`;
                answer = (n3 / n2) + (n1 / n2);
                break;

            case 3:
                // Nivel 3: (a/b) * x = c (multiplicación)
                n3 = getRandomInt(1, 5); // c (entero)
                questionText = `(${n1}/${n2}) * x = ${n3}`;
                answer = n3 / (n1 / n2);
                break;

            case 4:
                // Nivel 4: x + a/b = c/d (diferente denominador)
                if (n2 === n4) n4 = n2 + 1; // Evitar denominadores iguales
                questionText = `x + ${n1}/${n2} = ${n3}/${n4}`;
                answer = (n3 / n4) - (n1 / n2);
                break;

            // --- ¡NUEVOS NIVELES COMBINADOS! ---
            case 5:
                // Nivel 5: x = (a/b) + (c/d) (Cálculo directo)
                questionText = `x = ${n1}/${n2} + ${n3}/${n4}`;
                answer = (n1 / n2) + (n3 / n4);
                break;

            case 6:
                // Nivel 6: (a/b) * (c/d) + x = e
                n5 = getRandomInt(1, 5); // e (entero)
                questionText = `(${n1}/${n2}) * (${n3}/${n4}) + x = ${n5}`;
                answer = n5 - ((n1 / n2) * (n3 / n4));
                break;

            case 7:
                // Nivel 7: x - (a/b) / (c/d) = e
                n5 = getRandomInt(1, 5); // e (entero)
                questionText = `x - (${n1}/${n2}) / (${n3}/${n4}) = ${n5}`;
                answer = n5 + ((n1 / n2) / (n3 / n4));
                break;
            
            case 8:
                // Nivel 8 (Final): (a/b) * x + (c/d) = (e/f)
                questionText = `(${n1}/${n2}) * x + ${n3}/${n4} = ${n5}/${n6}`;
                answer = ((n5 / n6) - (n3 / n4)) / (n1 / n2);
                break;

            default:
                return null; 
        }

        return { text: questionText, answer: answer };
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // --- 4. FUNCIONES PRINCIPALES DEL JUEGO ---

    function loadLevel() {
        // Detener música anterior
        successSound.pause();
        successSound.loop = false;
        successSound.currentTime = 0; 

        answerChecked = false;
        feedback.textContent = "";
        feedback.className = "feedback-message";
        nextBtn.classList.add("hidden");
        dogImg.classList.add("hidden");
        dogImg.src = "";
        
        exerciseInput.disabled = false;
        submitBtn.disabled = false;
        exerciseInput.value = "";
        exerciseInput.classList.remove("correct-feedback", "incorrect-feedback");

        const equation = generateEquation(currentLevel);

        if (equation) {
            questionText.textContent = equation.text;
            currentCorrectAnswer = equation.answer;
            levelDisplay.textContent = currentLevel;
            exerciseInput.focus();
        } else {
            showResults();
        }
    }

    // --- INICIO DE LA MODIFICACIÓN (Mejorar Eval) ---
    function checkAnswer() {
        if (answerChecked) return;

        const userAnswer = exerciseInput.value.trim().replace(',', '.');
        
        if (userAnswer === "") {
            feedback.textContent = "Por favor, ingresa una respuesta.";
            feedback.classList.add("incorrect");
            return;
        }

        let evaluatedUserAnswer;
        try {
            // Modificación: Permitimos caracteres como () y *
            // Verificamos si hay caracteres "ilegales" (letras, etc.)
            if (/[^0-9\/\.\-\+\*\(\) ]/.test(userAnswer)) {
                 throw new Error("Caracteres no válidos");
            }
            // Usamos 'new Function' que es un 'eval' un poco más seguro
            evaluatedUserAnswer = new Function('return ' + userAnswer)();

        } catch (e) {
            feedback.textContent = "Respuesta no válida. Usa números, fracciones (5/3) o paréntesis.";
            feedback.classList.add("incorrect");
            return;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        answerChecked = true;
        exerciseInput.disabled = true;
        submitBtn.disabled = true;

        // Comparamos los valores numéricos con un margen de error (epsilon)
        const isCorrect = Math.abs(evaluatedUserAnswer - currentCorrectAnswer) < 0.01;

        if (isCorrect) {
            score++;
            scoreDisplay.textContent = score;
            feedback.textContent = "¡Correcto!";
            feedback.classList.add("correct");
            exerciseInput.classList.add("correct-feedback");
            playSuccessFeedback();
        } else {
            // Damos la respuesta redondeada a 2 decimales
            feedback.textContent = `Incorrecto. La respuesta era: ${currentCorrectAnswer.toFixed(2)}`;
            feedback.classList.add("incorrect");
            exerciseInput.classList.add("incorrect-feedback");
        }
        
        nextBtn.classList.remove("hidden");
    }

    function playSuccessFeedback() {
        // 1. Reproducir música (con tus ajustes)
        successSound.volume = 0.3; 
        successSound.currentTime = 90; // (Ajusta esto a tus segundos)
        successSound.loop = true; 
        successSound.play().catch(e => console.error("Error al reproducir audio:", e));

        // 2. Cargar imagen de perrito
        fetch('https://dog.ceo/api/breeds/image/random')
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    dogImg.src = data.message;
                    dogImg.classList.remove("hidden");
                }
            })
            .catch(e => console.error("Error al cargar imagen:", e));
    }

    function showResults() {
        questionContainer.classList.add("hidden");
        answerContainer.classList.add("hidden");
        scoreContainer.classList.add("hidden");
        levelContainer.classList.add("hidden");
        feedback.classList.add("hidden");
        nextBtn.classList.add("hidden");
        dogImg.classList.add("hidden");
        
        // Detener la música si el juego termina
        successSound.pause();
        successSound.loop = false;
        successSound.currentTime = 0;

        resultsContainer.classList.remove("hidden");
        finalScore.textContent = `${score}`;
    }

    function nextLevel() {
        currentLevel++;
        if (currentLevel > maxLevels) {
            showResults();
        } else {
            loadLevel();
        }
    }

    function restartGame() {
        score = 0;
        currentLevel = 1;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = currentLevel;

        resultsContainer.classList.add("hidden");
        
        questionContainer.classList.remove("hidden");
        answerContainer.classList.remove("hidden");
        scoreContainer.classList.remove("hidden");
        levelContainer.classList.remove("hidden");
        feedback.classList.remove("hidden");

        loadLevel();
    }

    // --- 5. INICIALIZACIÓN Y EVENT LISTENERS ---
    
    submitBtn.addEventListener("click", checkAnswer);
    
    exerciseInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter" && !answerChecked) {
            checkAnswer();
        }
    });

    nextBtn.addEventListener("click", nextLevel);
    restartBtn.addEventListener("click", restartGame);

    loadLevel();

});