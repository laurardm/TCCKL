let today = new Date().toISOString().split('T')[0];

let pagesData = [
  { date: today, contents: [] }
];

let currentPageIndex = 0;
let editIndex = null;

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());
}

function renderPage() {
  const titulo = document.getElementById('data-titulo');
  const conteudoDiv = document.getElementById('conteudo-pagina');

  if (pagesData.length === 0) {
    titulo.textContent = 'Nenhuma data adicionada';
    conteudoDiv.innerHTML = '<p>Adicione um recado para começar.</p>';
    return;
  }

  pagesData.sort((a, b) => a.date.localeCompare(b.date));
  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  if (pagina.contents.length === 0) {
    conteudoDiv.innerHTML = '<p>Ainda não há recados nesse dia.</p>';
  } else {
    conteudoDiv.innerHTML = pagina.contents.map((conteudo, index) => `
      <div class="conteudo-item">
        <span class="conteudo-text">${conteudo}</span>
        <button class="btn-editar" onclick="editarConteudo(${index})">
          <i class="fa-solid fa-pen"></i>
        </button>
      </div>
    `).join('');
  }
}

function abrirModalRecado() {
  editIndex = null;
  document.getElementById('modal-title').textContent = 'Adicionar recado';
  document.getElementById('modal-text').value = '';
  document.getElementById('modal-date').value = pagesData[currentPageIndex].date;
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
}

function confirmarAdicao() {
  const data = document.getElementById('modal-date').value;
  const texto = document.getElementById('modal-text').value.trim();

  if (!data) {
    mostrarAlerta('Por favor, selecione uma data.');
    return;
  }
  if (!texto) {
    mostrarAlerta('Por favor, insira um recado.');
    return;
  }

  let pagina = pagesData.find(p => p.date === data);
  if (!pagina) {
    pagina = { date: data, contents: [] };
    pagesData.push(pagina);
    pagesData.sort((a, b) => a.date.localeCompare(b.date));
    currentPageIndex = pagesData.findIndex(p => p.date === data);
  }

  if (editIndex !== null) {
    pagina.contents[editIndex] = texto;
  } else {
    pagina.contents.push(texto);
  }

  fecharModal();
  renderPage();
}

function editarConteudo(index) {
  const pagina = pagesData[currentPageIndex];
  editIndex = index;
  document.getElementById('modal-title').textContent = 'Editar recado';
  document.getElementById('modal-date').value = pagina.date;
  document.getElementById('modal-text').value = pagina.contents[index];
  document.getElementById('modal-bg').classList.add('active');
}

function avancarPagina() {
  if (currentPageIndex < pagesData.length - 1) {
    currentPageIndex++;
    renderPage();
  }
}

function voltarPagina() {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    renderPage();
  }
}

function mostrarAlerta(msg) {
  document.getElementById("alerta-msg").textContent = msg;
  document.getElementById("alerta-bg").style.display = "flex";
}

function fecharAlerta() {
  document.getElementById("alerta-bg").style.display = "none";
}

window.onload = () => {
  renderPage();
};

function abrirModalEditar(cod, data, texto) {
  const nomeTurma = document.body.dataset.nomeTurma;

  document.getElementById("modal-title").textContent = "Editar recado";
  document.getElementById("modal-date").value = data.split("T")[0];
  document.getElementById("modal-text").value = texto;

  const form = document.getElementById("modal-form");
  form.action = `/turmas/${nomeTurma}/recados/${cod}/edit`;

  document.getElementById("modal-bg").classList.add("active");
}

