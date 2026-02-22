# Portal de Aulas - Prof. Ms. Ricardo Leme

Um portal estático, rápido e de fácil manutenção para o compartilhamento de materiais e aulas através da integração com pastas do Google Drive. Desenvolvido com HTML, CSS puro e JavaScript sem dependências de frameworks, ideal para ser hospedado gratuitamente no **GitHub Pages**.

## 🚀 Funcionalidades

- **UI/UX Futurista:** Interface moderna utilizando **Glassmorphism**, **Neumorphism** e a paleta de cores do **Dracula Theme** (Dark Mode).
- **Sem Backend ou Banco de Dados Complexo:** Toda a árvore e links do site são gerados dinamicamente no lado do cliente a partir de um simples arquivo `data.json`.
- **Navegação em Árvore:** Organização visual hierárquica por `Curso > Ano > Semestre > Disciplina`.
- **Integração Nativa Google Drive:** As pastas do Drive são visualizadas embarcadas (Embedded Folder View) diretamente na plataforma. Você não sai do site para baixar os arquivos.
- **Dark Mode no Drive:** Filtros CSS aplicados para inverter as cores do iframe padrão do Google Drive, mantendo a imersão visual no modo escuro.
- **Tratamento de Material Indisponível:** Visão customizada para disciplinas cadastradas mas que ainda não possuem arquivos em nuvem.

## 🛠️ Tecnologias Utilizadas

- **HTML5** (Semântico)
- **CSS3** (Variáveis nativas, Flexbox, Grid, CSS Filters, Backdrop-filter)
- **Vanilla JavaScript** (Fetch API para leitura de JSON, Manipulação do DOM)
- **FontAwesome 6** (Ícones)
- **Google Fonts** (Inter e Orbitron)

## 📦 Como Hospedar no Github Pages

Como o projeto é totalmente estático e *client-side*, a publicação é direta:

1. Faça o commit e push de todos os arquivos (`index.html`, `style.css`, `script.js` e `data.json`) para a raiz do seu repositório (ex: o próprio repositório `ricardoleme`).
2. Vá até as opções do repositório no GitHub (`Settings`).
3. No menu lateral, clique em **Pages**.
4. Em *Source*, selecione a branch `main` (ou `master`) e a pasta raiz (`/ (root)`).
5. Salve. Em poucos minutos o GitHub Pages vai gerar o seu link (ex: `https://seu-usuario.github.io/ricardoleme`).

---

## ⚙️ Manutenção (Como atualizar os dados)

A premissa do sistema é que você **nunca precise alterar o código HTML/CSS**. Toda vez que houver um novo semestre, basta editar o arquivo `data.json`.

Abra o arquivo `data.json` e adicione ou remova os blocos seguindo o formato:

```json
[
  {
    "curso": "ADS",
    "nomeCurso": "Análise e Desenvolvimento de Sistemas",
    "ano": 2024,
    "semestre": "1º Semestre",
    "disciplinas": [
      {
        "nome": "Banco de Dados",
        "url": "https://drive.google.com/drive/folders/ID_DA_SUA_PASTA?usp=sharing",
        "disponivel": true
      },
      {
        "nome": "Linguagem de Programação",
        "url": "https://drive.google.com/drive/folders/ID_DA_SUA_PASTA?usp=sharing",
        "disponivel": true
      }
    ]
  }
]
```

### Regras do JSON:
- **`curso`**: Sigla que aparecerá na navegação (ex: ADS).
- **`nomeCurso`**: Nome inteiro do curso que aparecerá no Tooltip (ao passar o mouse sobre a sigla).
- **`url`**: A URL da pasta do Google Drive normal que você copia para compartilhamento. *Observação: A pasta do Drive precisa ter a permissão "Qualquer pessoa com o link pode abrir" ligada nas propriedades de compartilhamento do Google*.
- **`disponivel`**: Defina como `false` se a disciplina já estiver no cronograma, mas você ainda não liberou a pasta na nuvem. Isso irá mostrar uma tela customizada de "Material Indisponível" na plataforma em vez de um iframe vazio/quebrado. Casos omitidos ou `true` tentarão carregar o Iframe imediatamente.
