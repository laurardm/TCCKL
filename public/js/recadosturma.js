let currentPageIndex = 0;
let editIndex = null;

function formatarData(dataStr) {
  const d = new Date(dataStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).replace(/^\w/, c => c.toUpperCase());
}

function renderPage() {
  const titulo = document.getElementById("data-titulo");
  const conteudoDiv = document.getElementById("conteudo-pagina");

  if (!pagesData || pagesData.length === 0) {
    titulo.textContent = "Nenhuma data adicionada";
    conteudoDiv.innerHTML = "<p>Nenhum recado cadastrado ainda.</p>";
    return;
  }

  // Ordenar por data
  pagesData.sort((a, b) => a.data.localeCompare(b.data));
  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.data);

  conteudoDiv.innerHTML = `
    <div class="conteudo-item">
      <span class="conteudo-text">${pagina.texto}</span>
      <div class="botao-group">
        <form action="/turmas/${document.body.dataset.nomeTurma}/recados/${pagina.cod}/delete" method="POST" style="display:inline;">
          <button type="submit" class="btn-excluir" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </form>
        <button class="btn-editar" onclick="abrirModalEditar('${pagina.cod}', '${pagina.data}', '${pagina.texto}')" title="Editar">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>
    </div>
  `;
}

function abrirModalRecado() {
  editIndex = null;
  document.getElementById("modal-title").textContent = "Adicionar recado";
  document.getElementById("modal-text").value = "";
  document.getElementById("modal-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("modal-bg").classList.add("active");
}

function fecharModal() {
  document.getElementById("modal-bg").classList.remove("active");
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

function mostrarAlerta(msg) {
  document.getElementById("alerta-msg").textContent = msg;
  document.getElementById("alerta-bg").style.display = "flex";
}

function fecharAlerta() {
  document.getElementById("alerta-bg").style.display = "none";
}

function abrirModalEditar(cod, data, texto) {
  const nomeTurma = document.body.dataset.nomeTurma;

  document.getElementById("modal-title").textContent = "Editar recado";
  document.getElementById("modal-date").value = data.split("T")[0];
  document.getElementById("modal-text").value = texto;

  const form = document.getElementById("modal-form");
  form.action = `/turmas/${nomeTurma}/recados/${cod}/edit`;

  document.getElementById("modal-bg").classList.add("active");
}

window.onload = () => {
  renderPage();
};
