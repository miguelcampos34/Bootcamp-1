// CONFIGURAÇÃO: Substitua pelo seu nome de usuário real do GitHub
const GITHUB_USERNAME = 'miguelcampos34';

// --- 1. SCRIPT DE INTERNACIONALIZAÇÃO (ALTERNAR IDIOMA PT / EN) ---
const btnPt = document.getElementById('btn-pt');
const btnEn = document.getElementById('btn-en');
const elementosTraduziveis = document.querySelectorAll('[data-pt]');

function mudarIdioma(idioma) {
    elementosTraduziveis.forEach(el => {
        if (idioma === 'pt') {
            el.textContent = el.getAttribute('data-pt');
        } else {
            el.textContent = el.getAttribute('data-en');
        }
    });
}

btnPt.addEventListener('click', () => {
    btnPt.classList.add('active');
    btnEn.classList.remove('active');
    mudarIdioma('pt');
});

btnEn.addEventListener('click', () => {
    btnEn.classList.add('active');
    btnPt.classList.remove('active');
    mudarIdioma('en');
});


// --- 2. INTEGRAÇÃO SEGURA COM A API DO GITHUB (MURAL DINÂMICO) ---

// Função de Cibersegurança: Limpa dados de fora evitando falhas Cross-Site Scripting (XSS)
function sanitizarTexto(string) {
    if (!string) return '';
    const mapaCaracteres = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return string.replace(/[&<>""'/]/g, match => mapaCaracteres[match]);
}

async function carregarProjetosDoHub() {
    const container = document.getElementById('container-projetos');
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao consultar API.');

        const repositorios = await response.json();
        container.innerHTML = ''; // Limpa a mensagem padrão de carregando

        repositorios.forEach(repo => {
            // Não exibe o repositório do próprio site no mural para evitar duplicidade
            if (repo.name.toLowerCase().includes('github.io')) return;

            // Sanitização rigorosa exigida pelo edital de segurança
            const nomeSeguro = sanitizarTexto(repo.name.replace(/-/g, ' '));
            const descricaoSegura = sanitizarTexto(repo.description || 'Sem descrição cadastrada.');
            const linguagemSegura = sanitizarTexto(repo.language || 'Geral');
            const urlSegura = encodeURI(repo.html_url);

            // Monta o Card com isolamento total de links externos (rel="noopener noreferrer")
            const cardHTML = `
                <div class="projeto-card">
                    <div>
                        <h3>${nomeSeguro}</h3>
                        <p>${descricaoSegura}</p>
                    </div>
                    <div>
                        <div class="projeto-tags">
                            <span>${linguagemSegura}</span>
                            <span>⭐ ${Number(repo.stargazers_count)}</span>
                        </div>
                        <a href="${urlSegura}" target="_blank" rel="noopener noreferrer" class="btn-projeto">
                            Ver no GitHub &rarr;
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p>Não foi possível buscar os repositórios automatizados no momento.</p>';
    }
}

// Inicializa a busca quando a página abre
window.addEventListener('DOMContentLoaded', carregarProjetosDoHub);
