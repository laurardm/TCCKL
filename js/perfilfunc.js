//————————————————————————————————— impede datas futuas nos campos
const hoje = new Date().toISOString().split('T')[0]; // pega a data de hoje no formato yyyy-mm-dd
  document.getElementById('data').setAttribute('max', hoje); // define o valor máximo permitido no campo data

//————————————————————————————————— carrega os dados do localstorage e preenche os campos
const perfil = JSON.parse(localStorage.getItem('perfil')) || {}; // pega os dados salvos no localStorage ou usa objeto vazio
  document.getElementById('nome').value = perfil.nome || ''; // preenche o campo nome se tiver
  document.getElementById('email').value = perfil.email || ''; // preenche o campo email se tiver
  document.getElementById('celular').value = perfil.celular || ''; // preenche o campo celular se tiver
  document.getElementById('data').value = perfil.dataNascimento || ''; // preenche o campo data de nascimento se tiver
  document.getElementById('turmas').value = perfil.turmas || ''; // preenche o campo turmas se tiver
  document.getElementById('cargo').value = perfil.cargo || ''; // preenche o campo cargo se tiver
const editarBtn = document.getElementById('editar'); // seleciona o botão editar
const salvarBtn = document.getElementById('salvar'); // salvar
const voltarBtn = document.getElementById('voltar'); // voltar

//————————————————————————————————— esconde o botão de salvar no inicio
salvarBtn.style.display = 'none'; 

//————————————————————————————————— ativa a edição
editarBtn.addEventListener('click', () => { // quando clicar no botão editar
  const inputs = document.querySelectorAll('#perfilForm input, #perfilForm select'); // pega todos os inputs e selects do formulário
  inputs.forEach(input => input.disabled = false); // ativa todos os campos para edição
  editarBtn.style.display = 'none'; // esconde o botão editar
  salvarBtn.style.display = 'inline-block'; // mostra o botão salvar
});


salvarBtn.addEventListener('click', () => { //salva os dados quando clicar no botão salvar
  const dataInput = document.getElementById('data'); // seleciona o input da data de nascimento
  const dataNascimento = dataInput.value; // pega o valor da data
  const hoje = new Date().toISOString().split('T')[0]; // pega a data atual novamente

  //————————————————————————————————— Validação de data futura
  if (dataNascimento > hoje) { // se a data digitada for maior que hoje
    alert('A data de nascimento não pode ser no futuro.'); // mostra alerta de erro
    dataInput.classList.add('erro'); // adiciona uma classe de erro no input
    return; // cancela o salvamento
  } else {
    dataInput.classList.remove('erro'); // remove a classe de erro se a data estiver correta
  }

  //————————————————————————————————— cria um objeto com os dados atualizados
  const perfilAtualizado = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    celular: document.getElementById('celular').value,
    dataNascimento: dataNascimento,
    turmas: document.getElementById('turmas').value,
    cargo: document.getElementById('cargo').value
  };

//————————————————————————————————— local storage
  localStorage.setItem('perfil', JSON.stringify(perfilAtualizado)); // salva os dados no localStorage

  const inputs = document.querySelectorAll('#perfilForm input, #perfilForm select'); // seleciona novamente os campos
  inputs.forEach(input => input.disabled = true); // desativa a edição
  salvarBtn.style.display = 'none'; // esconde o botão salvar
  editarBtn.style.display = 'inline-block'; // mostra o botão editar novamente
  alert('Alterações salvas com sucesso!'); // mostra alerta de sucesso
});

//————————————————————————————————— botão de voltar
voltarBtn.addEventListener('click', () => { // quando clicar em voltar
  window.history.back(); // volta para a página anterior
});

//————————————————————————————————— exibição do nome
document.getElementById('nome').addEventListener('input', function () { // escuta o que é digitado no nome
  const nomeDigitado = this.value.trim(); // remove espaços no início e fim
  document.getElementById('nomeDisplay').textContent = nomeDigitado || "Nome"; // atualiza a exibição do nome
});

//————————————————————————————————— habilita os campos para editar
document.getElementById('editar').addEventListener('click', function () { // ao clicar em editar
  document.querySelectorAll('#perfilForm input, #perfilForm select').forEach(el => { // pega todos os campos
    el.disabled = false; // ativa todos os campos para edição
  });
});
