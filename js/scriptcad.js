// Função do olho na senha (mantida)
function togglePassword(id) {
  const passwordField = document.getElementById(id);
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
}

// Validação e armazenamento no localStorage
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  // Busca os usuários já cadastrados (ou array vazio se não houver nenhum)
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verifica se o e-mail já está cadastrado
  const emailExistente = usuarios.some(user => user.email === email);

  if (emailExistente) {
    alert("Este e-mail já está cadastrado.");
    return;
  }

  // Adiciona novo usuário
  usuarios.push({ email, senha });

  // Salva no localStorage
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert("Cadastro realizado com sucesso!");

  // Redireciona para login
  window.location.href = "login.html";
});
