document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const turma = params.get("turma");
  const retorno = params.get("retorno") || `/turmas/turma${turma.toLowerCase()}.html`;

  if (!id || !turma) {
    alert("ID ou turma não informado.");
    return;
  }

  const chaveAluno = `aluno-${turma}-${id}`;

  const nomeInput = document.getElementById("nomeAluno");
  const fotoImg = document.getElementById("fotoAluno");
  const inputFoto = document.getElementById("inputFoto");

  let aluno = JSON.parse(localStorage.getItem(chaveAluno)) || {
    nome: `Aluno ${parseInt(id) + 1}`,
    foto: "/imagens/perfil.png"
  };

  nomeInput.value = aluno.nome;
  fotoImg.src = aluno.foto;

  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        aluno.foto = reader.result;
        fotoImg.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("salvarAluno").addEventListener("click", () => {
    aluno.nome = nomeInput.value;
    localStorage.setItem(chaveAluno, JSON.stringify(aluno));
    alert("Dados salvos!");

    // Volta para a tela de onde veio
    window.location.href = retorno;
  });
});
