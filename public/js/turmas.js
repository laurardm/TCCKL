document.addEventListener("DOMContentLoaded", () => {
  const nomeTurma = document.querySelector(".turma-titulo").textContent.trim();
  const alunosContainer = document.querySelector(".grade-alunos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");

  let modoEdicao = false;

  // Calcular idade a partir da data de nascimento
  function calcularIdade(dataNasc) {
    const nascimento = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  async function carregarAlunos() {
    alunosContainer.innerHTML = "";
    const resp = await fetch(`/alunos/${nomeTurma}`);
    const alunos = await resp.json();

    alunos.forEach(aluno => {
      const div = criarAlunoElemento(aluno.cod, aluno.nome, aluno.data_nasc, aluno.foto || "/imagens/perfil.png");
      alunosContainer.appendChild(div);
    });
  }

  function criarAlunoElemento(id, nome, data_nasc, foto) {
    const idade = calcularIdade(data_nasc);
    const div = document.createElement("div");
    div.classList.add("aluno");
    div.dataset.id = id;

    div.innerHTML = `
      <img src="${foto}" alt="Foto do aluno">
      <span class="nome">${nome}</span>
      <small class="info">${idade} anos - ${data_nasc}</small>
    `;

    if (!modoEdicao) {
      div.addEventListener("click", () => {
        window.location.href = `/aluno/${id}`;
      });
    }

    return div;
  }

  btnEditar?.addEventListener("click", () => {
    modoEdicao = true;
    alunosContainer.querySelectorAll(".aluno").forEach(div => {
      const nomeSpan = div.querySelector(".nome");
      nomeSpan.setAttribute("contenteditable", true);
      nomeSpan.style.borderBottom = "1px dashed black";

      // Adiciona campo de edição de foto
      if (!div.querySelector("input[type='text']")) {
        const fotoInput = document.createElement("input");
        fotoInput.type = "text";
        fotoInput.placeholder = "URL da nova foto";
        fotoInput.classList.add("input-foto");
        div.appendChild(fotoInput);
      }

      adicionarBotaoExcluir(div);
    });
  });

  btnSalvar?.addEventListener("click", async () => {
    modoEdicao = false;

    const edits = alunosContainer.querySelectorAll(".aluno");
    for (const div of edits) {
      const id = div.dataset.id;
      const nome = div.querySelector(".nome").innerText.trim();
      const inputFoto = div.querySelector("input[type='text']");
      const novaFoto = inputFoto?.value.trim() || div.querySelector("img").src;

      await fetch(`/alunos/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, foto: novaFoto })
      });
    }

    carregarAlunos();
  });

  btnAdicionar?.addEventListener("click", async () => {
    const turmaRes = await fetch(`/alunos/${nomeTurma}`);
    const alunos = await turmaRes.json();
    const turmaId = alunos[0]?.turma;

    const respAdd = await fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: "Novo Aluno",
        data_nasc: "2018-01-01",
        turma_id: turmaId,
        genero_id: 1,
        agenda_id: 1,
        foto: "/imagens/perfil.png"
      })
    });

    const { id } = await respAdd.json();
    const novo = criarAlunoElemento(id, "Novo Aluno", "2018-01-01", "/imagens/perfil.png");
    adicionarBotaoExcluir(novo);
    alunosContainer.appendChild(novo);
  });

  function adicionarBotaoExcluir(div) {
    if (div.querySelector(".botao-excluir")) return;
    const btn = document.createElement("button");
    btn.textContent = "Excluir";
    btn.classList.add("botao-excluir");

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (confirm("Deseja excluir este aluno?")) {
        const id = div.dataset.id;
        await fetch(`/alunos/${id}`, { method: "DELETE" });
        div.remove();
      }
    });

    div.appendChild(btn);
  }

  carregarAlunos();
});
