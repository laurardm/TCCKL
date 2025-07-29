document.addEventListener("DOMContentLoaded", () => {
  const salvarBtn = document.getElementById("salvarAluno");
  if (!salvarBtn) return; // Não ativa se for responsável

  const nomeInput = document.getElementById("nomeAluno");
  const inputFoto = document.getElementById("inputFoto");
  const fotoImg = document.getElementById("fotoAluno");

  let novaFotoBase64 = null;

  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      novaFotoBase64 = reader.result;
      fotoImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  salvarBtn.addEventListener("click", async () => {
    const cod = salvarBtn.dataset.cod;
    const turma = salvarBtn.dataset.turma;
    const url = `/turmas/${encodeURIComponent(turma)}/aluno/${cod}`;

    const nome = nomeInput.value.trim();

    if (!nome) {
      alert("O nome do aluno não pode ficar vazio.");
      return;
    }

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, foto: novaFotoBase64 }),
      });

      if (resposta.ok) {
        alert("Aluno atualizado com sucesso!");
        window.location.href = `/turmas/${encodeURIComponent(turma)}`;
      } else {
        alert("Erro ao salvar aluno.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao salvar aluno.");
    }
  });
});
