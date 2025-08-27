USE sistema;

CREATE TABLE parentesco (
  cod INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(6) DEFAULT 'Mãe',
  PRIMARY KEY (cod)
);

CREATE TABLE genero (
  cod INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(11),
  PRIMARY KEY (cod)
);

CREATE TABLE cargo (
  cod INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(10) DEFAULT 'Professor',
  PRIMARY KEY (cod)
);

CREATE TABLE fotosa (
  cod INT NOT NULL AUTO_INCREMENT,
  linkf VARCHAR(150) NOT NULL,
  datafotoa DATE,
  agenda INT NOT NULL,
  PRIMARY KEY (cod),
  CONSTRAINT fk_fotosa_agenda FOREIGN KEY (agenda) REFERENCES agenda(cod) ON DELETE CASCADE
);

CREATE TABLE fotos_turma (
  cod INT NOT NULL AUTO_INCREMENT,
  turma_id INT NOT NULL,
  link VARCHAR(150) NOT NULL,
  dataf DATE,
  PRIMARY KEY (cod),
  CONSTRAINT fk_fotos_turma FOREIGN KEY (turma_id) REFERENCES turma(cod) ON DELETE CASCADE
);

CREATE TABLE recados (
  cod INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(1000),
  datar DATE,
  agenda_id INT NOT NULL,
  PRIMARY KEY (cod),
  CONSTRAINT fk_recados_agenda FOREIGN KEY (agenda) REFERENCES agenda(cod) ON DELETE CASCADE
);

CREATE TABLE eventos (
  cod INT NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(100),
  datae DATE,
  agenda_id INT NOT NULL,
  PRIMARY KEY (cod),
  CONSTRAINT fk_eventos_agenda FOREIGN KEY (agenda) REFERENCES agenda(cod) ON DELETE CASCADE
);

CREATE TABLE turma (
  cod INT NOT NULL AUTO_INCREMENT,
  nome CHAR(3),
  PRIMARY KEY (cod)
);

CREATE TABLE agenda (
  cod INT NOT NULL AUTO_INCREMENT,
  aluno_cod INT,
  CONSTRAINT fk_turma_fotost FOREIGN KEY (aluno_cod) REFERENCES aluno(cod) ON DELETE SET NULL
  PRIMARY KEY (cod)
 );

CREATE TABLE responsaveis (
  cod INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(40) NOT NULL,
  data_nasc DATE NOT NULL,
  email VARCHAR(40) NOT NULL,
  foto VARCHAR(100),
  genero INT,
  parentesco INT,
  PRIMARY KEY (cod),
  CONSTRAINT fk_responsaveis_genero FOREIGN KEY (genero) REFERENCES genero(cod),
  CONSTRAINT fk_responsaveis_parentesco FOREIGN KEY (parentesco) REFERENCES parentesco(cod)
);

CREATE TABLE funcionario (
  cod INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(40) NOT NULL,
  data_nasc DATE NOT NULL,
  email VARCHAR(40) NOT NULL,
  telefone VARCHAR(15),
  foto VARCHAR(150),
  matricula CHAR(4) NOT NULL,
  cargo INT,
  genero INT,
  turma INT,
  PRIMARY KEY (cod),
  CONSTRAINT fk_funcionario_cargo FOREIGN KEY (cargo) REFERENCES cargo(cod),
  CONSTRAINT fk_funcionario_genero FOREIGN KEY (genero) REFERENCES genero(cod),
  CONSTRAINT fk_funcionario_turma FOREIGN KEY (turma) REFERENCES turma(cod)
);

CREATE TABLE aluno (
  cod INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(40) NOT NULL,
  turma INT,
  agenda INT,
  foto VARCHAR(150),
  PRIMARY KEY (cod),
  CONSTRAINT fk_aluno_turma FOREIGN KEY (turma) REFERENCES turma(cod),
  CONSTRAINT fk_aluno_agenda FOREIGN KEY (agenda) REFERENCES agenda(cod)
);

CREATE TABLE alu_resp (
  cod INT NOT NULL AUTO_INCREMENT,
  cod_aluno INT,
  cod_resp INT,
  PRIMARY KEY (cod),
  CONSTRAINT fk_alu_resp_aluno FOREIGN KEY (cod_aluno) REFERENCES aluno(cod),
  CONSTRAINT fk_alu_resp_resp FOREIGN KEY (cod_resp) REFERENCES responsaveis(cod)
);

CREATE TABLE usuario (
  cod INT NOT NULL AUTO_INCREMENT,
  login VARCHAR(100) NOT NULL,
  senha VARCHAR(100) NOT NULL,
  tipo ENUM('responsavel', 'funcionario') NOT NULL,
  cod_funcionario INT,
  cod_responsavel INT,
  PRIMARY KEY (cod),
  CONSTRAINT fk_usuario_funcionario FOREIGN KEY (cod_funcionario) REFERENCES funcionario(cod),
  CONSTRAINT fk_usuario_responsavel FOREIGN KEY (cod_responsavel) REFERENCES responsaveis(cod)
);

CREATE TABLE recados_turma (
  cod INT NOT NULL AUTO_INCREMENT,
  turma_id INT NOT NULL,
  descricao VARCHAR(150),
  datar VARCHAR(150) NOT NULL,
  PRIMARY KEY (cod),
  CONSTRAINT fk_recados_turma FOREIGN KEY (turma_id) REFERENCES turma(cod) ON DELETE CASCADE
);