document.addEventListener("DOMContentLoaded", () => {
  // Pega o nome da turma do título, removendo o prefixo "Turma " se existir
  let nomeTurma = document.querySelector(".turma-titulo")?.textContent.trim() || "";
  if (nomeTurma.toUpperCase().startsWith("TURMA ")) {
    nomeTurma = nomeTurma.substring(6).trim();
  }

  const alunosContainer = document.querySelector(".grade-alunos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  const tipoUsuario = window.tipoUsuario || "";
  let modoEdicao = false;

  // ---------------- TOAST ----------------
  const toastContainer = document.createElement("div");
  toastContainer.style.position = "fixed";
  toastContainer.style.top = "20px";
  toastContainer.style.right = "20px";
  toastContainer.style.zIndex = "9999";
  document.body.appendChild(toastContainer);

  function showToast(msg, tipo = "info", duracao = 3000) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className = `toast ${tipo}`;
    toast.style.marginTop = "6px";
    toast.style.padding = "8px 12px";
    toast.style.borderRadius = "6px";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, duracao);
  }

  // --------------- MODAL CONFIRMAÇÃO ----------------
  function mostrarConfirmacao(msg) {
    return new Promise((resolve) => {
      const modal = document.getElementById("modalConfirm");
      const mensagem = document.getElementById("modalConfirmMessage");
      const btnSim = document.getElementById("modalConfirmYes");
      const btnNao = document.getElementById("modalConfirmNo");
      if (!modal) { resolve(confirm(msg)); return; }

      mensagem.textContent = msg;
      modal.style.display = "flex";

      function limpar() {
        modal.style.display = "none";
        btnSim.removeEventListener("click", onSim);
        btnNao.removeEventListener("click", onNao);
      }

      function onSim() { limpar(); resolve(true); }
      function onNao() { limpar(); resolve(false); }

      btnSim.addEventListener("click", onSim);
      btnNao.addEventListener("click", onNao);
    });
  }

  // --------------- FOTO ----------------
  document.body.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("input-foto")) return;
    const file = e.target.files[0];
    const codAluno = e.target.dataset.cod;
    if (!file || !codAluno) return;

    const formData = new FormData();
    formData.append("foto", file);
    formData.append("cod", codAluno);

    try {
      const res = await fetch("/turmas/alunos/alterar-foto", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Erro ao enviar imagem");

      const data = await res.json();
      const imgTag = e.target.closest(".aluno").querySelector("img");
      imgTag.src = `${data.novaFoto}?t=${Date.now()}`;
      showToast("Foto alterada com sucesso", "success");
    } catch (err) {
      console.error(err);
      showToast("Erro ao alterar foto", "error");
    }
  });

  // ---------------- BLOQUEIO PARA NÃO FUNCIONÁRIOS ----------------
  if (tipoUsuario !== "func") {
    [btnAdicionar, btnEditar, btnSalvar].forEach(btn => {
      if (btn) { btn.style.display = "none"; btn.disabled = true; }
    });
    modoEdicao = false;
  }

  // ---------------- FUNÇÕES DE ALUNO ----------------
  function criarAlunoElemento(cod, nome, foto, alunoNovo = false) {
    const div = document.createElement("div");
    div.className = "aluno";
    div.dataset.cod = cod || "";

    div.innerHTML = `
      <div class="foto-wrapper">
        <img src="${foto || '/imagens/perfil.png'}" alt="Foto do aluno">
      </div>
      <span ${alunoNovo ? 'contenteditable="true" style="border-bottom: 1px dashed #000;"' : ''}>${nome || ''}</span>
    `;

    // Bloqueia clique durante edição
    div.addEventListener('click', (ev) => {
      if (modoEdicao) return;
      if (ev.target.closest('.camera-overlay') || ev.target.closest('input') || ev.target.classList.contains('btn-excluir')) return;
      const codLocal = div.dataset.cod;
      if (codLocal) window.location.href = `/agenda/aluno/${codLocal}`;
    });

    const span = div.querySelector("span");
    span.addEventListener("click", ev => ev.stopPropagation());
    const imgWrapper = div.querySelector(".foto-wrapper img");
    imgWrapper.addEventListener("click", ev => ev.stopPropagation());

    if (modoEdicao) {
      div.classList.add("editando");
      adicionarAcoes(div);
    }

    return div;
  }

  function adicionarAcoes(divAluno) {
    let acoes = divAluno.querySelector(".acoes");
    if (!acoes) {
      acoes = document.createElement("div");
      acoes.className = "acoes";
      acoes.style.position = "absolute";
      acoes.style.top = "8px";
      acoes.style.right = "6px";
      acoes.style.display = "flex";
      acoes.style.gap = "6px";
      divAluno.appendChild(acoes);
    }

    // Botão excluir
    if (!acoes.querySelector(".btn-excluir")) {
      const btnExcluir = document.createElement("button");
      btnExcluir.className = "btn-excluir";
      btnExcluir.textContent = "❌";
      btnExcluir.title = "Excluir aluno";
      btnExcluir.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const confirmado = await mostrarConfirmacao("Confirma exclusão do aluno?");
        if (!confirmado) return;

        const cod = divAluno.dataset.cod;
        if (!cod) { divAluno.remove(); showToast("Aluno removido", "success"); return; }

        try {
          const res = await fetch(`/turmas/${nomeTurma}/${cod}`, {
          method: "DELETE"
        });
          if (!res.ok) throw new Error("Erro ao excluir");
          divAluno.remove();
          showToast("Aluno excluído", "success");
        } catch (err) {
          console.error(err);
          showToast("Erro ao excluir aluno", "error");
        }
      });
      acoes.appendChild(btnExcluir);
    }

    // Ícone da câmera
    if (!acoes.querySelector(".camera-overlay")) {
      const camera = document.createElement("div");
      camera.className = "camera-overlay";
      camera.innerHTML = "📷";
      camera.title = "Alterar foto do aluno";
      camera.addEventListener("click", (ev) => {
        ev.stopPropagation();
        let inputFile = divAluno.querySelector("input.input-foto");
        if (!inputFile) {
          inputFile = document.createElement("input");
          inputFile.type = "file";
          inputFile.accept = "image/*";
          inputFile.classList.add("input-foto");
          inputFile.dataset.cod = divAluno.dataset.cod || '';
          inputFile.style.display = "none";
          divAluno.appendChild(inputFile);
        }
        inputFile.click();
      });
      acoes.appendChild(camera);
    }
  }

  function ativarEdicao() {
    if (tipoUsuario !== "func") { showToast("Você não tem permissão para editar alunos.", "error"); return; }
    modoEdicao = true;
    btnAdicionar.disabled = false;
    if (btnEditar) btnEditar.style.display = "none";
    if (btnSalvar) btnSalvar.style.display = "inline-block";

    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      const span = divAluno.querySelector("span");
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";
      span.addEventListener("click", ev => ev.stopPropagation());
      divAluno.querySelector(".foto-wrapper img")?.addEventListener("click", ev => ev.stopPropagation());
      adicionarAcoes(divAluno);
      divAluno.classList.add("editando");
    });
  }

  async function salvarEdicao() {
    const alunos = Array.from(alunosContainer.querySelectorAll(".aluno"));
    let erro = false;

    for (const aluno of alunos) {
      const cod = aluno.dataset.cod;
      const span = aluno.querySelector("span");
      const nome = span.textContent.trim();

      if (!cod) {
        if (!nome) { showToast("Nome do aluno não pode ser vazio", "error"); return; }
        try {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome }),
          });
          if (!res.ok) throw new Error("Erro ao criar");
          const data = await res.json();
          aluno.dataset.cod = data.cod;
          span.textContent = data.nome;
        } catch (err) { console.error(err); erro = true; break; }
      } else {
        try {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nome }),
          });
          if (!res.ok) throw new Error("Erro ao atualizar");
        } catch (err) { console.error(err); erro = true; break; }
      }
    }

    modoEdicao = false;
    if (btnAdicionar) btnAdicionar.disabled = true;
    if (btnEditar) btnEditar.style.display = "inline-block";
    if (btnSalvar) btnSalvar.style.display = "none";

    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      divAluno.classList.remove("editando");
      divAluno.querySelector(".camera-overlay")?.remove();
      divAluno.querySelector(".btn-excluir")?.remove();
      const span = divAluno.querySelector("span");
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });

    showToast(erro ? "Erro ao salvar alunos" : "Alunos salvos com sucesso", erro ? "error" : "success");
  }

  // ---------------- BOTÕES ----------------
  btnAdicionar?.addEventListener("click", () => {
    if (!modoEdicao) return showToast("Ative o modo edição para adicionar", "info");
    const novoAluno = criarAlunoElemento("", "Novo Aluno", "/imagens/perfil.png", true);
    alunosContainer.appendChild(novoAluno);
    novoAluno.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  btnEditar?.addEventListener("click", ativarEdicao);
  btnSalvar?.addEventListener("click", salvarEdicao);

  // Inicializa elementos existentes
  document.querySelectorAll(".aluno").forEach(existing => {
    const cod = existing.dataset.cod || "";
    const nome = existing.querySelector("span")?.textContent || "";
    const img = existing.querySelector("img")?.src || "/imagens/perfil.png";
    const novo = criarAlunoElemento(cod, nome, img, false);
    existing.replaceWith(novo);
  });
});
