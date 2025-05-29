// função do olho na senha
    function togglePassword(id) {
        var passwordField = document.getElementById(id);
        var type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
  }
  
  // validação do formulário
    document.getElementById('cadastroForm').addEventListener('submit', function(event) {
        var senha = document.getElementById('senha').value;
        var confirmarSenha = document.getElementById('confirmarSenha').value;
  
    // verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      event.preventDefault(); // Impede o envio do formulário
      alert("As senhas não coincidem. Por favor, verifique.");
    }
  });
  