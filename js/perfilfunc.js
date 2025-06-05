// Impede datas futuras no campo data de nascimento
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').setAttribute('max', hoje);

// Carrega os dados do localStorage e preenche os campos
const perfil = JSON.parse(localStorage.getItem('perfil')) || {};
document.getElementById('nome').value = perfil.nome || '';
document.getElementById('email').value = perfil.email || '';
document.getElementById('celular').value = perfil.celular || '';
document.getElementById('data').value = perfil.dataNascimento || '';
document.getElementById('turmas').value = perfil.turmas || '';
document.getElementById('cargo').value = perfil.cargo || '';

const editarBtn = document.getElementById('editar');
const salvarBtn = document.getElementById('salvar');
const voltarBtn = document.getElementById('voltar');

// Esconde o botão salvar inicialmente
salvarBtn.style.display = 'none';

// Ativa edição
editarBtn.addEventListener('click', () => {
  const inputs = document.querySelectorAll('#perfilForm input, #perfilForm select');
  inputs.forEach(input => input.disabled = false);
  editarBtn.style.display = 'none';
  salvarBtn.style.display = 'inline-block';
});

// Salva os dados
salvarBtn.addEventListener('click', () => {
  const dataInput = document.getElementById('data');
  const dataNascimento = dataInput.value;
  const hoje = new Date().toISOString().split('T')[0];

  // Validação de data futura
  if (dataNascimento > hoje) {
    alert('A data de nascimento não pode ser no futuro.');
    dataInput.classList.add('erro');
    return;
  } else {
    dataInput.classList.remove('erro');
  }

  const perfilAtualizado = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    celular: document.getElementById('celular').value,
    dataNascimento: dataNascimento,
    turmas: document.getElementById('turmas').value,
    cargo: document.getElementById('cargo').value
  };

  localStorage.setItem('perfil', JSON.stringify(perfilAtualizado));
  const inputs = document.querySelectorAll('#perfilForm input, #perfilForm select');
  inputs.forEach(input => input.disabled = true);
  salvarBtn.style.display = 'none';
  editarBtn.style.display = 'inline-block';
  alert('Alterações salvas com sucesso!');
});

// Botão voltar
voltarBtn.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('nome').addEventListener('input', function () {
      const nomeDigitado = this.value.trim();
      document.getElementById('nomeDisplay').textContent = nomeDigitado || "Nome";
    });

    // Habilita campos ao clicar em "Editar"
    document.getElementById('editar').addEventListener('click', function () {
      document.querySelectorAll('#perfilForm input, #perfilForm select').forEach(el => {
        el.disabled = false;
      });
    });