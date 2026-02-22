document.addEventListener('DOMContentLoaded', () => {

    const menuContainer = document.getElementById('menu-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const iframeContainer = document.getElementById('iframe-container');
    const driveIframe = document.getElementById('drive-iframe');
    const currentClassTitle = document.getElementById('current-class-title');
    const externalLink = document.getElementById('external-link');

    // Fetch and build menu
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            buildMenu(data);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados das turmas:', error);
            menuContainer.innerHTML = `<div class="loading-data"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados.</div>`;
        });

    function buildMenu(data) {
        menuContainer.innerHTML = ''; // Limpar "Carregando..."

        // Agrupar por curso (novo nível superior) e mapear nome expandido
        const cursosMap = new Map();
        data.forEach(item => {
            if (!cursosMap.has(item.curso)) {
                cursosMap.set(item.curso, item.nomeCurso || item.curso);
            }
        });

        const cursos = Array.from(cursosMap.keys()).sort();

        cursos.forEach(curso => {
            const nomeCursoTooltip = cursosMap.get(curso);

            // Criar Grupo de Curso
            const cursoGroup = document.createElement('div');
            cursoGroup.className = 'menu-group curso-group';

            const cursoTitle = document.createElement('div');
            cursoTitle.className = 'menu-title curso-title';
            cursoTitle.style.borderLeftColor = 'var(--pink)';
            cursoTitle.style.color = 'var(--pink)';
            cursoTitle.title = nomeCursoTooltip; // Tooltip nativo
            cursoTitle.innerHTML = `<i class="fas fa-graduation-cap"></i> ${curso} <i class="fas fa-chevron-down"></i>`;

            const cursoContent = document.createElement('div');
            cursoContent.className = 'menu-content';

            // Toggle do Collapse para o Curso
            cursoTitle.addEventListener('click', () => {
                cursoContent.classList.toggle('active');
                const icon = cursoTitle.querySelector('.fa-chevron-down, .fa-chevron-up');
                if (cursoContent.classList.contains('active')) {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });

            const cursoData = data.filter(d => d.curso === curso);

            // Agrupar por ano dentro do curso
            const years = [...new Set(cursoData.map(item => item.ano))].sort((a, b) => b - a);

            years.forEach(year => {
                // Criar Grupo de Ano
                const yearGroup = document.createElement('div');
                yearGroup.className = 'menu-group ano-group';
                yearGroup.style.margin = '10px 0 10px 10px';

                const yearTitle = document.createElement('div');
                yearTitle.className = 'menu-title year-title';
                yearTitle.style.background = 'rgba(0, 0, 0, 0.15)';
                yearTitle.innerHTML = `<i class="far fa-calendar-alt"></i> Ano letivo ${year} <i class="fas fa-chevron-down"></i>`;

                const yearContent = document.createElement('div');
                yearContent.className = 'menu-content';

                // Toggle do Collapse para o Ano
                yearTitle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    yearContent.classList.toggle('active');
                    const icon = yearTitle.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (yearContent.classList.contains('active')) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                });

                // Encontrar semestres do ano atual (dentro deste curso)
                const yearData = cursoData.filter(d => d.ano === year);

                yearData.forEach(semesterData => {
                    const semesterDiv = document.createElement('div');
                    semesterDiv.className = 'semestre-group';

                    const semesterTitle = document.createElement('div');
                    semesterTitle.className = 'semestre-title';
                    semesterTitle.innerHTML = `<i class="fas fa-layer-group"></i> ${semesterData.semestre}`;

                    const disciplinaList = document.createElement('ul');
                    disciplinaList.className = 'disciplina-list';

                    semesterData.disciplinas.forEach(disciplina => {
                        const li = document.createElement('li');
                        li.className = 'disciplina-item';
                        li.innerHTML = `<i class="fas fa-code-branch"></i> ${disciplina.nome}`;

                        // Adicionar evento de clique para abrir a disciplina
                        li.addEventListener('click', () => {
                            // Remover ativo de todos
                            document.querySelectorAll('.disciplina-item').forEach(el => el.classList.remove('active'));
                            li.classList.add('active');

                            openDriveLink(disciplina);
                        });

                        disciplinaList.appendChild(li);
                    });

                    semesterDiv.appendChild(semesterTitle);
                    semesterDiv.appendChild(disciplinaList);
                    yearContent.appendChild(semesterDiv);
                });

                yearGroup.appendChild(yearTitle);
                yearGroup.appendChild(yearContent);
                cursoContent.appendChild(yearGroup);
            });

            cursoGroup.appendChild(cursoTitle);
            cursoGroup.appendChild(cursoContent);
            menuContainer.appendChild(cursoGroup);
        });

        // Abrir automaticamente o primeiro curso
        const firstCursoContent = menuContainer.querySelector('.curso-title');
        if (firstCursoContent) {
            firstCursoContent.click();

            // Abrir primeiro ano logo em seguida
            setTimeout(() => {
                const firstYearContent = menuContainer.querySelector('.curso-group .year-title');
                if (firstYearContent) {
                    firstYearContent.click();
                }
            }, 50);
        }
    }

    function getDriveFolderEmbedUrl(url) {
        // Ex: https://drive.google.com/drive/folders/1zzoV1WqLQMMZbXyGM-UDqycSyQV5kBOJ?usp=sharing
        // Extrai o ID pra usar no embeddedfolderview
        const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
        }
        return url; // Retorna normal se não conseguir converter
    }

    function openDriveLink(dataObj) {
        // Esconder boas-vindas
        welcomeMessage.style.opacity = '0';
        setTimeout(() => {
            welcomeMessage.style.display = 'none';
        }, 500);

        // Atualizar titulo e botão
        currentClassTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${dataObj.nome}`;
        externalLink.href = dataObj.url; // O link externo vai para o formato normal original

        // Verifica se a disciplina tem arquivos ('disponivel' explícito como false = ausente)
        // Se a propriedade 'disponivel' não existir no JSON, assumimos que é true por padrão.
        const isAvailable = dataObj.hasOwnProperty('disponivel') ? dataObj.disponivel : true;

        const unavailableMessage = document.getElementById('unavailable-message');

        if (!isAvailable) {
            // Esconde Iframe, mostra Mensagem de Indisponível
            iframeContainer.classList.add('hidden');
            unavailableMessage.classList.remove('hidden');

            // Impede transição abrupta
            setTimeout(() => {
                unavailableMessage.style.opacity = '1';
                unavailableMessage.style.pointerEvents = 'auto'; // Permitir cliques, se houver
            }, 50);

            driveIframe.src = "about:blank"; // Limpa iframe anterior da memória
        } else {
            // Esconde a mensagem de indisponivel (se estava ativa)
            unavailableMessage.style.opacity = '0';
            unavailableMessage.style.pointerEvents = 'none'; // Desativar ponteiros para não bugar nada por cima
            setTimeout(() => {
                unavailableMessage.classList.add('hidden');
            }, 300);

            // Mostrar Iframe
            const embedUrl = getDriveFolderEmbedUrl(dataObj.url);
            iframeContainer.classList.remove('hidden');

            // Só recarrega se for URL diferente (evitar piscar)
            if (driveIframe.src !== embedUrl) {
                driveIframe.src = embedUrl;
            }
        }
    }
});
