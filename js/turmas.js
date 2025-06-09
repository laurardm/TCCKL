document.addEventListener("DOMContentLoaded", () => {
  const btnFotos = document.getElementById("btnFotos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  const alunosContainer = document.querySelector(".grade-alunos");

  let modoEdicao = false;

  function carregarAlunos() {
    alunosContainer.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const alunoKey = `aluno-${i}`;
      let aluno = JSON.parse(localStorage.getItem(alunoKey));
      if (!aluno) {
        aluno = { nome: `Fulano ${i + 1}`, foto: "/imagens/perfil.png" };
      }
      const divAluno = criarAlunoElemento(i, aluno.nome, aluno.foto);
      alunosContainer.appendChild(divAluno);
    }
  }

  function criarAlunoElemento(id, nome, foto) {
    const div = document.createElement("div");
    div.classList.add("aluno");
    div.dataset.id = id;
    div.innerHTML = `
      <img src="${foto}" alt="Foto do aluno">
      <span>${nome}</span>
    `;

    div.addEventListener("click", () => {
      if (!modoEdicao) {
        window.location.href = `/aluno.html?id=${id}`;
      }
    });

    return div;
  }

  btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html";
  });

  btnAdicionar.addEventListener("click", () => {
    if (!modoEdicao) return alert("Ative o modo edição para adicionar alunos.");
    const novoId = localStorage.length;
    const novoAluno = criarAlunoElemento(novoId, "Novo Aluno", "/imagens/perfil.png");
    adicionarBotaoExcluir(novoAluno);
    alunosContainer.appendChild(novoAluno);
    localStorage.setItem(`aluno-${novoId}`, JSON.stringify({ nome: "Novo Aluno", foto: "/imagens/perfil.png" }));
  });

  btnEditar.addEventListener("click", () => {
    modoEdicao = true;
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";
    });
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      adicionarBotaoExcluir(divAluno);
    });
  });

  btnSalvar.addEventListener("click", () => {
    modoEdicao = false;
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });
    alunosContainer.querySelectorAll(".botao-excluir").forEach(btn => btn.remove());
    alunosContainer.querySelectorAll(".aluno").forEach(divAluno => {
      const id = divAluno.dataset.id;
      const nome = divAluno.querySelector("span").innerText;
      const foto = divAluno.querySelector("img").src;
      localStorage.setItem(`aluno-${id}`, JSON.stringify({ nome, foto }));
    });
  });

  function adicionarBotaoExcluir(divAluno) {
    if (divAluno.querySelector(".botao-excluir")) return;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.classList.add("botao-excluir");

    btnExcluir.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = divAluno.dataset.id;

      if (confirm(`Deseja excluir o aluno "${divAluno.querySelector("span").innerText}"?`)) {
        localStorage.removeItem(`aluno-${id}`);
        divAluno.remove();
        alert("Aluno excluído!");
      }
    });

    divAluno.appendChild(btnExcluir);
  }

  carregarAlunos();
});
