
document.addEventListener("DOMContentLoaded", () => { //espera a página carregar para executar o código
  const params = new URLSearchParams(window.location.search); //pega os parâmetros da url
  const id = params.get("id"); //pega o id do aluno da url
  const turma = params.get("turma"); //pega a turma da url
  const retorno = params.get("retorno") || `/turmas/turma${turma.toLowerCase()}.html`; //define para onde volta depois de salvar

  if (!id || !turma) { //verifica se o id ou turma não foram informados
    alert("ID ou turma não informado."); //mostra alerta de erro
    return; //para a execução do script
  }

  const chaveAluno = `aluno-${turma}-${id}`; //cria uma chave única para salvar os dados no localStorage

  const nomeInput = document.getElementById("nomeAluno"); //seleciona o campo de nome do aluno
  const fotoImg = document.getElementById("fotoAluno"); //seleciona o elemento da imagem do aluno
  const inputFoto = document.getElementById("inputFoto"); //seleciona o input para escolher a foto

  let aluno = JSON.parse(localStorage.getItem(chaveAluno)) || { //tenta recuperar os dados do aluno do localStorage, ou usa padrão
    nome: `Aluno ${parseInt(id) + 1}`, //nome padrão baseado no id
    foto: "/imagens/perfil.png" //foto padrão
  };

  nomeInput.value = aluno.nome; //preenche o input com o nome do aluno
  fotoImg.src = aluno.foto; //mostra a foto do aluno

  inputFoto.addEventListener("change", (e) => { //escuta quando o usuário escolhe uma nova foto
    const file = e.target.files[0]; //pega o arquivo selecionado
    if (file) { //se um arquivo foi selecionado
      const reader = new FileReader(); //cria um leitor de arquivo
      reader.onload = () => { //quando o arquivo terminar de carregar
        aluno.foto = reader.result; //salva a imagem em base64 no objeto aluno
        fotoImg.src = reader.result; //atualiza a foto mostrada na página
      };
      reader.readAsDataURL(file); //lê o arquivo como base64
    }
  });

  document.getElementById("salvarAluno").addEventListener("click", () => { //escuta o clique no botão salvar
    aluno.nome = nomeInput.value; //atualiza o nome do aluno com o valor do input
    localStorage.setItem(chaveAluno, JSON.stringify(aluno)); //salva os dados no localStorage
    alert("Dados salvos!"); //avisa o usuário que salvou

    //Volta para a tela de onde veio
    window.location.href = retorno; //redireciona para a página anterior
  });
});
