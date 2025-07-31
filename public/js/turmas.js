document.addEventListener("DOMContentLoaded", () => {
  const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();
  const alunosContainer = document.querySelector(".grade-alunos");

  const btnFotos = document.getElementById("btnFotos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");

  let modoEdicao = false;

  // --- Função para mostrar modal de confirmação customizado ---
  function mostrarConfirmacao(msg) {
    return new Promise((resolve) => {
      const modal = document.getElementById("modalConfirm");
      const mensagem = document.getElementById("modalConfirmMessage");
      const btnSim = document.getElementById("modalConfirmYes");
      const btnNao = document.getElementById("modalConfirmNo");

      mensagem.textContent = msg;
      modal.style.display = "flex";

      function limpar() {
        btnSim.removeEventListener("click", onSim);
        btnNao.removeEventListener("click", onNao);
        modal.style.display = "none";
      }

      function onSim() {
        limpar();
        resolve(true);
      }
      function onNao() {
        limpar();
        resolve(false);
      }

      btnSim.addEventListener("click", onSim);
      btnNao.addEventListener("click", onNao);
    });
  }

  // Criar container para as notificações (toast)
  const toastContainer = document.createElement("div");
  toastContainer.style.position = "fixed";
  toastContainer.style.top = "20px";
  toastContainer.style.right = "20px";
  toastContainer.style.zIndex = "9999";
  document.body.appendChild(toastContainer);

  function showToast(msg, tipo = "info", duracao = 3000) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.background = tipo === "error" ? "#e74c3c" : tipo === "success" ? "#2ecc71" : "#3498db";
    toast.style.color = "white";
    toast.style.padding = "10px 20px";
    toast.style.marginTop = "10px";
    toast.style.borderRadius = "4px";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    toast.style.fontFamily = "Arial, sans-serif";
    toast.style.fontSize = "14px";
    toast.style.opacity = "0.9";
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.5s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, duracao);
  }

  // Recebe do EJS o tipoUsuario, ex: "func" ou "resp"
  const tipoUsuario = window.tipoUsuario || "";

  // Controle visibilidade e funcionalidade baseado no tipoUsuario
  if (tipoUsuario !== "func") {
    if (btnAdicionar) btnAdicionar.style.display = "none";
    if (btnEditar) btnEditar.style.display = "none";
    if (btnSalvar) btnSalvar.style.display = "none";
    if (btnAdicionar) btnAdicionar.disabled = true;

    modoEdicao = false;
  }

  function criarAlunoElemento(cod, nome, foto, alunoNovo = false) {
    const div = document.createElement("div");
    div.classList.add("aluno");
    div.dataset.cod = cod || "";

    div.innerHTML = `
      <img src="${foto}" alt="Foto do aluno">
      <span>${nome}</span>
    `;

    if (alunoNovo) {
      const span = div.querySelector("span");
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";

      adicionarBotaoExcluir(div);
    }

    return div;
  }

  function ativarEdicao() {
    if (tipoUsuario !== "func") {
      showToast("Você não tem permissão para editar alunos.", "error");
      return;
    }
    modoEdicao = true;
    if (btnAdicionar) btnAdicionar.disabled = false;
    if (btnEditar) btnEditar.style.display = "none";
    if (btnSalvar) btnSalvar.style.display = "inline-block";

    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";
    });

    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      if (!divAluno.querySelector(".botao-excluir")) {
        adicionarBotaoExcluir(divAluno);
      }
    });
  }

  async function salvarEdicao() {
    modoEdicao = false;
    if (btnAdicionar) btnAdicionar.disabled = true;
    if (btnEditar) btnEditar.style.display = "inline-block";
    if (btnSalvar) btnSalvar.style.display = "none";

    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });

    alunosContainer.querySelectorAll(".botao-excluir").forEach(btn => btn.remove());

    for (const divAluno of alunosContainer.querySelectorAll(".aluno")) {
      const cod = divAluno.dataset.cod;
      const nome = divAluno.querySelector("span").innerText.trim();

      if (!nome) {
        showToast("Nome do aluno não pode ficar vazio.", "error");
        return;
      }

      try {
        if (cod) {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nome }),
          });
          if (!res.ok) throw new Error("Erro ao atualizar aluno");
        } else {
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome }),
          });
          if (!res.ok) throw new Error("Erro ao adicionar aluno");
        }
      } catch (err) {
        showToast(err.message, "error");
        return;
      }
    }

    showToast("Alterações salvas com sucesso!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 2500);
  }

  function adicionarBotaoExcluir(divAluno) {
    if (divAluno.querySelector(".botao-excluir")) return;
    if (tipoUsuario !== "func") return;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.classList.add("botao-excluir");

    btnExcluir.addEventListener("click", async (e) => {
      e.stopPropagation();
      const cod = divAluno.dataset.cod;
      const nome = divAluno.querySelector("span").innerText;

      const confirmado = await mostrarConfirmacao(`Deseja excluir o aluno "${nome}"?`);
      if (confirmado) {
        try {
          if (cod) {
            const res = await fetch(`/turmas/${nomeTurma}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cod }),
            });
            if (!res.ok) throw new Error("Erro ao excluir aluno");
          }
          divAluno.remove();
          showToast("Aluno excluído!", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    });

    divAluno.appendChild(btnExcluir);
  }

  alunosContainer.addEventListener("click", (event) => {
  const divAluno = event.target.closest(".aluno");
  if (divAluno && !modoEdicao) {
    const cod = divAluno.dataset.cod;
    if (cod) {
      window.location.href = `/agenda?aluno=${cod}`;
    }
  }
});

  if (btnAdicionar) btnAdicionar.addEventListener("click", () => {
    if (!modoEdicao) {
      showToast("Ative o modo edição para adicionar alunos.", "info");
      return;
    }
    const novoAluno = criarAlunoElemento(null, "Novo Aluno", "/imagens/perfil.png", true);
    alunosContainer.appendChild(novoAluno);
  });

  if (btnEditar) btnEditar.addEventListener("click", ativarEdicao);
  if (btnSalvar) btnSalvar.addEventListener("click", salvarEdicao);

  if (btnFotos) btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html";
  });

  if (btnAdicionar) btnAdicionar.disabled = true;
});
