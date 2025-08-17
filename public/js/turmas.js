document.addEventListener("DOMContentLoaded", () => {
  const conteudoPagina = document.getElementById("conteudo-pagina");
  const dataTitulo = document.getElementById("data-titulo");

  let currentPageIndex = 0;
  let pagesData = window.pagesData || [];
  const agendaId = window.agendaId;

  // ----------------- FUNÇÕES DE RENDER -----------------
  function renderizarRecadosEventos() {
    if (!pagesData.length) {
      conteudoPagina.innerHTML = "<p>Adicione um recado, evento ou foto para começar.</p>";
      dataTitulo.textContent = "Nenhuma data selecionada";
      return;
    }

    // Ajusta index caso fora do range
    if (currentPageIndex < 0) currentPageIndex = 0;
    if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

    const page = pagesData[currentPageIndex];
    conteudoPagina.innerHTML = "";

    const diaDiv = document.createElement("div");
    diaDiv.className = "dia-recados";

    const h4 = document.createElement("h4");
    h4.textContent = page.date;
    diaDiv.appendChild(h4);

    page.contents.forEach(item => {
      const p = document.createElement("p");
      p.textContent = `[${item.tipo}] ${item.descricao}`;
      diaDiv.appendChild(p);
    });

    conteudoPagina.appendChild(diaDiv);
    dataTitulo.textContent = page.date;
  }

  // ----------------- NAVEGAÇÃO -----------------
  window.voltarPagina = function() {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderizarRecadosEventos();
    }
  };

  window.avancarPagina = function() {
    if (currentPageIndex < pagesData.length - 1) {
      currentPageIndex++;
      renderizarRecadosEventos();
    }
  };

  // ----------------- MODAL -----------------
  const modal = document.getElementById("modal-bg");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const modalDate = document.getElementById("modal-date");

  window.abrirModal = function(tipo) {
    modal.style.display = "flex";
    modalTitle.textContent = tipo;
    modalText.value = "";
    modalDate.value = new Date().toISOString().split("T")[0];
  };

  window.fecharModal = function() {
    modal.style.display = "none";
  };

  window.confirmarAdicao = function() {
    const tipo = modalTitle.textContent;
    const descricao = modalText.value.trim();
    const data = modalDate.value;

    if (!descricao || !data) return alert("Preencha data e descrição");

    adicionarItem(tipo, descricao, data);
    fecharModal();
  };

  // ----------------- ADICIONAR ITEM -----------------
  function adicionarItem(tipo, descricao, data) {
    if (!agendaId) return alert("Agenda não definida");

    const url = tipo === "Recado" ? "/agenda/adicionar-recado" : "/agenda/adicionar-evento";

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao, data, agenda_id: agendaId })
    })
    .then(res => res.json())
    .then(res => {
      if (res.sucesso) {
        let page = pagesData.find(p => p.date === data);
        if (!page) {
          page = { date: data, contents: [] };
          pagesData.push(page);
          // Ordena as datas
          pagesData.sort((a, b) => a.date.localeCompare(b.date));
        }
        page.contents.push({ tipo, descricao, cod: res.id });

        // Atualiza índice para a nova data
        currentPageIndex = pagesData.findIndex(p => p.date === data);
        renderizarRecadosEventos();
      } else {
        alert("Erro ao adicionar item");
      }
    })
    .catch(err => console.error(err));
  }

  // ----------------- INICIALIZAÇÃO -----------------
  renderizarRecadosEventos();
});
