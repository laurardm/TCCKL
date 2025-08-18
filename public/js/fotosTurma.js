let today = new Date().toISOString().split('T')[0];

let pagesData = [
  { date: today, contents: [] }, // Começa com a data atual sem conteúdos
];

let currentPageIndex = 0;
let tipoAtual = '';

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
    conteudoDiv.innerHTML = '<p>Adicione um recado, evento ou foto para começar.</p>';
    return;
  }

  pagesData.sort((a, b) => a.date.localeCompare(b.date));

  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;

  const pagina = pagesData[currentPageIndex];

  titulo.textContent = formatarData(pagina.date);

  if (pagina.contents.length === 0) {
    if (pagina.date === today) {
      conteudoDiv.innerHTML = '<p>Ainda não há conteúdo nesse dia.</p>';
    } else {
      conteudoDiv.innerHTML = '<p>Sem conteúdos nesta data.</p>';
    }
  } else {
    let textosHTML = '';
    let imagensHTML = '';

    pagina.contents.forEach((conteudo, index) => {
      if (conteudo.startsWith('Imagem:')) {
        const imgTag = conteudo.replace('Imagem: ', '');
        imagensHTML += `<div class="imagem-item">
                          <button class="btn-excluir" title="Excluir" onclick="excluirConteudo(${index})">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                          ${imgTag}
                        </div>`;
      } else {
        textosHTML += `<div class="conteudo-item">
                         <button class="btn-excluir" title="Excluir" onclick="excluirConteudo(${index})">
                           <i class="fa-solid fa-trash"></i>
                         </button>
                         <span class="conteudo-text">${conteudo}</span>
                       </div>`;
      }
    });

    let htmlFinal = textosHTML;
    if (imagensHTML) {
      htmlFinal += `<div class="imagens-container">${imagensHTML}</div>`;
    }
    conteudoDiv.innerHTML = htmlFinal;
  }
}

function abrirModal(tipo) {
  tipoAtual = tipo;
  document.getElementById('modal-title').textContent = `Adicionar ${tipo}`;
  document.getElementById('modal-text').style.display = 'block';
  document.getElementById('modal-text').value = '';
  document.getElementById('modal-file').style.display = 'none';
  document.getElementById('modal-file').value = '';
  document.getElementById('modal-date').value = pagesData[currentPageIndex].date;
  document.getElementById('modal-bg').classList.add('active');
  document.getElementById('modal-date').focus();
}

function abrirModalImagem() {
  tipoAtual = 'Imagem';
  document.getElementById('modal-title').textContent = 'Adicionar Imagem';
  document.getElementById('modal-text').style.display = 'none';
  document.getElementById('modal-text').value = '';
  document.getElementById('modal-file').style.display = 'block';
  document.getElementById('modal-file').value = '';
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
  const fileInput = document.getElementById('modal-file');
  const nomeTurma = decodeURIComponent(window.encodedNomeTurma || ""); // pega do EJS

  if (!data) {
    alert('Por favor, preencha a data.');
    return;
  }

  if (tipoAtual === 'Imagem') {
    if (fileInput.files.length === 0) {
      alert('Por favor, selecione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append("foto", fileInput.files[0]);

    fetch(`/turmas/${nomeTurma}/fotos`, {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        pagesData[currentPageIndex].contents.push(`Imagem: <img src="${data.link}" data-cod="${data.cod}" class="conteudo-img"/>`);
        fecharModal();
        renderPage();
      } else {
        alert("Erro ao adicionar a foto");
      }
    })
    .catch(err => alert("Erro ao adicionar a foto: " + err));

  } else {
    if (!texto) {
      alert('Por favor, preencha o texto.');
      return;
    }
    pagesData[currentPageIndex].contents.push(`${tipoAtual}: ${texto}`);
    fecharModal();
    renderPage();
  }
}

function excluirConteudo(index) {
  const pagina = pagesData[currentPageIndex];
  if (!pagina) return;

  const conteudo = pagina.contents[index];
  const imgTagMatch = conteudo.match(/data-cod="(\d+)"/);

  if (imgTagMatch) {
    // é uma imagem -> excluir do backend
    const codFoto = imgTagMatch[1];
    const nomeTurma = decodeURIComponent(window.encodedNomeTurma || "");

    fetch(`/turmas/${nomeTurma}/fotos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cod: codFoto })
    })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        pagina.contents.splice(index, 1);
        renderPage();
      } else {
        alert("Erro ao excluir a foto");
      }
    })
    .catch(err => alert("Erro ao excluir a foto: " + err));
  } else {
    // é texto
    pagina.contents.splice(index, 1);
    renderPage();
  }
}

function excluirConteudo(index) {
  const pagina = pagesData[currentPageIndex];
  if (pagina) {
    pagina.contents.splice(index, 1);
    renderPage();
  }
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

window.onload = () => {
  renderPage();
};

if (imagensHTML) {
  htmlFinal += `<div class="imagens-container">${imagensHTML}</div>`;
}