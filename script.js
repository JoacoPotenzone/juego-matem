// Espera a que el contenido del DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. DEFINICIÓN DE PREGUNTAS ---
    // 'type: "theory"' usa opciones
    // 'type: "exercise"' usa el campo de texto
    const questions = [
        {
            type: "theory",
            question: "¿Qué es un número racional?",
            options: [
                "Un número que no puede ser expresado como fracción",
                "Un número que solo puede ser positivo",
                "Un número que puede expresarse como el cociente de dos enteros (a/b, donde b ≠ 0)",
                "Un número irracional como Pi"
            ],
            answer: "Un número que puede expresarse como el cociente de dos enteros (a/b, donde b ≠ 0)"
        },
        {
            type: "exercise",
            question: "Resuelve la ecuación: x / 2 = 10",
            answer: 20
        },
        {
            type: "exercise",
            question: "Resuelve la ecuación: x + 1/4 = 3/4",
            answer: 0.5 // El usuario puede poner 0.5 o 1/2, pero el parseFloat lo simplifica
        },
        {
            type: "theory",
            question: "¿Cuál es el inverso multiplicativo (recíproco) de 5/8?",
            options: [
                "8/5",
                "-5/8",
                "5.8",
                "1"
            ],
            answer: "8/5"
        },
        {
            type: "exercise",
            question: "Resuelve la ecuación: (2 * x) / 3 = 6",
            answer: 9
        },
        {
            type: "exercise",
            question: "Calcula: 1/2 + 1/3",
            answer: "5/6" // Para este, forzamos una respuesta en texto
        },
        {
            type: "exercise",
            question: "Simplifica la fracción: 10/15",
            answer: "2/3"
        },
        {
            type: "theory",
            question: "¿Cómo se llama una fracción donde el numerador es mayor o igual que el denominador?",
            options: [
                "Fracción propia",
                "Fracción impropia",
                "Fracción equivalente",
                "Número mixto"
            ],
            answer: "Fracción impropia"
        }
    ];

    // --- 2. REFERENCIAS A ELEMENTOS DEL DOM ---
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const exerciseContainer = document.getElementById("exercise-container");
    const exerciseInput = document.getElementById("exercise-input");
    const submitBtn = document.getElementById("submit-btn");
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("next-btn");
    const scoreDisplay = document.getElementById("score");
    const resultsContainer = document.getElementById("results-container");
    const finalScore = document.getElementById("final-score");
    const restartBtn = document.getElementById("restart-btn");
    const scoreContainer = document.getElementById("score-container");
    const questionContainer = document.getElementById("question-container");
    const answerContainer = document.getElementById("answer-container");

    // --- 3. ESTADO DEL JUEGO ---
    let currentQuestionIndex = 0;
    let score = 0;
    let answerChecked = false;

    // --- 4. FUNCIONES PRINCIPALES ---

    /**
     * Carga la pregunta actual en la UI
     */
    function loadQuestion() {
        answerChecked = false;
        feedback.textContent = "";
        feedback.className = "feedback-message"; // Resetear clases
        nextBtn.classList.add("hidden");
        
        const question = questions[currentQuestionIndex];
        questionText.textContent = question.question;

        // Limpiar contenedores de respuestas anteriores
        optionsContainer.innerHTML = "";
        exerciseInput.value = "";
        submitBtn.disabled = false; // Habilitar botón de enviar

        if (question.type === "theory") {
            // Mostrar opciones, ocultar ejercicio
            optionsContainer.classList.remove("hidden");
            exerciseContainer.classList.add("hidden");

            question.options.forEach(option => {
                const button = document.createElement("button");
                button.textContent = option;
                button.classList.add("option-btn");
                button.addEventListener("click", () => checkAnswer(option, button));
                optionsContainer.appendChild(button);
            });

        } else if (question.type === "exercise") {
            // Mostrar ejercicio, ocultar opciones
            optionsContainer.classList.add("hidden");
            exerciseContainer.classList.remove("hidden");
            exerciseInput.focus(); // Poner foco en el input
        }
    }

    /**
     * Comprueba la respuesta del usuario
     */
    function checkAnswer(userAnswerOption = null, clickedButton = null) {
        if (answerChecked) return; // Evitar doble comprobación
        answerChecked = true;

        const question = questions[currentQuestionIndex];
        const correctAnswer = String(question.answer).trim().toLowerCase(); // Asegurar string y minúsculas
        let isCorrect = false;
        let userAnswer;

        if (question.type === "exercise") {
            userAnswer = exerciseInput.value.trim();
        } else { // Theory
            userAnswer = userAnswerOption;
        }

        const normalizedUserAnswer = String(userAnswer).trim().toLowerCase();
        
        // --- Lógica de comprobación de respuestas ---
        // 1. Coincidencia exacta
        if (normalizedUserAnswer === correctAnswer) {
            isCorrect = true;
        } 
        // 2. Para respuestas numéricas (incluye fracciones convertibles a decimal)
        else if (!isNaN(parseFloat(normalizedUserAnswer)) && !isNaN(parseFloat(correctAnswer))) {
            // Compara valores flotantes
            if (parseFloat(normalizedUserAnswer) === parseFloat(correctAnswer)) {
                isCorrect = true;
            } else {
                // Intenta evaluar la expresión si el usuario puso una fracción (ej. "1/2")
                try {
                    if (eval(normalizedUserAnswer) === parseFloat(correctAnswer)) {
                        isCorrect = true;
                    }
                } catch (e) { /* Ignorar errores de evaluación */ }
            }
        }
        // 3. Para respuestas que son fracciones en texto (ej. "5/6")
        else if (normalizedUserAnswer.includes('/') && correctAnswer.includes('/')) {
            // Se puede añadir lógica más robusta para simplificar y comparar fracciones
            // Por ahora, una comparación directa de texto para fracciones
            if (normalizedUserAnswer === correctAnswer) {
                isCorrect = true;
            }
        }
        // ------------------------------------------

        if (isCorrect) {
            score++;
            scoreDisplay.textContent = score;
            feedback.textContent = "¡Correcto!";
            feedback.classList.add("correct");
        } else {
            feedback.textContent = `Incorrecto. La respuesta correcta era: ${question.answer}`;
            feedback.classList.add("incorrect");
        }

        // Estilos visuales de feedback
        if (question.type === "theory") {
            document.querySelectorAll(".option-btn").forEach(btn => {
                btn.disabled = true; // Deshabilitar todos los botones
                const btnText = String(btn.textContent).trim().toLowerCase();
                
                if (btnText === correctAnswer) {
                    btn.classList.add("correct-feedback"); // Marcar la correcta
                } else if (btn === clickedButton && !isCorrect) {
                    btn.classList.add("incorrect-feedback"); // Marcar la elegida incorrecta
                }
            });
        } else { // Exercise
            submitBtn.disabled = true; // Deshabilitar el botón de enviar
            exerciseInput.disabled = true; // Deshabilitar el input
            
            // --- INICIO DE LA CORRECCIÓN ---
            if (isCorrect) {
                exerciseInput.style.borderColor = "var(--correct-color)";
            } else {
                exerciseInput.style.borderColor = "var(--incorrect-color)";
            }
            // --- FIN DE LA CORRECCIÓN ---
        }
        
        nextBtn.classList.remove("hidden");
    }

    /**
     * Muestra la puntuación final
     */
    function showResults() {
        // Ocultar elementos del juego
        questionContainer.classList.add("hidden");
        answerContainer.classList.add("hidden");
        scoreContainer.classList.add("hidden");
        feedback.classList.add("hidden");
        nextBtn.classList.add("hidden");

        // Mostrar resultados
        resultsContainer.classList.remove("hidden");
        finalScore.textContent = `${score} de ${questions.length}`;
    }

    /**
     * Avanza a la siguiente pregunta o muestra resultados
     */
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            // Restablecer estilos de input/botones para la siguiente pregunta
            exerciseInput.disabled = false;
            
            // --- INICIO DE LA CORRECCIÓN ---
            exerciseInput.style.borderColor = "var(--border-color)";
            // --- FIN DE LA CORRECCIÓN ---
            
            loadQuestion();
        } else {
            showResults();
        }
    }

    /**
     * Reinicia el juego
     */
    function restartGame() {
        score = 0;
        currentQuestionIndex = 0;
        scoreDisplay.textContent = score;

        // Ocultar resultados
        resultsContainer.classList.add("hidden");
        
        // Mostrar elementos del juego
        questionContainer.classList.remove("hidden");
        answerContainer.classList.remove("hidden");
        scoreContainer.classList.remove("hidden");
        feedback.classList.remove("hidden");

        // Restablecer estilos de input
        exerciseInput.disabled = false;
        
        // --- INICIO DE LA CORRECCIÓN ---
        exerciseInput.style.borderColor = "var(--border-color)";
        // --- FIN DE LA CORRECCIÓN ---

        loadQuestion();
    }

    // --- 5. INICIALIZACIÓN Y EVENT LISTENERS ---
    
    // Listener para el botón de "Enviar" en ejercicios
    submitBtn.addEventListener("click", () => checkAnswer());
    
    // Listener para el input de ejercicio (para responder con "Enter")
    exerciseInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter" && !answerChecked) {
            checkAnswer();
        }
    });

    // Listener para el botón "Siguiente"
    nextBtn.addEventListener("click", nextQuestion);
    
    // Listener para el botón "Reiniciar"
    restartBtn.addEventListener("click", restartGame);

    // Cargar la primera pregunta al iniciar
    loadQuestion();

});