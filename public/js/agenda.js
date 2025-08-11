let currentPageIndex = 0;
let tipoAtual = '';
window.edicaoAtiva = null;

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

  const pagina = window.pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  if (!pagina.contents || pagina.contents.length === 0) {
    conteudoDiv.innerHTML = '<p>Sem conteúdos nesta data.</p>';
  } else {
    conteudoDiv.innerHTML = pagina.contents.map((conteudo, index) => `
      <div class="conteudo-item">
        <button class="btn-editar" onclick="editarConteudo(${index})">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <span class="conteudo-text">${conteudo.tipo}: ${conteudo.descricao}</span>
      </div>
    `).join('');
  }
}

function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `${window.edicaoAtiva ? 'Editar' : 'Adicionar'} ${tipo}`;
  document.getElementById('modal-text').value = window.edicaoAtiva ? window.edicaoAtiva.descricao : '';
  document.getElementById('modal-date').value = window.edicaoAtiva ? window.edicaoAtiva.data : (window.pagesData.length > 0 ? window.pagesData[currentPageIndex].date : '');
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
  window.edicaoAtiva = null;
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

  if (window.edicaoAtiva) {
    // EDIÇÃO
    let url = '';
    if (tipoAtual === 'Recado') url = `/agenda/recados/${window.edicaoAtiva.cod}`;
    else if (tipoAtual === 'Evento') url = `/agenda/eventos/${window.edicaoAtiva.cod}`;

    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: texto })
    })
      .then(res => res.json())
      .then(json => {
        if (json.message) {
          const pagina = window.pagesData.find(p => p.date === window.edicaoAtiva.data);
          if (pagina) pagina.contents[window.edicaoAtiva.index].descricao = texto;
          fecharModal();
          renderPage();
        } else {
          alert('Erro ao editar.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao conectar.');
      });

  } else {
    // ADIÇÃO
    let url = '';
    if (tipoAtual === 'Recado') url = '/agenda/adicionar-recado';
    else if (tipoAtual === 'Evento') url = '/agenda/adicionar-evento';

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: texto, data, agenda_id: window.agendaId })
    })
      .then(res => res.json())
      .then(json => {
        if (json.sucesso) {
          let pagina = window.pagesData.find(p => p.date === data);
          if (!pagina) {
            pagina = { date: data, contents: [] };
            window.pagesData.push(pagina);
          }
          pagina.contents.push({ tipo: tipoAtual, descricao: texto, cod: json.id });
          fecharModal();
          renderPage();
        } else {
          alert('Erro ao adicionar.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao conectar.');
      });
  }
}

function editarConteudo(index) {
  const pagina = window.pagesData[currentPageIndex];
  if (!pagina || !pagina.contents[index]) return;

  const conteudo = pagina.contents[index];
  tipoAtual = conteudo.tipo;

  window.edicaoAtiva = {
    index,
    data: pagina.date,
    cod: conteudo.cod,
    descricao: conteudo.descricao
  };

  abrirModal(tipoAtual);
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

window.onload = renderPage;
