let currentPageIndex = 0;

// === Funções utilitárias ===
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

// === Renderiza página atual de recados ===
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

  if (tipoUsuario === "funcionario") {
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

  conteudoDiv.innerHTML = `
    <div class="conteudo-item">
      <span class="conteudo-text">${pagina.texto}</span>
      ${editarExcluir}
    </div>
  `;
}

// === Modal adicionar recado ===
function abrirModalRecado() {
  const tipoUsuario = document.body.dataset.usuario;
  if (tipoUsuario !== "funcionario") return;

  document.getElementById("modal-title").textContent = "Adicionar recado";
  document.getElementById("modal-text").value = "";
  document.getElementById("modal-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("modal-bg").classList.add("active");

  const form = document.getElementById("modal-form");
  form.dataset.mode = "add";
  form.dataset.cod = "";
}

function abrirModalEditar(cod, data, texto) {
  const tipoUsuario = document.body.dataset.usuario;
  if (tipoUsuario !== "funcionario") return;

  document.getElementById("modal-title").textContent = "Editar recado";
  document.getElementById("modal-date").value = data.split("T")[0];
  document.getElementById("modal-text").value = texto;

  const form = document.getElementById("modal-form");
  form.dataset.mode = "edit";
  form.dataset.cod = cod;

  document.getElementById("modal-bg").classList.add("active");
}

function fecharModal() {
  document.getElementById("modal-bg").classList.remove("active");
}

function fecharAlerta() {
  document.getElementById("alerta-bg").style.display = "none";
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

// === Alertas ===
function mostrarAlerta(mensagem, tipo = "sucesso") {
  const alertaBg = document.getElementById("alerta-bg");
  const alertaMsg = document.getElementById("alerta-msg");

  alertaMsg.textContent = mensagem;

  const alertaBox = alertaBg.querySelector(".alerta-box");
  alertaBox.classList.remove("success", "error");
  alertaBox.classList.add(tipo);

  alertaBg.style.display = "flex";
}

function recadoAdicionadoComSucesso() {
  mostrarAlerta("Recado adicionado com sucesso!", "sucesso");
}

// === Envio real via fetch() ===
document.getElementById("modal-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = form.querySelector("#modal-date").value;
  const texto = form.querySelector("#modal-text").value;
  const nomeTurma = document.body.dataset.nomeTurma;
  const modo = form.dataset.mode;
  const cod = form.dataset.cod;

  try {
    let url, method, bodyData;

    if (modo === "edit") {
      // Edição de recado
      url = `/turmas/${encodeURIComponent(nomeTurma)}/recados/${cod}/edit`;
      method = "POST";
      bodyData = new URLSearchParams({ descricao: texto, datar: data });
    } else {
      // Novo recado
      url = `/turmas/${encodeURIComponent(nomeTurma)}/recados`;
      method = "POST";
      bodyData = JSON.stringify({ descricao: texto, datar: data });
    }

    const response = await fetch(url, {
      method,
      headers: modo === "edit"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : { "Content-Type": "application/json" },
      body: bodyData,
      credentials: "include", // mantém sessão ativa
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || "Erro ao enviar recado.");
    }

    if (modo === "edit") {
      // Atualiza o recado localmente
      const recadoIndex = pagesData.findIndex((r) => r.cod == cod);
      if (recadoIndex !== -1) {
        pagesData[recadoIndex].data = data;
        pagesData[recadoIndex].texto = texto;
      }
      mostrarAlerta("Recado atualizado com sucesso!", "sucesso");
    } else {
      const result = await response.json();
      if (result.sucesso) {
        pagesData.push({ cod: result.cod, data: result.datar, texto: result.descricao });
        currentPageIndex = pagesData.length - 1;
        recadoAdicionadoComSucesso();
      } else {
        mostrarAlerta(result.erro || "Erro ao salvar recado.", "error");
      }
    }

    fecharModal();
    renderPage();
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao enviar recado.", "error");
  }
});

window.onload = () => {
  renderPage();
};
