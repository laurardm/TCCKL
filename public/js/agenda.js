const agendaElem = document.getElementById('agenda-data');
let rawAgendaId = null;
let rawPages = '[]';

if (agendaElem) {
  rawAgendaId = agendaElem.getAttribute('data-agenda-id');
  rawPages = agendaElem.getAttribute('data-recados') || '[]';
}

window.agendaId = rawAgendaId ? Number(rawAgendaId) : null;

try {
  window.pagesData = JSON.parse(rawPages);
  if (!Array.isArray(window.pagesData)) window.pagesData = [];
} catch (e) {
  console.warn('Erro ao fazer parse de recadosEventos:', e);
  window.pagesData = [];
}

let currentPageIndex = 0;
let tipoAtual = '';

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());
}

function renderPage() {
  const titulo = document.getElementById('data-titulo');
  const conteudoDiv = document.getElementById('conteudo-pagina');

  if (!window.pagesData || window.pagesData.length === 0) {
    titulo.textContent = 'Nenhuma data adicionada';
    conteudoDiv.innerHTML = '<p>Adicione um recado, evento ou foto para começar.</p>';
    return;
  }

  window.pagesData.sort((a, b) => a.date.localeCompare(b.date));

  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= window.pagesData.length) currentPageIndex = window.pagesData.length - 1;

  const pagina = window.pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  if (!pagina.contents || pagina.contents.length === 0) {
    conteudoDiv.innerHTML = '<p>Sem conteúdos nesta data.</p>';
  } else {
    conteudoDiv.innerHTML = pagina.contents.map((conteudo, index) => `
      <div class="conteudo-item">
        <button class="btn-editar" title="Editar" onclick="editarConteudo(${index})">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <span class="conteudo-text">${conteudo}</span>
      </div>
    `).join('');
  }
}

function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `Adicionar ${tipo}`;
  document.getElementById('modal-text').value = '';
  document.getElementById('modal-date').value =
    window.pagesData.length > 0 ? window.pagesData[currentPageIndex].date : '';
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
}

function confirmarAdicao() {
  if (!window.agendaId) {
    alert('Agenda do aluno não definida.');
    return;
  }

  const data = document.getElementById('modal-date').value;
  const texto = document.getElementById('modal-text').value.trim();
  if (!data || !texto) {
    alert('Por favor, preencha a data e o texto.');
    return;
  }

  let url = '';
  if (tipoAtual === 'Recado') url = '/agenda/adicionar-recado';
  else if (tipoAtual === 'Evento') url = '/agenda/adicionar-evento';
  else {
    alert('Tipo inválido');
    return;
  }

  const isEdicao = window.edicaoAtiva !== undefined;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descricao: texto, data, agenda_id: window.agendaId })
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.sucesso) {
        // Remover antigo se for edição
        if (isEdicao) {
          const { index, data: dataAntiga } = window.edicaoAtiva;
          const paginaAntiga = window.pagesData.find((p) => p.date === dataAntiga);
          if (paginaAntiga && paginaAntiga.contents[index]) {
            paginaAntiga.contents.splice(index, 1);

            if (paginaAntiga.contents.length === 0) {
              const idx = window.pagesData.findIndex((p) => p.date === dataAntiga);
              if (idx > -1) window.pagesData.splice(idx, 1);
              if (currentPageIndex >= window.pagesData.length) currentPageIndex = window.pagesData.length - 1;
            }
          }
          delete window.edicaoAtiva;
        }

        let pagina = window.pagesData.find((p) => p.date === data);
        if (!pagina) {
          pagina = { date: data, contents: [] };
          window.pagesData.push(pagina);
          window.pagesData.sort((a, b) => a.date.localeCompare(b.date));
          currentPageIndex = window.pagesData.findIndex((p) => p.date === data);
        }

        pagina.contents.push(`${tipoAtual}: ${texto}`);
        fecharModal();
        renderPage();
      } else {
        alert('Erro ao salvar: ' + (json.erro || ''));
      }
    })
    .catch((err) => {
      console.error(err);
      alert('Erro ao conectar');
    });
}

function editarConteudo(index) {
  const pagina = window.pagesData[currentPageIndex];
  if (!pagina || !pagina.contents[index]) return;

  const conteudoCompleto = pagina.contents[index];
  const [tipo, ...descricaoArr] = conteudoCompleto.split(':');
  const descricao = descricaoArr.join(':').trim();

  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `Editar ${tipoAtual}`;
  document.getElementById('modal-text').value = descricao;
  document.getElementById('modal-date').value = pagina.date;

  window.edicaoAtiva = { index, data: pagina.date };

  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function avancarPagina() {
  if (currentPageIndex < window.pagesData.length - 1) {
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
