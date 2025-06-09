document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID do aluno não informado.");
    return;
  }

  const nomeInput = document.getElementById("nomeAluno");
  const fotoImg = document.getElementById("fotoAluno");
  const inputFoto = document.getElementById("inputFoto");

  let aluno = JSON.parse(localStorage.getItem(`aluno-${id}`)) || {
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
    localStorage.setItem(`aluno-${id}`, JSON.stringify(aluno));
    alert("Dados salvos!");
    window.location.href = "/turmas/turmab1.html";
  });
});
