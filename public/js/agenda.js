let pagesData = [
  { date: '2025-07-28', contents: ['Recado: João se alimentou bem hoje.'] },
  { date: '2025-07-29', contents: ['Evento: Atividade de pintura em grupo.'] }
];

let currentPageIndex = 0;
let tipoAtual = '';

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

function renderPage() {
  const titulo = document.getElementById('data-titulo');
  const conteudoDiv = document.getElementById('conteudo-pagina');

  if (pagesData.length === 0) {
    titulo.textContent = 'Nenhuma data adicionada';
    conteudoDiv.innerHTML = '<p>Adicione um recado, evento ou foto para começar.</p>';
    return;
  }

  // Ordenar páginas por data (ascendente)
  pagesData.sort((a, b) => a.date.localeCompare(b.date));

  // Garantir índice dentro do limite
  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];

  titulo.textContent = formatarData(pagina.date);

  if (pagina.contents.length === 0) {
    conteudoDiv.innerHTML = '<p>Sem conteúdos nesta data.</p>';
  } else {
    // Agora com lixeira à esquerda e fundo azul claro
    conteudoDiv.innerHTML = pagina.contents.map((conteudo, index) =>
      `<div class="conteudo-item">
        <button class="btn-excluir" title="Excluir" onclick="excluirConteudo(${index})">
          <i class="fa-solid fa-trash"></i>
        </button>
        <span class="conteudo-text">${conteudo}</span>
      </div>`
    ).join('');
  }
}

function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `Adicionar ${tipo}`;
  document.getElementById('modal-text').value = '';
  document.getElementById('modal-date').value = pagesData.length > 0 ? pagesData[currentPageIndex].date : '';
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
}

function confirmarAdicao() {
  const data = document.getElementById('modal-date').value;
  const texto = document.getElementById('modal-text').value.trim();
  if (!data || !texto) {
    alert('Por favor, preencha a data e o texto.');
    return;
  }

  // Procura se já existe a página da data
  let pagina = pagesData.find(p => p.date === data);
  if (!pagina) {
    // Cria nova página se não existir
    pagina = { date: data, contents: [] };
    pagesData.push(pagina);
    // Ajusta o currentPageIndex para a nova página (ordenada depois)
    pagesData.sort((a,b) => a.date.localeCompare(b.date));
    currentPageIndex = pagesData.findIndex(p => p.date === data);
  }

  // Adiciona o conteúdo, com prefixo do tipo
  pagina.contents.push(`${tipoAtual}: ${texto}`);

  fecharModal();
  renderPage();
}

function excluirConteudo(index) {
  const pagina = pagesData[currentPageIndex];
  if (pagina) {
    pagina.contents.splice(index, 1);
    renderPage();
  }
}

function avancarPagina() {
  if (currentPageIndex < pagesData.length - 1) {
    currentPageIndex++;
    renderPage();
  }
}

function voltarPagina() {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    renderPage();
  }
}

window.onload = () => {
  renderPage();
};