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

  // ====== Formatar data ======
  function formatarData(dataStr) {
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
             .replace(/^\w/, c => c.toUpperCase());
  }

  // ====== Renderizar página ======
  function renderPage() {
    if (!pagesData || pagesData.length === 0) {
      dataTitulo.textContent = "Nenhuma data adicionada";
      conteudoPagina.innerHTML = "<p>Adicione um recado, evento ou foto para começar.</p>";
      return;
    }

    pagesData.sort((a, b) => a.date.localeCompare(b.date));
    if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;
    if (currentPageIndex < 0) currentPageIndex = 0;

    const pagina = pagesData[currentPageIndex];
    dataTitulo.textContent = formatarData(pagina.date);

    if (!pagina.contents || pagina.contents.length === 0) {
      conteudoPagina.innerHTML = "<p>Sem conteúdos nesta data.</p>";
      return;
    }

    conteudoPagina.innerHTML = '';
    pagina.contents.forEach((conteudo, index) => {
      const divItem = document.createElement('div');
      divItem.className = 'conteudo-item';

      // Texto ou imagem
      const divTexto = document.createElement('div');
      divTexto.className = 'conteudo-text';
      if (conteudo.tipo === 'Foto') {
        const img = document.createElement('img');
        img.src = conteudo.descricao;
        img.className = 'foto-conteudo';
        divTexto.appendChild(img);
      } else {
        divTexto.textContent = `${conteudo.tipo}: ${conteudo.descricao}`;
      }
      divItem.appendChild(divTexto);

      // Botões (Editar / Excluir) para funcionários
      if (window.tipoUsuario === 'funcionario') {
        const divBotoes = document.createElement('div');
        divBotoes.className = 'botao-group';
        divBotoes.style.display = 'flex';
        divBotoes.style.gap = '5px';

        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        btnEditar.onclick = () => editarConteudo(index);

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn-excluir';
        btnExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnExcluir.onclick = () => excluirConteudo(index);

        divBotoes.appendChild(btnEditar);
        divBotoes.appendChild(btnExcluir);
        divItem.appendChild(divBotoes);
      }

      conteudoPagina.appendChild(divItem);
    });
  }

  // ====== Abrir modal ======
  window.abrirModal = function(tipo) {
    if (window.tipoUsuario !== "funcionario") return; 
    tipoAtual = tipo;

    modalTitle.textContent = `${window.edicaoAtiva ? 'Editar' : 'Adicionar'} ${tipo}`;
    modalText.value = window.edicaoAtiva ? window.edicaoAtiva.descricao : '';
    modalDate.value = window.edicaoAtiva ? window.edicaoAtiva.data :
                      (pagesData.length > 0 ? pagesData[currentPageIndex].date : '');
    document.querySelector('.modal-buttons button').textContent = window.edicaoAtiva ? 'Salvar' : 'Adicionar';

    // Fotos
    if(tipo === "Foto") {
      modalText.style.display = "none"; 
      let fileInput = document.getElementById("modal-file");
      if(!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "modal-file";
        fileInput.accept = "image/*";
        modalDate.parentNode.insertBefore(fileInput, modalDate.nextSibling);
      } else {
        fileInput.style.display = "block";
      }
    } else {
      modalText.style.display = "block";
      const fileInput = document.getElementById("modal-file");
      if(fileInput) fileInput.style.display = "none";
    }

    modalBg.classList.add('active');
    modalDate.focus();
  };

  // ====== Fechar modal ======
  window.fecharModal = function() {
    modalBg.classList.remove('active');
    window.edicaoAtiva = null;
  };

  // ====== Confirmar adição/edição ======
  window.confirmarAdicao = function() {
    if (!agendaId) { alert("Agenda do aluno não definida."); return; }
    const data = modalDate.value;
    if (!data) return alert("Preencha a data");

    if(tipoAtual === "Foto") {
      const fileInput = document.getElementById("modal-file");
      if(!fileInput || !fileInput.files[0]) return alert("Selecione uma imagem.");

      const formData = new FormData();
      formData.append("imagem", fileInput.files[0]);
      formData.append("data", data);
      formData.append("agenda_id", Number(agendaId));

      fetch("/agenda/adicionar-foto", { method: "POST", body: formData })
        .then(res => res.json())
        .then(json => {
          if(json.sucesso) {
            let pagina = pagesData.find(p => p.date === data);
            if(!pagina) {
              pagina = { date: data, contents: [] };
              pagesData.push(pagina);
              pagesData.sort((a,b) => a.date.localeCompare(b.date));
            }
            pagina.contents.push({ tipo: "Foto", descricao: json.url, cod: json.id });
            currentPageIndex = pagesData.findIndex(p => p.date === data);
            fecharModal();
            renderPage();
          } else alert("Erro ao adicionar imagem.");
        })
        .catch(err => { console.error(err); alert("Erro ao conectar."); });

    } else {
      const descricao = modalText.value.trim();
      if (!descricao) return alert("Preencha descrição");

      if (window.edicaoAtiva) {
        let url = tipoAtual === "Recado" ? `/agenda/recados/${window.edicaoAtiva.cod}` :
                  tipoAtual === "Evento" ? `/agenda/eventos/${window.edicaoAtiva.cod}` : null;
        if (!url) return alert("Edição deste tipo não suportada.");

        fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ descricao }) })
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
        let url = tipoAtual === "Recado" ? "/agenda/adicionar-recado" :
                  tipoAtual === "Evento" ? "/agenda/adicionar-evento" : null;
        if (!url) return alert("Adição deste tipo não suportada.");

        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ descricao, data, agenda_id: Number(agendaId) }) })
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
    }
  };

  // ====== Editar conteúdo ======
  window.editarConteudo = function(index) {
    const pagina = pagesData[currentPageIndex];
    if (!pagina || !pagina.contents[index]) return;
    const conteudo = pagina.contents[index];
    tipoAtual = conteudo.tipo;
    window.edicaoAtiva = { index, data: pagina.date, cod: conteudo.cod, descricao: conteudo.descricao };
    abrirModal(tipoAtual);
  };

  // ====== Excluir conteúdo ======
  window.excluirConteudo = function(index) {
    const pagina = pagesData[currentPageIndex];
    if (!pagina || !pagina.contents[index]) return;
    const conteudo = pagina.contents[index];

    fetch(`/agenda/${conteudo.tipo.toLowerCase()}s/${conteudo.cod}`, { method: "DELETE" })
      .then(res => res.ok ? res.json() : res.text().then(t => Promise.reject(t)))
      .then(() => {
        pagina.contents.splice(index, 1);
        if(pagina.contents.length === 0 && pagesData.length > 1) {
          pagesData.splice(currentPageIndex,1);
          currentPageIndex = Math.max(0, currentPageIndex -1);
        }
        renderPage();
      })
      .catch(err => { console.error(err); alert("Erro ao excluir item."); });
  };

  // ====== Navegação ======
  window.avancarPagina = function() { if (currentPageIndex < pagesData.length - 1) { currentPageIndex++; renderPage(); } };
  window.voltarPagina = function() { if (currentPageIndex > 0) { currentPageIndex--; renderPage(); } };

  // ====== Inicializar ======
  renderPage();
});
