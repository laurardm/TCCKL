//————————————————————————————————— função do olho
function togglePassword(id) {
  const passwordField = document.getElementById(id);
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
}

//————————————————————————————————— envio para o backend (substitui o localStorage)
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const data = document.getElementById('data').value;
  const genero = document.getElementById('genero').value;

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  fetch('/api/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha, data, genero })
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text); });
    }
    return response.text();
  })
  .then(message => {
    alert(message);
    window.location.href = "login.html";
  })
  .catch(err => alert(err.message));
});
