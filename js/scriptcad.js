//————————————————————————————————— função do olho
function togglePassword(id) {
  const passwordField = document.getElementById(id); // pega o campo da senha pelo id
  const type = passwordField.type === "password" ? "text" : "password"; // se for password, troca para text, e vice-versa
  passwordField.type = type; // atualiza o tipo do campo para mostrar ou esconder a senha
}

//————————————————————————————————— validação e armaxzenamento no localstorage
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault(); // evita que o formulário seja enviado normalmente (recarregando a página)

  const email = document.getElementById('email').value.trim(); // pega o valor do e-mail e tira espaços
  const senha = document.getElementById('senha').value; // pega o valor da senha
  const confirmarSenha = document.getElementById('confirmarSenha').value; // pega a confirmação da senha

//————————————————————————————————— verificação de senha
  if (senha !== confirmarSenha) { // verifica se as duas senhas são iguais
    alert("As senhas não coincidem."); // se forem diferentes, mostra um aviso
    return; // para a execução do código
  }

//————————————————————————————————— busca dos usuários
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // pega os usuários salvos no localStorage
  const emailExistente = usuarios.some(user => user.email === email); // verifica se o e-mail já está na lista

  if (emailExistente) { // se o e-mail já existir
    alert("Este e-mail já está cadastrado."); // avisa o usuário
    return; // e não continua com o cadastro
  }

  // Adiciona novo usuário
  usuarios.push({ email, senha }); // adiciona o novo usuário com e-mail e senha

  // Salva no localStorage
  localStorage.setItem('usuarios', JSON.stringify(usuarios)); // salva a lista atualizada no localStorage

  alert("Cadastro realizado com sucesso!"); // avisa que deu tudo certo

  // Redireciona para login
  window.location.href = "login.html"; // redireciona para a página de login
});
