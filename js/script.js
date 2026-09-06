document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const iframeContainer = document.getElementById('iframe-container');
    const driveIframe = document.getElementById('drive-iframe');
    const currentClassTitle = document.getElementById('current-class-title');
    const externalLink = document.getElementById('external-link');
    const unavailableMessage = document.getElementById('unavailable-message');
    const quizContainer = document.getElementById('quiz-container');
    const quizTitle = document.getElementById('quiz-title');
    const quizSubtitle = document.getElementById('quiz-subtitle');
    const quizBody = document.getElementById('quiz-body');
    const quizCorrect = document.getElementById('quiz-correct');
    const quizWrong = document.getElementById('quiz-wrong');
    const quizGrade = document.getElementById('quiz-grade');

    const quizCache = new Map();
    let currentQuizState = null;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            buildMenu(data);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados das turmas:', error);
            menuContainer.innerHTML = '<div class="loading-data"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados.</div>';
        });

    function buildMenu(data) {
        menuContainer.innerHTML = '';

        data.forEach(anoData => {
            const anoGroup = document.createElement('div');
            anoGroup.className = 'menu-group ano-group';

            const anoTitle = document.createElement('div');
            anoTitle.className = 'menu-title year-title';
            anoTitle.style.borderLeftColor = 'var(--pink)';
            anoTitle.style.color = 'var(--pink)';
            anoTitle.innerHTML = `<span><i class="far fa-calendar-alt"></i> Ano letivo ${escapeHTML(anoData.ano)}</span> <i class="fas fa-chevron-down"></i>`;

            const anoContent = document.createElement('div');
            anoContent.className = 'menu-content';

            anoTitle.addEventListener('click', () => toggleContent(anoContent, anoTitle));

            anoData.semestres.forEach(semestreData => {
                const semestreGroup = document.createElement('div');
                semestreGroup.className = 'menu-group semestre-group';
                semestreGroup.style.margin = '10px 0 10px 10px';

                const semestreTitle = document.createElement('div');
                semestreTitle.className = 'menu-title';
                semestreTitle.style.background = 'rgba(0, 0, 0, 0.15)';
                semestreTitle.innerHTML = `<span><i class="fas fa-layer-group"></i> ${escapeHTML(semestreData.semestre)}</span> <i class="fas fa-chevron-down"></i>`;

                const semestreContent = document.createElement('div');
                semestreContent.className = 'menu-content';

                semestreTitle.addEventListener('click', event => {
                    event.stopPropagation();
                    toggleContent(semestreContent, semestreTitle);
                });

                semestreData.cursos.forEach(cursoData => {
                    const cursoDiv = document.createElement('div');
                    cursoDiv.className = 'curso-group-inner';
                    cursoDiv.style.marginBottom = '10px';

                    const cursoTitle = document.createElement('div');
                    cursoTitle.className = 'curso-label';
                    cursoTitle.title = cursoData.nomeCurso || cursoData.curso;
                    cursoTitle.innerHTML = `<i class="fas fa-graduation-cap"></i> ${escapeHTML(cursoData.curso)}`;

                    const disciplinaList = document.createElement('ul');
                    disciplinaList.className = 'disciplina-list';

                    cursoData.disciplinas.forEach(disciplina => {
                        disciplinaList.appendChild(createDisciplinaMenuItem(disciplina));
                    });

                    cursoDiv.appendChild(cursoTitle);
                    cursoDiv.appendChild(disciplinaList);
                    semestreContent.appendChild(cursoDiv);
                });

                semestreGroup.appendChild(semestreTitle);
                semestreGroup.appendChild(semestreContent);
                anoContent.appendChild(semestreGroup);
            });

            anoGroup.appendChild(anoTitle);
            anoGroup.appendChild(anoContent);
            menuContainer.appendChild(anoGroup);
        });

        const firstAnoContent = menuContainer.querySelector('.year-title');
        if (firstAnoContent) {
            firstAnoContent.click();

            setTimeout(() => {
                const firstSemestreContent = menuContainer.querySelector('.ano-group .menu-title:not(.year-title)');
                if (firstSemestreContent) {
                    firstSemestreContent.click();
                }
            }, 50);
        }
    }

    function createDisciplinaMenuItem(disciplina) {
        const li = document.createElement('li');
        li.className = 'disciplina-node';

        const disciplinaTitle = document.createElement('div');
        disciplinaTitle.className = 'disciplina-item disciplina-title';
        disciplinaTitle.innerHTML = `<span><i class="fas fa-code-branch"></i> ${escapeHTML(disciplina.nome)}</span> <i class="fas fa-chevron-down"></i>`;

        const actionsList = document.createElement('ul');
        actionsList.className = 'disciplina-actions';

        const downloadItem = document.createElement('li');
        downloadItem.className = 'disciplina-action-item';
        downloadItem.innerHTML = '<i class="fas fa-download"></i> Área de Download';
        downloadItem.addEventListener('click', event => {
            event.stopPropagation();
            setActiveAction(downloadItem);
            openDriveLink(disciplina);
        });
        actionsList.appendChild(downloadItem);

        if (disciplina.questoes) {
            const quizGroup = document.createElement('li');
            quizGroup.className = 'disciplina-action-group';

            const quizGroupTitle = document.createElement('div');
            quizGroupTitle.className = 'disciplina-action-item has-children';
            quizGroupTitle.innerHTML = '<span><i class="fas fa-circle-question"></i> Questões de Fixação</span> <i class="fas fa-chevron-down"></i>';

            const assessmentsList = document.createElement('ul');
            assessmentsList.className = 'avaliacao-list';

            quizGroupTitle.addEventListener('click', event => {
                event.stopPropagation();
                assessmentsList.classList.toggle('active');
                replaceChevron(quizGroupTitle, assessmentsList.classList.contains('active'));
                loadAssessmentMenu(disciplina, assessmentsList);
            });

            quizGroup.appendChild(quizGroupTitle);
            quizGroup.appendChild(assessmentsList);
            actionsList.appendChild(quizGroup);
        }

        disciplinaTitle.addEventListener('click', event => {
            event.stopPropagation();
            actionsList.classList.toggle('active');
            disciplinaTitle.classList.toggle('active', actionsList.classList.contains('active'));
            replaceChevron(disciplinaTitle, actionsList.classList.contains('active'));
        });

        li.appendChild(disciplinaTitle);
        li.appendChild(actionsList);

        return li;
    }

    function toggleContent(contentElement, titleElement) {
        contentElement.classList.toggle('active');
        replaceChevron(titleElement, contentElement.classList.contains('active'));
    }

    function replaceChevron(element, isOpen) {
        const icon = element.querySelector('.fa-chevron-down, .fa-chevron-up');
        if (!icon) return;

        icon.classList.toggle('fa-chevron-down', !isOpen);
        icon.classList.toggle('fa-chevron-up', isOpen);
    }

    function setActiveAction(activeElement) {
        document.querySelectorAll('.disciplina-item, .disciplina-action-item, .avaliacao-item').forEach(element => {
            element.classList.remove('active');
        });
        activeElement.classList.add('active');

        const disciplineTitle = activeElement.closest('.disciplina-node')?.querySelector('.disciplina-title');
        if (disciplineTitle) {
            disciplineTitle.classList.add('active');
        }
    }

    function getDriveFolderEmbedUrl(url) {
        const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
        }
        return url;
    }

    function hideWelcome() {
        welcomeMessage.style.opacity = '0';
        setTimeout(() => {
            welcomeMessage.style.display = 'none';
        }, 500);
    }

    function hideAllContent() {
        hideWelcome();
        iframeContainer.classList.add('hidden');
        unavailableMessage.style.opacity = '0';
        unavailableMessage.style.pointerEvents = 'none';
        unavailableMessage.classList.add('hidden');
        quizContainer.classList.add('hidden');
    }

    function openDriveLink(dataObj) {
        hideAllContent();

        currentClassTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${escapeHTML(dataObj.nome)}`;
        externalLink.href = dataObj.url;

        const isAvailable = Object.prototype.hasOwnProperty.call(dataObj, 'disponivel') ? dataObj.disponivel : true;

        if (!isAvailable) {
            unavailableMessage.classList.remove('hidden');
            setTimeout(() => {
                unavailableMessage.style.opacity = '1';
                unavailableMessage.style.pointerEvents = 'auto';
            }, 50);

            driveIframe.src = 'about:blank';
            return;
        }

        const embedUrl = getDriveFolderEmbedUrl(dataObj.url);
        iframeContainer.classList.remove('hidden');

        if (driveIframe.src !== embedUrl) {
            driveIframe.src = embedUrl;
        }
    }

    async function loadAssessmentMenu(disciplina, assessmentsList) {
        if (assessmentsList.dataset.loaded === 'true') return;

        assessmentsList.innerHTML = '<li class="avaliacao-status"><i class="fas fa-circle-notch fa-spin"></i> Carregando...</li>';

        try {
            const quizData = await fetchQuizData(disciplina.questoes);
            const assessments = normalizeAssessments(quizData);

            assessmentsList.innerHTML = '';

            if (!assessments.length) {
                assessmentsList.innerHTML = '<li class="avaliacao-status">Nenhuma avaliação cadastrada.</li>';
                return;
            }

            assessments.forEach((assessment, index) => {
                const assessmentItem = document.createElement('li');
                assessmentItem.className = 'avaliacao-item';
                assessmentItem.innerHTML = `<i class="fas fa-list-check"></i> ${escapeHTML(assessment.titulo || `${index + 1}a avaliação`)}`;
                assessmentItem.addEventListener('click', event => {
                    event.stopPropagation();
                    setActiveAction(assessmentItem);
                    openQuiz(disciplina, quizData, assessment);
                });
                assessmentsList.appendChild(assessmentItem);
            });

            assessmentsList.dataset.loaded = 'true';
        } catch (error) {
            console.error('Erro ao carregar questoes:', error);
            assessmentsList.innerHTML = '<li class="avaliacao-status error">Erro ao carregar questões.</li>';
        }
    }

    async function fetchQuizData(path) {
        if (quizCache.has(path)) {
            return quizCache.get(path);
        }

        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Arquivo de questoes nao encontrado: ${path}`);
        }

        const quizData = await response.json();
        quizCache.set(path, quizData);
        return quizData;
    }

    function normalizeAssessments(quizData) {
        if (Array.isArray(quizData.avaliacoes)) {
            return quizData.avaliacoes.filter(assessment => {
                return Array.isArray(assessment.questoes) && assessment.questoes.length > 0;
            });
        }

        if (Array.isArray(quizData.questoes) && quizData.questoes.length > 0) {
            return [{
                id: 'fixacao',
                titulo: 'Questões de Fixação',
                questoes: quizData.questoes
            }];
        }

        return [];
    }

    function openQuiz(disciplina, quizData, assessment) {
        hideAllContent();

        const questions = Array.isArray(assessment.questoes) ? assessment.questoes : [];
        currentQuizState = {
            questions,
            answers: new Map(),
            currentIndex: 0,
            quizData
        };

        quizTitle.innerHTML = `<i class="fas fa-clipboard-question"></i> ${escapeHTML(disciplina.nome)}`;
        quizSubtitle.textContent = `${assessment.titulo || 'Questões de Fixação'} - ${formatQuestionCount(questions.length)}`;
        quizContainer.classList.remove('hidden');

        renderCurrentQuestion();
        updateScore();
    }

    function renderCurrentQuestion() {
        quizBody.innerHTML = '';

        if (!currentQuizState) return;

        const { questions, currentIndex, quizData } = currentQuizState;

        if (!questions.length) {
            quizBody.innerHTML = '<div class="quiz-empty">Nenhuma questão cadastrada para esta avaliação.</div>';
            return;
        }

        const question = questions[currentIndex];
        const answer = currentQuizState.answers.get(currentIndex);
        const article = document.createElement('article');
        article.className = 'question-card';
        article.dataset.questionIndex = currentIndex;

        if (answer) {
            article.classList.add(answer.isCorrect ? 'correct' : 'wrong');
        }

        const alternatives = normalizeAlternatives(question.alternativas);

        article.innerHTML = `
            <div class="question-topline">
                <span>Questão ${currentIndex + 1} de ${questions.length}</span>
                <span>${escapeHTML(quizData.disciplina || '')}</span>
            </div>
            <h4>${escapeHTML(question.enunciado || '')}</h4>
            <div class="alternatives"></div>
            <div class="question-feedback" aria-live="polite"></div>
        `;

        const alternativesContainer = article.querySelector('.alternatives');
        alternatives.forEach(alternative => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'alternative-btn';
            button.dataset.alternativeId = alternative.id;
            button.innerHTML = `<strong>${escapeHTML(alternative.id)}</strong><span>${escapeHTML(alternative.texto)}</span>`;
            button.addEventListener('click', () => answerQuestion(question, currentIndex, alternative.id, article));

            if (answer) {
                button.disabled = true;

                if (alternative.id === String(question.correta || '').trim()) {
                    button.classList.add('correct');
                }

                if (alternative.id === answer.selectedId && !answer.isCorrect) {
                    button.classList.add('wrong');
                }
            }

            alternativesContainer.appendChild(button);
        });

        if (answer) {
            renderQuestionFeedback(question, answer.isCorrect, article);
        }

        quizBody.appendChild(article);

        if (answer && currentIndex === questions.length - 1) {
            quizBody.appendChild(createQuizResultCard());
        }

        quizBody.appendChild(createQuizNavigation());
    }

    function answerQuestion(question, questionIndex, selectedId, questionCard) {
        if (currentQuizState.answers.has(questionIndex)) return;

        const correctId = String(question.correta || '').trim();
        const isCorrect = selectedId === correctId;
        currentQuizState.answers.set(questionIndex, {
            isCorrect,
            selectedId
        });

        questionCard.classList.add(isCorrect ? 'correct' : 'wrong');
        questionCard.querySelectorAll('.alternative-btn').forEach(button => {
            button.disabled = true;
            const alternativeId = button.dataset.alternativeId;

            if (alternativeId === correctId) {
                button.classList.add('correct');
            }

            if (alternativeId === selectedId && !isCorrect) {
                button.classList.add('wrong');
            }
        });

        renderQuestionFeedback(question, isCorrect, questionCard);
        updateScore();
    }

    function createQuizNavigation() {
        const nav = document.createElement('div');
        nav.className = 'quiz-navigation';

        const previousButton = document.createElement('button');
        previousButton.type = 'button';
        previousButton.className = 'glass-btn quiz-nav-btn';
        previousButton.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar';
        previousButton.disabled = currentQuizState.currentIndex === 0;
        previousButton.addEventListener('click', () => {
            currentQuizState.currentIndex -= 1;
            renderCurrentQuestion();
        });

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'glass-btn quiz-nav-btn';
        nextButton.innerHTML = 'Próxima <i class="fas fa-arrow-right"></i>';
        nextButton.disabled = currentQuizState.currentIndex === currentQuizState.questions.length - 1;
        nextButton.addEventListener('click', () => {
            currentQuizState.currentIndex += 1;
            renderCurrentQuestion();
        });

        nav.appendChild(previousButton);
        nav.appendChild(nextButton);
        return nav;
    }

    function renderQuestionFeedback(question, isCorrect, questionCard) {
        const feedback = question.feedback || 'Revise o conteúdo relacionado a esta questão.';
        const feedbackElement = questionCard.querySelector('.question-feedback');
        feedbackElement.innerHTML = `
            <strong>${isCorrect ? 'Resposta correta.' : 'Resposta incorreta.'}</strong>
            <p>${escapeHTML(feedback)}</p>
        `;
    }

    function updateScore() {
        if (!currentQuizState) {
            quizCorrect.textContent = '0';
            quizWrong.textContent = '0';
            quizGrade.textContent = '0.0';
            return;
        }

        const results = Array.from(currentQuizState.answers.values());
        const correct = results.filter(result => result.isCorrect).length;
        const wrong = results.length - correct;
        const total = currentQuizState.questions.length || 1;
        const grade = (correct / total) * 10;

        quizCorrect.textContent = correct;
        quizWrong.textContent = wrong;
        quizGrade.textContent = grade.toFixed(1);
    }

    function formatQuestionCount(total) {
        return total === 1 ? '1 questão' : `${total} questões`;
    }

    function createQuizResultCard() {
        const grade = getCurrentQuizGrade();
        const result = getQuizResultByGrade(grade);
        const card = document.createElement('section');
        card.className = `quiz-result-card ${result.status}`;
        card.setAttribute('aria-live', 'polite');
        card.innerHTML = `
            <div class="quiz-result-icon"><i class="${result.icon}"></i></div>
            <div>
                <span>Resultado final</span>
                <h4>${result.title}</h4>
                <p>${result.message}</p>
                <strong>Nota ${grade.toFixed(1)}</strong>
            </div>
        `;

        return card;
    }

    function getCurrentQuizGrade() {
        if (!currentQuizState) return 0;

        const results = Array.from(currentQuizState.answers.values());
        const correct = results.filter(result => result.isCorrect).length;
        const total = currentQuizState.questions.length || 1;
        return (correct / total) * 10;
    }

    function getQuizResultByGrade(grade) {
        if (grade < 6) {
            return {
                status: 'failed',
                icon: 'fas fa-triangle-exclamation',
                title: 'Você não atingiu a média.',
                message: 'Revise os tópicos com erro e tente responder novamente depois do estudo.'
            };
        }

        if (grade <= 8) {
            return {
                status: 'average',
                icon: 'fas fa-thumbs-up',
                title: 'Foi razoável.',
                message: 'Você acertou boa parte do conteúdo, mas ainda há pontos para reforçar.'
            };
        }

        return {
            status: 'excellent',
            icon: 'fas fa-trophy',
            title: 'Você foi muito bem.',
            message: 'Seu desempenho mostra domínio forte dos principais pontos desta avaliação.'
        };
    }

    function normalizeAlternatives(alternatives) {
        if (!Array.isArray(alternatives)) return [];

        return alternatives.slice(0, 4).map((alternative, index) => {
            if (typeof alternative === 'string') {
                return {
                    id: String.fromCharCode(65 + index),
                    texto: alternative
                };
            }

            return {
                id: String(alternative.id || String.fromCharCode(65 + index)).trim(),
                texto: String(alternative.texto || '')
            };
        });
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
