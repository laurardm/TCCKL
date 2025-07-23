const hoje = new Date().toISOString().split('T')[0];
const dataInput = document.getElementById('data');

dataInput.setAttribute('max', hoje);

const editarBtn = document.getElementById('editar');
const salvarBtn = document.getElementById('salvar');
const voltarBtn = document.getElementById('voltar');
const inputs = document.querySelectorAll('#perfilForm input:not(#turmas)');

function setInputsDisabled(disabled) {
  inputs.forEach(input => input.disabled = disabled);
}

setInputsDisabled(true);
salvarBtn.disabled = true;
salvarBtn.style.display = 'none';

editarBtn.addEventListener('click', () => {
  setInputsDisabled(false);
  salvarBtn.disabled = false;
  salvarBtn.style.display = 'inline-block';
  editarBtn.style.display = 'none';
});

voltarBtn.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('perfilForm').addEventListener('submit', (e) => {
  if (dataInput.value > hoje) {
    e.preventDefault();
    alert('A data de nascimento não pode ser no futuro.');
    dataInput.classList.add('erro');
  } else {
    dataInput.classList.remove('erro');
    // Form será submetido normalmente
  }
});

document.getElementById('nome').addEventListener('input', function () {
  const nomeDigitado = this.value.trim();
  document.getElementById('nomeDisplay').textContent = nomeDigitado || 'Nome';
});
