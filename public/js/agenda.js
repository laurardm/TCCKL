document.addEventListener("DOMContentLoaded", () => {
  const conteudoPagina = document.getElementById("conteudo-pagina");
  const dataTitulo = document.getElementById("data-titulo");
  const modalBg = document.getElementById("modal-bg");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalDate = document.getElementById("modal-date");

  let currentPageIndex = 0;
  let tipoAtual = '';
  window.edicaoAtiva = null;
  let pagesData = window.pagesData || [];
  const agendaId = window.agendaId;

  // ===================
  // FORMATAÇÃO DE DATAS
  // ===================
  function formatarData(dataStr) {
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  }

  // ===================
  // RENDERIZAÇÃO DA PÁGINA
  // ===================
  function renderPage() {
    if (!pagesData || pagesData.length === 0) {
      dataTitulo.textContent = "Nenhuma data adicionada";
      conteudoPagina.innerHTML = "<p>Adicione um recado, evento ou foto para começar.</p>";
      return;
    }

    // Ordena por data
    pagesData.sort((a, b) => a.date.localeCompare(b.date));

    // Garante índice válido
    if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;
    if (currentPageIndex < 0) currentPageIndex = 0;

    const pagina = pagesData[currentPageIndex];
    dataTitulo.textContent = formatarData(pagina.date);

    if (!pagina.contents || pagina.contents.length === 0) {
      conteudoPagina.innerHTML = "<p>Sem conteúdos nesta data.</p>";
    } else {
      conteudoPagina.innerHTML = pagina.contents.map((conteudo, index) => `
        <div class="conteudo-item">
          <button class="btn-editar" onclick="editarConteudo(${index})" title="Editar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <span class="conteudo-text">${conteudo.tipo}: ${conteudo.descricao}</span>
        </div>
      `).join('');
    }
  }

  // ===================
  // MODAL
  // ===================
  window.abrirModal = function(tipo) {
    tipoAtual = tipo;
    modalTitle.textContent = `${window.edicaoAtiva ? 'Editar' : 'Adicionar'} ${tipo}`;
    modalText.value = window.edicaoAtiva ? window.edicaoAtiva.descricao : '';
    modalDate.value = window.edicaoAtiva ? window.edicaoAtiva.data :
                      (pagesData.length > 0 ? pagesData[currentPageIndex].date : '');
    document.querySelector('.modal-buttons button').textContent = window.edicaoAtiva ? 'Salvar' : 'Adicionar';
    modalBg.classList.add('active');
    modalDate.focus();
  };

  window.fecharModal = function() {
    modalBg.classList.remove('active');
    window.edicaoAtiva = null;
  };

  // ===================
  // CONFIRMAR ADIÇÃO/EDIÇÃO
  // ===================
  window.confirmarAdicao = function() {
    if (!agendaId) {
      alert("Agenda do aluno não definida.");
      return;
    }

    const data = modalDate.value;
    const descricao = modalText.value.trim();
    if (!data || !descricao) return alert("Preencha data e descrição");

    if (window.edicaoAtiva) {
      // Edição
      let url = tipoAtual === "Recado" ? `/agenda/recados/${window.edicaoAtiva.cod}` :
                tipoAtual === "Evento" ? `/agenda/eventos/${window.edicaoAtiva.cod}` : null;
      if (!url) return alert("Edição deste tipo não suportada.");

      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
      })
      .then(res => res.json())
      .then(json => {
        if (json.message) {
          const pagina = pagesData.find(p => p.date === window.edicaoAtiva.data);
          if (pagina) pagina.contents[window.edicaoAtiva.index].descricao = descricao;
          fecharModal();
          renderPage();
        } else alert("Erro ao editar.");
      })
      .catch(err => { console.error(err); alert("Erro ao conectar."); });

    } else {
      // Adição
      let url = tipoAtual === "Recado" ? "/agenda/adicionar-recado" :
                tipoAtual === "Evento" ? "/agenda/adicionar-evento" : null;
      if (!url) return alert("Adição deste tipo não suportada.");

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, data, agenda_id: Number(agendaId) })
      })
      .then(res => res.json())
      .then(json => {
        if (json.sucesso) {
          let pagina = pagesData.find(p => p.date === data);
          if (!pagina) {
            pagina = { date: data, contents: [] };
            pagesData.push(pagina);
            pagesData.sort((a, b) => a.date.localeCompare(b.date));
          }
          pagina.contents.push({ tipo: tipoAtual, descricao, cod: json.id });
          currentPageIndex = pagesData.findIndex(p => p.date === data);
          fecharModal();
          renderPage();
        } else alert("Erro ao adicionar.");
      })
      .catch(err => { console.error(err); alert("Erro ao conectar."); });
    }
  };

  // ===================
  // EDITAR CONTEÚDO
  // ===================
  window.editarConteudo = function(index) {
    const pagina = pagesData[currentPageIndex];
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
  };

  // ===================
  // NAVEGAÇÃO
  // ===================
  window.avancarPagina = function() {
    if (currentPageIndex < pagesData.length - 1) {
      currentPageIndex++;
      renderPage();
    }
  };

  window.voltarPagina = function() {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderPage();
    }
  };

  // ===================
  // INICIALIZAÇÃO
  // ===================
  renderPage();
});
