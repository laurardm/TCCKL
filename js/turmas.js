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

//————————————————————————————————— função para carregar os alunos no LS
  function carregarAlunos() {
    alunosContainer.innerHTML = ""; // Limpa o container antes de adicionar os alunos

    for (let i = 0; i < 12; i++) {
      // Tenta carregar um aluno do localStorage usando a chave gerada
      let aluno = JSON.parse(localStorage.getItem(chaveAluno(i)));

      // Se não existir nenhum aluno salvo, cria um aluno genérico
      if (!aluno) {
        aluno = { nome: `Fulano ${i + 1}`, foto: "/imagens/perfil.png" };
      }

      // Cria o elemento do aluno com nome e foto, e adiciona no container
      const divAluno = criarAlunoElemento(i, aluno.nome, aluno.foto);
      alunosContainer.appendChild(divAluno);
    }
  }

//————————————————————————————————— cria o html de um aluno na tela :)
  function criarAlunoElemento(id, nome, foto) {
    const div = document.createElement("div"); // Cria uma div
    div.classList.add("aluno"); // Adiciona a classe CSS "aluno"
    div.dataset.id = id; // Salva o ID como um atributo da div

    // Define o HTML do aluno: uma imagem e um nome
    div.innerHTML = `<img src="${foto}" alt="Foto do aluno"><span>${nome}</span>`;

    // Quando clica no aluno (se não estiver editando), abre a página individual dele
    div.addEventListener("click", () => {
      if (!modoEdicao) {
        window.location.href = `/aluno.html?id=${id}&turma=${nomeTurma}&retorno=${encodeURIComponent(window.location.pathname)}`;
      }
    });

    return div; // Retorna a div criada
  }

//————————————————————————————————— botão de fotos turma
  btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html";
  });

  // -------------------------- botão adicionar aluno
  btnAdicionar.addEventListener("click", () => {
    if (!modoEdicao) return alert("Ative o modo edição para adicionar alunos.");

    const novoId = alunosContainer.children.length; // Define o novo ID baseado na quantidade atual

    // Cria o visual do novo aluno e adiciona botão de excluir
    const novoAluno = criarAlunoElemento(novoId, "Novo Aluno", "/imagens/perfil.png");
    adicionarBotaoExcluir(novoAluno); // Adiciona botão de excluir
    alunosContainer.appendChild(novoAluno); // Adiciona à tela

    // Salva o novo aluno no localStorage
    localStorage.setItem(chaveAluno(novoId), JSON.stringify({ nome: "Novo Aluno", foto: "/imagens/perfil.png" }));
  });

  //————————————————————————————————— botão editar alunos 
  btnEditar.addEventListener("click", () => {
    modoEdicao = true; // Ativa modo edição

    const spans = alunosContainer.querySelectorAll("span"); // Seleciona os nomes
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true"); // Permite digitar diretamente no nome
      span.style.borderBottom = "1px dashed #000"; // Adiciona uma linha para indicar que é editável
    });

    // Adiciona botão de excluir em cada aluno
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      adicionarBotaoExcluir(divAluno);
    });
  });

//————————————————————————————————— botão de salvar
  btnSalvar.addEventListener("click", () => {
    modoEdicao = false; // Sai do modo edição

    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable"); // Remove edição
      span.style.borderBottom = "none"; // Remove o estilo de edição
    });

    // Remove todos os botões de excluir da tela
    alunosContainer.querySelectorAll(".botao-excluir").forEach(btn => btn.remove());

    // Salva cada aluno com os dados atuais
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      const id = divAluno.dataset.id; // ID do aluno
      const nome = divAluno.querySelector("span").innerText; // Nome editado
      const foto = divAluno.querySelector("img").src; // Caminho da imagem
      localStorage.setItem(chaveAluno(id), JSON.stringify({ nome, foto })); // Salva no localStorage
    });
  });

 //————————————————————————————————— função para adicionar um botão de excluir do lado
  function adicionarBotaoExcluir(divAluno) {
    // Verifica se o botão já existe (pra não duplicar)
    if (divAluno.querySelector(".botao-excluir")) return;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir"; // Texto do botão
    btnExcluir.classList.add("botao-excluir"); // Classe CSS para o botão

    // Quando clicar no botão excluir
    btnExcluir.addEventListener("click", (e) => {
      e.stopPropagation(); // Impede o clique de ativar o evento da div

      const id = divAluno.dataset.id;
      const nome = divAluno.querySelector("span").innerText;

      // Pergunta se tem certeza que quer excluir
      if (confirm(`Deseja excluir o aluno "${nome}"?`)) {
        localStorage.removeItem(chaveAluno(id)); // Remove do localStorage
        divAluno.remove(); // Remove da tela
        alert("Aluno excluído!"); // Confirma a exclusão
      }
    });

    // Adiciona o botão ao card do aluno
    divAluno.appendChild(btnExcluir);
  }

//————————————————————————————————— carrega os alunos automatico
  carregarAlunos();
});
