let pagesData = [];
let currentPageIndex = 0;
let tipoAtual = "";

function formatarData(dataStr) {
  const d = new Date(dataStr + "T00:00:00");
  return d
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function renderPage() {
  const titulo = document.getElementById("data-titulo");
  const conteudoDiv = document.getElementById("conteudo-pagina");

  if (pagesData.length === 0) {
    titulo.textContent = "Nenhuma data adicionada";
    conteudoDiv.innerHTML = "<p>Adicione um recado, evento ou foto para começar.</p>";
    return;
  }

  pagesData.sort((a, b) => a.date.localeCompare(b.date));

  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  if (!pagina.contents || pagina.contents.length === 0) {
    conteudoDiv.innerHTML = "<p>Sem conteúdos nesta data.</p>";
  } else {
    conteudoDiv.innerHTML = pagina.contents
      .map(
        (conteudo) =>
          `<div class="conteudo-item"><span class="conteudo-text">${conteudo}</span></div>`
      )
      .join("");
  }
}

function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById("modal-title").textContent = `Adicionar ${tipo}`;
  document.getElementById("modal-text").value = "";
  document.getElementById("modal-date").value =
    pagesData.length > 0 ? pagesData[currentPageIndex].date : "";
  document.getElementById("modal-bg").classList.add("active");
  document.getElementById("modal-date").focus();
}

function fecharModal() {
  document.getElementById("modal-bg").classList.remove("active");
}

function confirmarAdicao() {
  const data = document.getElementById("modal-date").value;
  const texto = document.getElementById("modal-text").value.trim();
  if (!data || !texto) {
    alert("Por favor, preencha a data e o texto.");
    return;
  }

  if (!alunoId) {
    alert("Aluno não identificado.");
    return;
  }

  fetch("/agenda/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo: tipoAtual, texto, data, alunoId }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.sucesso) {
        let pagina = pagesData.find((p) => p.date === data);
        if (!pagina) {
          pagina = { date: data, contents: [] };
          pagesData.push(pagina);
          pagesData.sort((a, b) => a.date.localeCompare(b.date));
          currentPageIndex = pagesData.findIndex((p) => p.date === data);
        }
        pagina.contents.push(`${tipoAtual}: ${texto}`);
        fecharModal();
        renderPage();
      } else {
        alert("Erro ao adicionar conteúdo");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao conectar ao servidor");
    });
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
  if (!alunoId) {
    alert("Aluno não identificado.");
    return;
  }
  fetch(`/agenda/dados?alunoId=${alunoId}&data=${new Date().toISOString().slice(0, 10)}`)
    .then((res) => res.json())
    .then((data) => {
      // Monta a estrutura da página atual
      const contents = [];
      if (data.recados) {
        contents.push(...data.recados.split("\n").map((r) => "Recado: " + r));
      }
      if (data.eventos) {
        contents.push(...data.eventos.split("\n").map((e) => "Evento: " + e));
      }
      if (data.fotoDesc) {
        contents.push("Foto: " + data.fotoDesc);
      }

      pagesData = [{ date: new Date().toISOString().slice(0, 10), contents }];
      currentPageIndex = 0;
      renderPage();
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao carregar agenda do servidor");
    });
};
