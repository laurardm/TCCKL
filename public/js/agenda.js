// Variáveis globais para controle da página atual, tipo de conteúdo e edição ativa
let currentPageIndex = 0;
let tipoAtual = '';
window.edicaoAtiva = null;

// Garante que a estrutura window.pagesData exista para armazenar os dados das páginas
window.pagesData = window.pagesData || [];

// Função que formata a data para o formato brasileiro e deixa a primeira letra maiúscula
function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',  // dia da semana por extenso
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase()); // deixa a primeira letra maiúscula
}

// Função que renderiza a página atual com título e conteúdos
function renderPage() {
  const titulo = document.getElementById('data-titulo');
  const conteudoDiv = document.getElementById('conteudo-pagina');

  // Se não houver dados, mostra mensagem padrão
  if (!window.pagesData || window.pagesData.length === 0) {
    titulo.textContent = 'Nenhuma data adicionada';
    conteudoDiv.innerHTML = '<p>Adicione um recado, evento ou foto para começar.</p>';
    return;
  }

  // Ordena os dados pela data para exibir em ordem cronológica
  window.pagesData.sort((a, b) => a.date.localeCompare(b.date));

  // Garante que o índice da página atual esteja dentro do intervalo válido
  if (currentPageIndex >= window.pagesData.length) currentPageIndex = window.pagesData.length - 1;
  if (currentPageIndex < 0) currentPageIndex = 0;

  const pagina = window.pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  // Se a página não tem conteúdos, mostra mensagem específica
  if (!pagina.contents || pagina.contents.length === 0) {
    conteudoDiv.innerHTML = '<p>Sem conteúdos nesta data.</p>';
  } else {
    // Monta o HTML dos conteúdos, cada um com botão para editar e descrição
    conteudoDiv.innerHTML = pagina.contents.map((conteudo, index) => `
      <div class="conteudo-item">
        <button class="btn-editar" onclick="editarConteudo(${index})" title="Editar">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <span class="conteudo-text">${conteudo.tipo}: ${conteudo.descricao}</span>
      </div>
    `).join('');
  }
}

// Função que abre o modal para adicionar ou editar um conteúdo, definindo título e campos
function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `${window.edicaoAtiva ? 'Editar' : 'Adicionar'} ${tipo}`;
  document.getElementById('modal-text').value = window.edicaoAtiva ? window.edicaoAtiva.descricao : '';
  document.getElementById('modal-date').value = window.edicaoAtiva ? window.edicaoAtiva.data : (window.pagesData.length > 0 ? window.pagesData[currentPageIndex].date : '');
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

// Função que fecha o modal e reseta a edição ativa
function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
  window.edicaoAtiva = null;
}

// Função que confirma a adição ou edição do conteúdo, fazendo requisição ao backend
function confirmarAdicao() {
  console.log('Agenda ID:', window.agendaId);

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
    // Caso seja edição de conteúdo existente
    let url = '';
    if (tipoAtual === 'Recado') url = `/agenda/recados/${window.edicaoAtiva.cod}`;
    else if (tipoAtual === 'Evento') url = `/agenda/eventos/${window.edicaoAtiva.cod}`;
    else {
      alert('Edição deste tipo não suportada.');
      fecharModal();
      return;
    }

    // Requisição PUT para editar o conteúdo
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: texto })
    })
      .then(res => res.json())
      .then(json => {
        if (json.message) {
          // Atualiza localmente o texto do conteúdo editado
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
    // Caso seja adição de novo conteúdo
    let url = '';
    if (tipoAtual === 'Recado') url = '/agenda/adicionar-recado';
    else if (tipoAtual === 'Evento') url = '/agenda/adicionar-evento';
    else {
      alert('Adição deste tipo não suportada.');
      fecharModal();
      return;
    }

    // Requisição POST para adicionar conteúdo
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: texto, data, agenda_id: Number(window.agendaId) })
    })
      .then(res => res.json())
      .then(json => {
        if (json.sucesso) {
          // Atualiza localmente os dados adicionando novo conteúdo
          let pagina = window.pagesData.find(p => p.date === data);
          if (!pagina) {
            pagina = { date: data, contents: [] };
            window.pagesData.push(pagina);
            window.pagesData.sort((a, b) => a.date.localeCompare(b.date));
            currentPageIndex = window.pagesData.findIndex(p => p.date === data);
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

// Função que inicia a edição de um conteúdo específico da página atual
function editarConteudo(index) {
  const pagina = window.pagesData[currentPageIndex];
  if (!pagina || !pagina.contents[index]) return;

  const conteudo = pagina.contents[index];
  tipoAtual = conteudo.tipo;

  // Define o conteúdo ativo para edição, com índice, data, código e descrição
  window.edicaoAtiva = {
    index,
    data: pagina.date,
    cod: conteudo.cod,
    descricao: conteudo.descricao
  };

  abrirModal(tipoAtual);
}

// Função para avançar uma página na agenda, se possível
function avancarPagina() {
  if (currentPageIndex < window.pagesData.length - 1) {
    currentPageIndex++;
    renderPage();
  }
}

// Função para voltar uma página na agenda, se possível
function voltarPagina() {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    renderPage();
  }
}

// Quando a página carrega, exibe a página inicial da agenda e imprime dados no console para debug
window.onload = () => {
  console.log('Agenda ID ao carregar:', window.agendaId);
  console.log('Pages Data ao carregar:', window.pagesData);
  renderPage();
};
