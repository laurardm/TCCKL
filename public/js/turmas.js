document.addEventListener('DOMContentLoaded', () => {
  const nomeTurma = document.querySelector('.turma-titulo').textContent.replace('Turma ', '').trim();
  const containerAlunos = document.querySelector('.grade-alunos');
  const formAdicionar = document.getElementById('form-adicionar-aluno');
  const inputNovoNome = document.getElementById('novo-nome');

  function ativarEdicao(divAluno) {
    const inputNome = divAluno.querySelector('.nome-aluno');
    const btnEditar = divAluno.querySelector('.btn-editar');
    const btnSalvar = divAluno.querySelector('.btn-salvar');

    inputNome.removeAttribute('readonly');
    inputNome.focus();

    btnEditar.style.display = 'none';
    btnSalvar.style.display = 'inline-block';
  }

  async function salvarEdicao(divAluno) {
    const cod = divAluno.dataset.id;
    const inputNome = divAluno.querySelector('.nome-aluno');
    const btnEditar = divAluno.querySelector('.btn-editar');
    const btnSalvar = divAluno.querySelector('.btn-salvar');

    const nome = inputNome.value.trim();

    if (!nome) {
      alert('Nome do aluno não pode ficar vazio.');
      return;
    }

    try {
      const res = await fetch(`/turmas/${nomeTurma}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod, nome })
      });

      if (!res.ok) throw new Error('Erro ao salvar edição');

      inputNome.setAttribute('readonly', true);
      btnEditar.style.display = 'inline-block';
      btnSalvar.style.display = 'none';

    } catch (err) {
      alert(err.message);
    }
  }

  async function excluirAluno(divAluno) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    const cod = divAluno.dataset.id;

    try {
      const res = await fetch(`/turmas/${nomeTurma}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod })
      });

      if (!res.ok) throw new Error('Erro ao excluir aluno');

      divAluno.remove();

    } catch (err) {
      alert(err.message);
    }
  }

  containerAlunos.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.classList.contains('btn-editar')) {
      ativarEdicao(btn.parentElement);
    } else if (btn.classList.contains('btn-salvar')) {
      salvarEdicao(btn.parentElement);
    } else if (btn.classList.contains('btn-excluir')) {
      excluirAluno(btn.parentElement);
    }
  });

  formAdicionar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = inputNovoNome.value.trim();

    if (!nome) {
      alert('Preencha o nome do aluno.');
      return;
    }

    try {
      const res = await fetch(`/turmas/${nomeTurma}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });

      if (!res.ok) throw new Error('Erro ao adicionar aluno');

      window.location.reload();

    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('btnFotos').addEventListener('click', () => {
    window.location.href = '/fotos-turma.html';
  });

});
