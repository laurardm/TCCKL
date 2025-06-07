document.addEventListener("DOMContentLoaded", () => {
  const btnFotos = document.getElementById("btnFotos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  const alunosContainer = document.querySelector(".grade-alunos");

  // Botão "Fotos da turma"
  btnFotos.addEventListener("click", () => {
    window.location.href = "/fotos-turma.html"; //temporário
  });

  // Botão "Adicionar aluno"
  btnAdicionar.addEventListener("click", () => {
    const novoAluno = document.createElement("div");
    novoAluno.classList.add("aluno");
    novoAluno.innerHTML = `
      <img src="/imagens/perfil.png" alt="">
      <span contenteditable="true">Novo Aluno</span>
    `;
    alunosContainer.appendChild(novoAluno);
  });

  // Botão "Editar alunos"
  btnEditar.addEventListener("click", () => {
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.setAttribute("contenteditable", "true");
      span.style.borderBottom = "1px dashed #000";
    });
  });

  // Botão "Salvar"
  btnSalvar.addEventListener("click", () => {
    const spans = alunosContainer.querySelectorAll("span");
    spans.forEach(span => {
      span.removeAttribute("contenteditable");
      span.style.borderBottom = "none";
    });
    /*alert("Alterações salvas!");*/
  });
});