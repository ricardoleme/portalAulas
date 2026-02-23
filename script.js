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

        data.forEach(anoData => {
            // Criar Grupo de Ano
            const anoGroup = document.createElement('div');
            anoGroup.className = 'menu-group ano-group';

            const anoTitle = document.createElement('div');
            anoTitle.className = 'menu-title year-title';
            anoTitle.style.borderLeftColor = 'var(--pink)';
            anoTitle.style.color = 'var(--pink)';
            anoTitle.innerHTML = `<i class="far fa-calendar-alt"></i> Ano letivo ${anoData.ano} <i class="fas fa-chevron-down"></i>`;

            const anoContent = document.createElement('div');
            anoContent.className = 'menu-content';

            // Toggle do Collapse para o Ano
            anoTitle.addEventListener('click', () => {
                anoContent.classList.toggle('active');
                const icon = anoTitle.querySelector('.fa-chevron-down, .fa-chevron-up');
                if (anoContent.classList.contains('active')) {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });

            anoData.semestres.forEach(semestreData => {
                // Criar Grupo de Semestre
                const semestreGroup = document.createElement('div');
                semestreGroup.className = 'menu-group semestre-group';
                semestreGroup.style.margin = '10px 0 10px 10px';

                const semestreTitle = document.createElement('div');
                semestreTitle.className = 'menu-title';
                semestreTitle.style.background = 'rgba(0, 0, 0, 0.15)';
                semestreTitle.innerHTML = `<i class="fas fa-layer-group"></i> ${semestreData.semestre} <i class="fas fa-chevron-down"></i>`;

                const semestreContent = document.createElement('div');
                semestreContent.className = 'menu-content';

                // Toggle do Collapse para o Semestre
                semestreTitle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    semestreContent.classList.toggle('active');
                    const icon = semestreTitle.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (semestreContent.classList.contains('active')) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                });

                semestreData.cursos.forEach(cursoData => {
                    const cursoDiv = document.createElement('div');
                    cursoDiv.className = 'curso-group-inner';
                    cursoDiv.style.marginBottom = '10px';

                    const cursoTitle = document.createElement('div');
                    cursoTitle.className = 'curso-label';
                    cursoTitle.title = cursoData.nomeCurso || cursoData.curso;
                    cursoTitle.innerHTML = `<i class="fas fa-graduation-cap"></i> ${cursoData.curso}`;

                    const disciplinaList = document.createElement('ul');
                    disciplinaList.className = 'disciplina-list';

                    cursoData.disciplinas.forEach(disciplina => {
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

        // Abrir automaticamente o primeiro ano
        const firstAnoContent = menuContainer.querySelector('.year-title');
        if (firstAnoContent) {
            firstAnoContent.click();

            // Abrir primeiro semestre logo em seguida
            setTimeout(() => {
                const firstSemestreContent = menuContainer.querySelector('.ano-group .menu-title:not(.year-title)');
                if (firstSemestreContent) {
                    firstSemestreContent.click();
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
