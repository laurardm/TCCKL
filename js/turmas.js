document.addEventListener("DOMContentLoaded", () => {
  // Pega o nome da turma a partir do título na página (ex: "B1")
  const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();

  // Função que retorna a chave única de armazenamento com base na turma e ID do aluno
  const chaveAluno = (id) => `aluno-${nomeTurma}-${id}`;

  // Seleciona os botões da interface
  const btnFotos = document.getElementById("btnFotos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");

  // Seleciona o container onde os alunos serão exibidos
  const alunosContainer = document.querySelector(".grade-alunos");

  // Variável que define se o modo de edição está ativado
  let modoEdicao = false;

  // --------------------------
  // Função para carregar os alunos do localStorage
  function carregarAlunos() {
    alunosContainer.innerHTML = ""; // Limpa o container antes de adicionar

    for (let i = 0; i < 12; i++) {
      // Tenta carregar um aluno do localStorage usando a chave da turma
      let aluno = JSON.parse(localStorage.getItem(chaveAluno(i)));

      // Se não existir, cria um aluno genérico com nome "Fulano"
      if (!aluno) {
        aluno = { nome: `Fulano ${i + 1}`, foto: "/imagens/perfil.png" };
      }

      // Cria o elemento visual do aluno e adiciona no container
      const divAluno = criarAlunoElemento(i, aluno.nome, aluno.foto);
      alunosContainer.appendChild(divAluno);
    }
  }

  // --------------------------
  // Função que cria o HTML de um aluno na tela
  function criarAlunoElemento(id, nome, foto) {
    const div = document.createElement("div");
    div.classList.add("aluno");
    div.dataset.id = id; // Armazena o ID do aluno como atributo

    // Define o conteúdo HTML do aluno (foto e nome)
    div.innerHTML = `<img src="${foto}" alt="Foto do aluno"><span>${nome}</span>`;

    // Se clicar no aluno (fora do modo edição), redireciona para a página do aluno
    div.addEventListener("click", () => {
      if (!modoEdicao) {
        window.location.href = `/aluno.html?id=${id}&turma=${nomeTurma}&retorno=${encodeURIComponent(window.location.pathname)}`;
      }
    });

    return div;
  }

  // --------------------------
  // Botão "Fotos da turma" redireciona para a galeria
  btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html";
  });

  // --------------------------
  // Botão "Adicionar aluno" cria um novo aluno no final da lista
  btnAdicionar.addEventListener("click", () => {
    if (!modoEdicao) return alert("Ative o modo edição para adicionar alunos.");

    // Cria um novo ID baseado na quantidade de alunos já exibidos
    const novoId = alunosContainer.children.length;

    // Cria visual do novo aluno e botão de exclusão
    const novoAluno = criarAlunoElemento(novoId, "Novo Aluno", "/imagens/perfil.png");
    adicionarBotaoExcluir(novoAluno);
    alunosContainer.appendChild(novoAluno);

    // Salva o novo aluno no localStorage
    localStorage.setItem(chaveAluno(novoId), JSON.stringify({ nome: "Novo Aluno", foto: "/imagens/perfil.png" }));
  });

  // --------------------------
  // Botão "Editar alunos" ativa o modo de edição (permite renomear e excluir)
  btnEditar.addEventListener("click", () => {
    modoEdicao = true;

    // Torna todos os nomes editáveis (contenteditable)
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000"; // Estilo visual de edição
    });

    // Adiciona botão de excluir em cada aluno
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      adicionarBotaoExcluir(divAluno);
    });
  });

  // --------------------------
  // Botão "Salvar" salva as alterações no localStorage
  btnSalvar.addEventListener("click", () => {
    modoEdicao = false;

    // Remove edição visual e atributo contenteditable
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });

    // Remove os botões de exclusão da tela
    alunosContainer.querySelectorAll(".botao-excluir").forEach(btn => btn.remove());

    // Para cada aluno, salva os dados atualizados no localStorage
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      const id = divAluno.dataset.id;
      const nome = divAluno.querySelector("span").innerText;
      const foto = divAluno.querySelector("img").src;
      localStorage.setItem(chaveAluno(id), JSON.stringify({ nome, foto }));
    });
  });

  // --------------------------
  // Função que adiciona um botão "Excluir" em cada aluno
  function adicionarBotaoExcluir(divAluno) {
    // Impede que o botão seja adicionado mais de uma vez
    if (divAluno.querySelector(".botao-excluir")) return;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.classList.add("botao-excluir");

    // Evento de clique no botão "Excluir"
    btnExcluir.addEventListener("click", (e) => {
      e.stopPropagation(); // Impede o clique de abrir o aluno

      const id = divAluno.dataset.id;
      const nome = divAluno.querySelector("span").innerText;

      // Confirmação antes de excluir
      if (confirm(`Deseja excluir o aluno "${nome}"?`)) {
        // Remove do localStorage e da tela
        localStorage.removeItem(chaveAluno(id));
        divAluno.remove();
        alert("Aluno excluído!");
      }
    });

    // Adiciona o botão ao card do aluno
    divAluno.appendChild(btnExcluir);
  }

  // --------------------------
  // Ao carregar a página, os alunos são mostrados
  carregarAlunos();
});
