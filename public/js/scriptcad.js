function togglePassword(id) {
  const passwordField = document.getElementById(id);
  passwordField.type = passwordField.type === "password" ? "text" : "password";
}

// Substitui alert padrão por um alerta personalizado
window.alert = function(message, callback = null) {
  const alertBox = document.getElementById('custom-alert');
  const alertMessage = document.getElementById('alert-message');
  const alertButton = document.getElementById('alert-ok-button');

  alertMessage.textContent = message;
  alertBox.classList.remove('hidden');

  alertButton.onclick = () => {
    alertBox.classList.add('hidden');
    if (typeof callback === 'function') {
      callback();
    }
  };
};

document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const data_nasc = document.getElementById('data_nasc').value;
  const genero = parseInt(document.getElementById('genero').value);

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  fetch('/cadastro/resp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, data_nasc, genero })
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text); });
    }
    return response.text();
  })
  .then(() => {
    alert("Cadastro realizado com sucesso!", () => {
      window.location.href = "/";
    });
  })
  .catch(err => {
    alert("Erro ao cadastrar: " + err.message);
  });
});
