// Impede datas futuras no campo data
const hoje = new Date().toISOString().split('T')[0];
const dataInput = document.getElementById('data');
dataInput.setAttribute('max', hoje);

// Seleciona botões e inputs
const editarBtn = document.getElementById('editar');
const salvarBtn = document.getElementById('salvar');
const voltarBtn = document.getElementById('voltar');
const inputs = document.querySelectorAll('#perfilForm input, #perfilForm select');

// Inicializa campos com dados do localStorage
const perfil = JSON.parse(localStorage.getItem('perfil')) || {};
document.getElementById('nome').value = perfil.nome || '';
document.getElementById('email').value = perfil.email || '';
document.getElementById('celular').value = perfil.celular || '';
dataInput.value = perfil.dataNascimento || '';
document.getElementById('turmas').value = perfil.turmas || '';
document.getElementById('cargo').value = perfil.cargo || '';
document.getElementById('nomeDisplay').textContent = perfil.nome || 'Nome';

// Estado inicial: inputs desabilitados, botão salvar escondido
inputs.forEach(input => input.disabled = true);
salvarBtn.style.display = 'none';

// Função para habilitar/desabilitar inputs
function setInputsDisabled(disabled) {
  inputs.forEach(input => input.disabled = disabled);
}

// Evento: clicar em Editar
editarBtn.addEventListener('click', () => {
  setInputsDisabled(false);        // habilita inputs
  editarBtn.style.display = 'none';
  salvarBtn.style.display = 'inline-block';
});

// Evento: clicar em Salvar
salvarBtn.addEventListener('click', () => {
  const dataNascimento = dataInput.value;

  // Validação data futura
  if (dataNascimento > hoje) {
    alert('A data de nascimento não pode ser no futuro.');
    dataInput.classList.add('erro');
    return;
  } else {
    dataInput.classList.remove('erro');
  }

  // Atualiza objeto perfil e salva no localStorage
  const perfilAtualizado = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    dataNascimento: dataNascimento,
    turmas: document.getElementById('turmas').value.trim(),
    cargo: document.getElementById('cargo').value.trim()
  };

  localStorage.setItem('perfil', JSON.stringify(perfilAtualizado));

  // Atualiza display do nome
  document.getElementById('nomeDisplay').textContent = perfilAtualizado.nome || 'Nome';

  // Desabilita inputs e ajusta botões
  setInputsDisabled(true);
  salvarBtn.style.display = 'none';
  editarBtn.style.display = 'inline-block';

  alert('Alterações salvas com sucesso!');
});

// Evento: clicar em Voltar
voltarBtn.addEventListener('click', () => {
  window.history.back();
});

// Evento: atualiza nome em tempo real no display
document.getElementById('nome').addEventListener('input', function () {
  const nomeDigitado = this.value.trim();
  document.getElementById('nomeDisplay').textContent = nomeDigitado || 'Nome';
});
