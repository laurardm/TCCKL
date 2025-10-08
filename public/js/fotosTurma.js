const turmaDataEl = document.getElementById("turma-data");
const encodedNomeTurma = turmaDataEl.getAttribute("data-nome");
const conteudosServidor = JSON.parse(turmaDataEl.getAttribute("data-conteudos"));
const tipoUsuario = turmaDataEl.getAttribute("data-tipo") || null; // 'func' ou 'resp'
const arquivada = turmaDataEl.getAttribute("data-arquivada") === "true";

let today = new Date().toISOString().split('T')[0];

// ---------------------------
// Organizar conteúdos por data
// ---------------------------
let pagesData = [];

conteudosServidor.forEach(c => {
  const dataItem = c.dataf ? c.dataf.split('T')[0] : today;
  let pagina = pagesData.find(p => p.date === dataItem);
  if (!pagina) {
    pagina = { date: dataItem, contents: [] };
    pagesData.push(pagina);
  }

  if (c.tipo === "imagem") {
    pagina.contents.push({ tipo: "imagem", valor: c.valor, cod: c.cod });
  } else {
    pagina.contents.push({ tipo: c.tipo, valor: c.valor });
  }
});

// Garantir que a página de hoje exista
if (!pagesData.find(p => p.date === today)) {
  pagesData.push({ date: today, contents: [] });
}

let currentPageIndex = 0;

// ---------------------------
// Formatar data para exibição
// ---------------------------
function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  if (isNaN(d)) return dataStr;
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
          .replace(/^\w/, c => c.toUpperCase());
}

// ---------------------------
// Renderizar página
// ---------------------------
function renderPage() {
  const titulo = document.getElementById('data-titulo');
  const conteudoDiv = document.getElementById('conteudo-pagina');

  if (pagesData.length === 0) {
    titulo.textContent = 'Nenhuma data adicionada';
    conteudoDiv.innerHTML = '<p>Adicione um recado, evento ou foto para começar.</p>';
    return;
  }

  pagesData.sort((a, b) => a.date.localeCompare(b.date));

  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];
  titulo.textContent = formatarData(pagina.date);

  if (pagina.contents.length === 0) {
    conteudoDiv.innerHTML = pagina.date === today
      ? '<p>Ainda não há conteúdo nesse dia.</p>'
      : '<p>Sem conteúdos nesta data.</p>';
  } else {
    let textosHTML = '';
    let imagensHTML = '';

    const podeEditar = (tipoUsuario === 'func' && !arquivada);

pagina.contents.forEach((conteudo, index) => {
  const btnExcluirHTML = podeEditar 
    ? `<button class="btn-excluir" title="Excluir" onclick="excluirConteudo(${index})">
         <i class="fa-solid fa-trash"></i>
       </button>` 
    : '';

  if (conteudo.tipo === 'imagem') {
    imagensHTML += `<div class="imagem-item">
                      <img src="${conteudo.valor}" data-cod="${conteudo.cod}" class="conteudo-img"/>
                      ${btnExcluirHTML}
                    </div>`;
  } else {
    textosHTML += `<div class="conteudo-item">
                     <span class="conteudo-text">${conteudo.valor}</span>
                     ${btnExcluirHTML}
                   </div>`;
  }
});

    conteudoDiv.innerHTML = textosHTML + (imagensHTML ? `<div class="imagens-container">${imagensHTML}</div>` : '');
  }
}

// ---------------------------
// Modal
// ---------------------------
function abrirModalImagem() {
  if (tipoUsuario !== 'func' || arquivada) {
    alert('Você não tem permissão para adicionar imagens nesta turma.');
    return;
  }

  document.getElementById('modal-title').textContent = 'Adicionar Imagem';
  document.getElementById('modal-file').style.display = 'block';
  document.getElementById('modal-file').value = '';
  document.getElementById('modal-date').value = pagesData[currentPageIndex]?.date || today;
  document.getElementById('modal-bg').classList.add('active');
}


function fecharModal() {
  document.getElementById('modal-bg').classList.remove('active');
}

// ---------------------------
// Confirmar adição
// ---------------------------
function confirmarAdicao() {
  const fileInput = document.getElementById('modal-file');
  const dataf = document.getElementById('modal-date').value;

  if (!fileInput.files.length) { alert('Selecione uma imagem.'); return; }
  if (!dataf) { alert('Preencha a data.'); return; }

  const formData = new FormData();
  formData.append("foto", fileInput.files[0]);
  formData.append("dataf", dataf);

  fetch(`/turmas/${encodedNomeTurma}/fotos`, { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        let pagina = pagesData.find(p => p.date === dataf);
        if (!pagina) {
          pagina = { date: dataf, contents: [] };
          pagesData.push(pagina);
        }
        pagina.contents.push({ tipo: 'imagem', valor: data.link, cod: data.cod });
        fecharModal();
        renderPage();
      } else {
        alert("Erro ao adicionar a foto: " + (data.erro || ""));
      }
    })
    .catch(err => alert("Erro ao adicionar a foto: " + err));
}

// ---------------------------
// Excluir conteúdo
// ---------------------------
function excluirConteudo(index) {
  if (tipoUsuario !== 'func' || arquivada) {
    alert('Você não tem permissão para excluir este conteúdo.');
    return;
  }

  const pagina = pagesData[currentPageIndex];
  if (!pagina) return;
  
  const conteudo = pagina.contents[index];
    if (conteudo.tipo === 'imagem') {
      fetch(`/turmas/${encodedNomeTurma}/fotos/${conteudo.cod}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.sucesso) {
            pagina.contents.splice(index, 1);
            renderPage();
          } else {
            alert("Erro ao excluir a foto: " + (data.erro || ""));
          }
        })
        .catch(err => alert("Erro ao excluir a foto: " + err));
    } else {
      pagina.contents.splice(index, 1);
      renderPage();
    }
}


  


// ---------------------------
// Paginação
// ---------------------------
function avancarPagina() { if (currentPageIndex < pagesData.length - 1) { currentPageIndex++; renderPage(); } }
function voltarPagina() { if (currentPageIndex > 0) { currentPageIndex--; renderPage(); } }

window.onload = renderPage;
