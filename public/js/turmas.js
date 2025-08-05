document.addEventListener("DOMContentLoaded", () => {
  const nomeTurma = document.querySelector(".turma-titulo")?.textContent.trim();
  const alunosContainer = document.querySelector(".grade-alunos");

  const btnFotos = document.getElementById("btnFotos");
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
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, duracao);
  }

  // --------------- MODAL CONFIRMAÇÃO ----------------
  function mostrarConfirmacao(msg) {
    return new Promise((resolve) => {
      const modal = document.getElementById("modalConfirm");
      const mensagem = document.getElementById("modalConfirmMessage");
      const btnSim = document.getElementById("modalConfirmYes");
      const btnNao = document.getElementById("modalConfirmNo");

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
      const res = await fetch("/turmas/alunos/alterar-foto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao enviar imagem");

      const data = await res.json();
      const imgTag = e.target.closest(".aluno").querySelector("img");
      imgTag.src = `${data.novaFoto}?t=${Date.now()}`;

      showToast("Foto alterada com sucesso", "success");
    } catch {
      showToast("Erro ao alterar foto", "error");
    }
  });

  // --------------- BLOQUEAR PARA NÃO FUNCIONÁRIO ----------------
  if (tipoUsuario !== "func") {
    [btnAdicionar, btnEditar, btnSalvar].forEach(btn => {
      if (btn) {
        btn.style.display = "none";
        btn.disabled = true;
      }
    });
    modoEdicao = false;
  }

  // --------------- CRIAÇÃO ALUNO ----------------
  function criarAlunoElemento(cod, nome, foto, alunoNovo = false) {
    const div = document.createElement("div");
    div.className = "aluno";
    div.dataset.cod = cod || "";

    div.innerHTML = `
      <div class="foto-wrapper">
        <img src="${foto || '/imagens/perfil.png'}" alt="Foto do aluno">
      </div>
      <span ${alunoNovo ? 'contenteditable="true" style="border-bottom: 1px dashed #000;"' : ''}>${nome}</span>
    `;

    if (alunoNovo) adicionarBotaoExcluir(div);
    return div;
  }

  // --------------- MODO EDIÇÃO ----------------
  function ativarEdicao() {
    if (tipoUsuario !== "func") {
      showToast("Você não tem permissão para editar alunos.", "error");
      return;
    }

    modoEdicao = true;
    btnAdicionar.disabled = false;
    btnEditar.style.display = "none";
    btnSalvar.style.display = "inline-block";

    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      const span = divAluno.querySelector("span");
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";

      adicionarBotaoExcluir(divAluno);

      const cod = divAluno.dataset.cod;
      if (!divAluno.querySelector(".camera-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "camera-overlay";
        overlay.innerHTML = "📷";
        overlay.title = "Clique para alterar a foto";

        overlay.addEventListener("click", () => {
          let inputFile = divAluno.querySelector("input.input-foto");
          if (!inputFile) {
            inputFile = document.createElement("input");
            inputFile.type = "file";
            inputFile.accept = "image/*";
            inputFile.classList.add("input-foto");
            inputFile.dataset.cod = cod;
            inputFile.style.display = "none";
            divAluno.appendChild(inputFile);
          }
          inputFile.click();
        });

        divAluno.style.position = "relative";
        divAluno.appendChild(overlay);
      }
    });
  }

  // --------------- EXCLUIR ALUNO ----------------
  function adicionarBotaoExcluir(divAluno) {
    if (divAluno.querySelector(".btn-excluir")) return;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "❌";
    btnExcluir.title = "Excluir aluno";
    btnExcluir.className = "btn-excluir";
    btnExcluir.style.marginLeft = "8px";

    btnExcluir.addEventListener("click", async () => {
      const confirmado = await mostrarConfirmacao("Confirma exclusão do aluno?");
      if (!confirmado) return;

      const cod = divAluno.dataset.cod;

      try {
        const res = await fetch(`/turmas/${nomeTurma}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cod }),
        });

        if (!res.ok) throw new Error();
        divAluno.remove();
        showToast("Aluno excluído", "success");
      } catch {
        showToast("Erro ao excluir aluno", "error");
      }
    });

    divAluno.appendChild(btnExcluir);
  }

  // --------------- SALVAR ----------------
  async function salvarEdicao() {
    const alunos = alunosContainer.querySelectorAll(".aluno");
    let erro = false;

    for (const aluno of alunos) {
      const cod = aluno.dataset.cod;
      const span = aluno.querySelector("span");
      const nome = span.textContent.trim();

      if (!cod) {
        if (!nome) {
          showToast("Nome do aluno não pode ser vazio", "error");
          return;
        }

        try {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome }),
          });

          if (!res.ok) throw new Error();
          const data = await res.json();

          aluno.dataset.cod = data.cod;
          span.textContent = data.nome;
          span.removeAttribute("contenteditable");
          span.style.borderBottom = "none";
          aluno.querySelector(".btn-excluir")?.remove();

        } catch {
          erro = true;
          break;
        }
      } else {
        try {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nome }),
          });

          if (!res.ok) throw new Error();

          span.removeAttribute("contenteditable");
          span.style.borderBottom = "none";
          aluno.querySelector(".btn-excluir")?.remove();
        } catch {
          erro = true;
          break;
        }
      }

      // Remove overlays
      aluno.querySelector(".camera-overlay")?.remove();
    }

    modoEdicao = false;
    btnAdicionar.disabled = true;
    btnEditar.style.display = "inline-block";
    btnSalvar.style.display = "none";

    showToast(erro ? "Erro ao salvar alunos" : "Alunos salvos com sucesso", erro ? "error" : "success");
  }

  // --------------- BOTÕES ----------------
  btnAdicionar?.addEventListener("click", () => {
    if (!modoEdicao) return showToast("Ative o modo edição para adicionar", "info");

    const novoAluno = criarAlunoElemento(null, "Novo Aluno", "/imagens/perfil.png", true);
    alunosContainer.appendChild(novoAluno);
  });

  btnEditar?.addEventListener("click", ativarEdicao);
  btnSalvar?.addEventListener("click", salvarEdicao);
});

document.querySelectorAll(".aluno").forEach(el => {
  el.addEventListener("click", () => {
    const cod = el.getAttribute("data-cod");
    window.location.href = `/turmas/agenda/aluno/${cod}`;
  });
});

