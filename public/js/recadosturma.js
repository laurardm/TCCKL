let currentPageIndex = 0;

// Formata data
function formatarData(dataStr) {
  const d = new Date(dataStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
          .replace(/^\w/, c => c.toUpperCase());
}

// Renderiza recados da página atual
function renderPage() {
  const titulo = document.getElementById("data-titulo");
  const conteudoDiv = document.getElementById("conteudo-pagina");

  if (!pagesData || pagesData.length === 0) {
    titulo.textContent = "Nenhuma data adicionada";
    conteudoDiv.innerHTML = "<p>Nenhum recado cadastrado ainda.</p>";
    return;
  }

  pagesData.sort((a, b) => a.data.localeCompare(b.data));
  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.data);

  const tipoUsuario = document.body.dataset.usuario;

  let editarExcluir = "";
  if(tipoUsuario === "funcionario") {
    editarExcluir = `
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
    `;
  }

  conteudoDiv.innerHTML = `<div class="conteudo-item">
    <span class="conteudo-text">${pagina.texto}</span>
    ${editarExcluir}
  </div>`;
}

// Modal adicionar recado
function abrirModalRecado() {
  const tipoUsuario = document.body.dataset.usuario;
  if(tipoUsuario !== "funcionario") return;

  document.getElementById("modal-title").textContent = "Adicionar recado";
  document.getElementById("modal-text").value = "";
  document.getElementById("modal-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("modal-bg").classList.add("active");

  // Garante que o form envia para o endpoint de adicionar
  const form = document.getElementById("modal-form");
  form.action = `/turmas/${document.body.dataset.nomeTurma}/recados/add`;
}

function abrirModalEditar(cod, data, texto) {
  const tipoUsuario = document.body.dataset.usuario;
  if(tipoUsuario !== "funcionario") return;

  document.getElementById("modal-title").textContent = "Editar recado";
  document.getElementById("modal-date").value = data.split("T")[0];
  document.getElementById("modal-text").value = texto;

  const form = document.getElementById("modal-form");
  form.action = `/turmas/${document.body.dataset.nomeTurma}/recados/${cod}/edit`;

  document.getElementById("modal-bg").classList.add("active");
}

function fecharModal() { document.getElementById("modal-bg").classList.remove("active"); }
function fecharAlerta() { document.getElementById("alerta-bg").style.display = "none"; }

function avancarPagina() { if(currentPageIndex < pagesData.length -1){ currentPageIndex++; renderPage(); } }
function voltarPagina() { if(currentPageIndex > 0){ currentPageIndex--; renderPage(); } }

// Mostra o alerta com uma mensagem
function mostrarAlerta(mensagem, tipo = "sucesso") {
  const alertaBg = document.getElementById("alerta-bg");
  const alertaMsg = document.getElementById("alerta-msg");
  
  alertaMsg.textContent = mensagem;

  // Adiciona classe de sucesso ou erro
  const alertaBox = alertaBg.querySelector(".alerta-box");
  alertaBox.classList.remove("success", "error");
  alertaBox.classList.add(tipo);

  alertaBg.style.display = "flex";
}

// Exemplo: chamar quando o recado for adicionado com sucesso
function recadoAdicionadoComSucesso() {
  mostrarAlerta("Recado adicionado com sucesso!", "sucesso");
}

// Intercepta o envio do formulário do modal
document.getElementById("modal-form").addEventListener("submit", function(e) {
  e.preventDefault(); // impede reload da página

  const form = e.target;
  const data = form.querySelector("#modal-date").value;
  const texto = form.querySelector("#modal-text").value;

  // Gera um cod temporário
  const cod = Date.now();

  // Adiciona ao array pagesData (substitua por requisição real se quiser)
  pagesData.push({ cod, data, texto });

  // Fecha modal
  fecharModal();

  // Vai para a última página adicionada
  currentPageIndex = pagesData.length - 1;
  renderPage();

  // Mostra alerta de sucesso
  recadoAdicionadoComSucesso();
});

window.onload = () => {
  renderPage();
};
