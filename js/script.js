const editarBtn = document.getElementById("editarBtn");
const salvarBtn = document.getElementById("salvarBtn");
const sairBtn = document.getElementById("sairBtn");
const addTurmaBtn = document.getElementById("addturmaBtn");
const turmasContainer = document.getElementById("turmasContainer");

let modoEdicaoAtivo = false;

// Estado guarda array de objetos {nome, href}
let estadoOriginal = [];

editarBtn.addEventListener("click", () => {
  modoEdicaoAtivo = true;
  ativarModoEdicao();
});

salvarBtn.addEventListener("click", () => {
  salvarEstado();
  modoEdicaoAtivo = false;
  desativarModoEdicao();
  alert("Alterações salvas.");
});

sairBtn.addEventListener("click", () => {
  restaurarEstado();
  modoEdicaoAtivo = false;
  desativarModoEdicao();
  alert("Alterações desfeitas.");
});

addTurmaBtn.addEventListener("click", () => {
  adicionarNovaTurma();
});

function salvarEstado() {
  estadoOriginal = [];
  const links = turmasContainer.querySelectorAll("a.link");
  links.forEach(link => {
    const btn = link.querySelector("button.botao");
    estadoOriginal.push({
      nome: btn.textContent,
      href: link.href
    });
  });
}

function restaurarEstado() {
  // Remove todas as turmas atuais (links com botões)
  const links = turmasContainer.querySelectorAll("a.link");
  links.forEach(link => link.remove());

  // Recria a partir do estado salvo
  estadoOriginal.forEach(turma => {
    const novoBotao = criarBotaoTurma(turma.nome, turma.href);
    turmasContainer.insertBefore(novoBotao, editarBtn);
  });
}

function ativarModoEdicao() {
  const botoes = turmasContainer.querySelectorAll("a.link > button.botao");
  botoes.forEach(botao => {
    botao.addEventListener("click", interceptarClique);
  });
}

function desativarModoEdicao() {
  const botoes = turmasContainer.querySelectorAll("a.link > button.botao");
  botoes.forEach(botao => {
    botao.removeEventListener("click", interceptarClique);
  });
}

function interceptarClique(e) {
  e.preventDefault(); // impede navegação no modo edição
  editarTurma(e);
}

function editarTurma(e) {
  const acao = prompt(`Você quer excluir a turma "${e.target.textContent}"?\nDigite: sim para excluir / não para editar`);

  if (acao === "não") {
    let novoNome = prompt("Novo nome da turma:", e.target.textContent);
    if (novoNome === null) return;

    novoNome = novoNome.trim();
    if (novoNome === "") {
      alert("O nome da turma não pode ser vazio.");
      return;
    }

    // Verifica duplicado (ignorando o próprio botão)
    const duplicado = Array.from(turmasContainer.querySelectorAll("button.botao")).some(
      btn => btn !== e.target && btn.textContent.toLowerCase() === novoNome.toLowerCase()
    );
    if (duplicado) {
      alert("Já existe uma turma com esse nome.");
      return;
    }

    e.target.textContent = novoNome;

    // Atualiza o href do link para refletir o nome novo
    const link = e.target.parentElement;
    link.href = criarHrefPeloNome(novoNome);

  } else if (acao === "sim") {
    const confirmar = confirm("Tem certeza que deseja excluir esta turma?");
    if (confirmar) {
      e.target.parentElement.remove(); // remove o <a> que envolve o botão
    }
  }
}

function adicionarNovaTurma() {
  let nome = prompt("Nome da nova turma:");
  if (nome === null) return;

  nome = nome.trim();
  if (nome === "") {
    alert("O nome da turma não pode ser vazio.");
    return;
  }

  const existe = Array.from(turmasContainer.querySelectorAll("button.botao")).some(
    btn => btn.textContent.toLowerCase() === nome.toLowerCase()
  );
  if (existe) {
    alert("Já existe uma turma com esse nome.");
    return;
  }

  const novoBotao = criarBotaoTurma(nome, criarHrefPeloNome(nome));
  turmasContainer.insertBefore(novoBotao, editarBtn);
}

function criarBotaoTurma(nome, href) {
  const link = document.createElement("a");
  link.href = href;
  link.className = "link";

  const btn = document.createElement("button");
  btn.className = "botao";
  btn.textContent = nome;

  if (modoEdicaoAtivo) {
    btn.addEventListener("click", interceptarClique);
  }

  link.appendChild(btn);
  return link;
}

// Função para criar href baseado no nome da turma (ajuste conforme seu padrão)
function criarHrefPeloNome(nome) {
  // Exemplo: "M1" vira "turmam1.html"
  return `turma${nome.toLowerCase()}.html`;
}

// Ao carregar a página, salva o estado inicial
window.addEventListener("DOMContentLoaded", () => {
  salvarEstado();
  desativarModoEdicao();
});
