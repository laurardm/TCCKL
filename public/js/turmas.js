document.addEventListener("DOMContentLoaded", () => {
      const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();
      const alunosContainer = document.querySelector(".grade-alunos");

      const btnFotos = document.getElementById("btnFotos");
      const btnAdicionar = document.getElementById("btnAdicionar");
      const btnEditar = document.getElementById("btnEditar");
      const btnSalvar = document.getElementById("btnSalvar");

      let modoEdicao = false;

      // Recebe do EJS o tipoUsuario, ex: "func" ou "resp"
      const tipoUsuario = window.tipoUsuario || "";

      // Controle visibilidade e funcionalidade baseado no tipoUsuario
      if (tipoUsuario !== "func") {
        // Responsável só pode visualizar, então esconde botões de edição
        if (btnAdicionar) btnAdicionar.style.display = "none";
        if (btnEditar) btnEditar.style.display = "none";
        if (btnSalvar) btnSalvar.style.display = "none";
        if (btnAdicionar) btnAdicionar.disabled = true;

        modoEdicao = false; // não permite modo edição
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
          alert("Você não tem permissão para editar alunos.");
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
            alert("Nome do aluno não pode ficar vazio.");
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
            alert(err.message);
            return;
          }
        }

        alert("Alterações salvas com sucesso!");
        window.location.reload();
      }

      function adicionarBotaoExcluir(divAluno) {
        if (divAluno.querySelector(".botao-excluir")) return;

        // Permite excluir só se for funcionário
        if (tipoUsuario !== "func") return;

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.classList.add("botao-excluir");

        btnExcluir.addEventListener("click", async (e) => {
          e.stopPropagation();
          const cod = divAluno.dataset.cod;
          const nome = divAluno.querySelector("span").innerText;

          if (confirm(`Deseja excluir o aluno "${nome}"?`)) {
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
              alert("Aluno excluído!");
            } catch (err) {
              alert(err.message);
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
            window.location.href = `/turmas/${encodeURIComponent(nomeTurma)}/aluno/${cod}`;
          }
        }
      });

      if (btnAdicionar) btnAdicionar.addEventListener("click", () => {
        if (!modoEdicao) return alert("Ative o modo edição para adicionar alunos.");
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