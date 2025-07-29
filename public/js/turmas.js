document.addEventListener("DOMContentLoaded", () => {
  // Pega o nome da turma a partir do título da página
  const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();
  // Seleciona o container onde os alunos são exibidos
  const alunosContainer = document.querySelector(".grade-alunos");

  // Seleciona os botões da interface
  const btnFotos = document.getElementById("btnFotos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");

  // Variável que indica se o modo edição está ativo
  let modoEdicao = false;

  // Função que cria o elemento HTML de um aluno na tela
  // cod: código do aluno no banco (ou null se for novo)
  // nome: nome do aluno
  // foto: caminho da foto
  // alunoNovo: se true, ativa edição imediata e botão de excluir
  function criarAlunoElemento(cod, nome, foto, alunoNovo = false) {
    const div = document.createElement("div");
    div.classList.add("aluno");
    if (cod) div.dataset.cod = cod;  // define dataset.cod para alunos cadastrados
    else div.dataset.cod = "";       // vazio para novos alunos não salvos

    // Conteúdo do cartão do aluno (foto + nome)
    div.innerHTML = `
      <img src="${foto}" alt="Foto do aluno">
      <span>${nome}</span>
    `;

    if (alunoNovo) {
      // Se for aluno novo, deixa o nome editável logo de cara e mostra o botão excluir
      const span = div.querySelector("span");
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";

      adicionarBotaoExcluir(div);
    } else {
      // Se não for novo, adiciona evento para abrir página do aluno ao clicar, se não estiver editando
      document.querySelector(".grade-alunos").addEventListener("click", (event) => {
      const divAluno = event.target.closest(".aluno");
      if (divAluno && !modoEdicao) {
        const cod = divAluno.dataset.cod;
        if (cod) {
          const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();
          window.location.href = `/turmas/${encodeURIComponent(nomeTurma)}/aluno/${cod}`;
        }
      }
    });
  }

    return div; // retorna o elemento criado
  }

  // Função que ativa o modo edição: permite editar nomes e adicionar/remover alunos
  function ativarEdicao() {
    modoEdicao = true;
    btnAdicionar.disabled = false;         // habilita botão adicionar
    btnEditar.style.display = "none";      // esconde botão editar
    btnSalvar.style.display = "inline-block"; // mostra botão salvar

    // Torna todos os nomes editáveis visualmente
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";
    });

    // Adiciona botão excluir para todos os alunos que ainda não tem
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      if (!divAluno.querySelector(".botao-excluir")) {
        adicionarBotaoExcluir(divAluno);
      }
    });
  }

  // Função que salva todas as edições feitas (nomes novos e existentes)
  async function salvarEdicao() {
    modoEdicao = false;
    btnAdicionar.disabled = true;           // desabilita botão adicionar
    btnEditar.style.display = "inline-block"; // mostra botão editar
    btnSalvar.style.display = "none";          // esconde botão salvar

    // Remove a edição visual dos nomes
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });

    // Remove todos os botões excluir da interface
    alunosContainer.querySelectorAll(".botao-excluir").forEach(btn => btn.remove());

    // Para cada aluno na lista, envia requisição para atualizar ou criar
    for (const divAluno of alunosContainer.querySelectorAll(".aluno")) {
      const cod = divAluno.dataset.cod;  // código do aluno (se existir)
      const nome = divAluno.querySelector("span").innerText.trim();

      if (!nome) {
        alert("Nome do aluno não pode ficar vazio.");
        return;
      }

      try {
        if (cod) {
          // Se o aluno já existe no banco, envia PUT para atualizar
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nome }),
          });
          if (!res.ok) throw new Error("Erro ao atualizar aluno");
        } else {
          // Se o aluno é novo (sem cod), envia POST para criar
          const res = await fetch(`/turmas/${nomeTurma}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome }),
          });
          if (!res.ok) throw new Error("Erro ao adicionar aluno");
          // Opcional: atualizar dataset.cod após criação para manter sincronização
        }
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    alert("Alterações salvas com sucesso!");
    window.location.reload(); // recarrega a página para sincronizar dados do banco
  }

  // Função que adiciona botão excluir em cada cartão de aluno
  function adicionarBotaoExcluir(divAluno) {
    if (divAluno.querySelector(".botao-excluir")) return; // não adiciona se já existe

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.classList.add("botao-excluir");

    btnExcluir.addEventListener("click", async (e) => {
      e.stopPropagation(); // impede que o clique no botão abra a página do aluno
      const cod = divAluno.dataset.cod;
      const nome = divAluno.querySelector("span").innerText;

      if (confirm(`Deseja excluir o aluno "${nome}"?`)) {
        try {
          if (cod) {
            // Se aluno tem código, envia requisição para deletar no banco
            const res = await fetch(`/turmas/${nomeTurma}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cod }),
            });
            if (!res.ok) throw new Error("Erro ao excluir aluno");
          }
          divAluno.remove(); // remove da tela
          alert("Aluno excluído!");
        } catch (err) {
          alert(err.message);
        }
      }
    });

    divAluno.appendChild(btnExcluir); // adiciona botão no cartão
  }

  // Evento para botão adicionar aluno — só funciona no modo edição
  btnAdicionar.addEventListener("click", () => {
    if (!modoEdicao) return alert("Ative o modo edição para adicionar alunos.");
    // Cria um novo aluno com nome padrão e foto padrão, já editável
    const novoAluno = criarAlunoElemento(null, "Novo Aluno", "/imagens/perfil.png", true);
    alunosContainer.appendChild(novoAluno);
  });

  // Eventos dos botões editar, salvar e fotos
  btnEditar.addEventListener("click", ativarEdicao);
  btnSalvar.addEventListener("click", salvarEdicao);

  btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html";
  });

  // Desabilita o botão adicionar até o modo edição ser ativado
  btnAdicionar.disabled = true;
});
