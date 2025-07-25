drop database sistema;
create database sistema;
use sistema;

create table parentesco (
  cod int not null auto_increment,
  descricao varchar(6) default 'Mãe',
  primary key (cod)
);

create table genero (
  cod int not null auto_increment,
  descricao varchar(11),
  primary key (cod)
);

create table cargo (
  cod int not null auto_increment,
  descricao varchar(10) default 'Professor',
  primary key (cod)
);

create table fotosa (
  cod int not null auto_increment,
  linkf varchar(150) not null,
  descricao varchar(40),
  primary key (cod)
);

create table fotost (
  cod int not null auto_increment,
  descricao varchar(150),
  primary key (cod)
);

create table recados (
  cod int not null auto_increment,
  descricao varchar(1000),
  datar date,
  primary key (cod)
);

create table eventos (
  cod int not null auto_increment,
  descricao varchar(100),
  datae date,
  primary key (cod)
);

create table turma (
  cod int not null auto_increment,
  nome char(3),
  fotost int,
  primary key (cod),
  foreign key (fotost) references fotost (cod)
);

create table agenda (
  cod int not null auto_increment,
  recados int,
  fotosa int,
  eventos int,
  primary key (cod),
  foreign key (recados) references recados (cod),
  foreign key (fotosa) references fotosa (cod),
  foreign key (eventos) references eventos (cod)
);


create table responsaveis (
  cod int not null auto_increment,
  nome varchar(40) not null,
  data_nasc date not null,
  email varchar(40) not null,
  foto varchar(100),
  genero int,
  parentesco int,
  primary key (cod),
  foreign key (genero) references genero (cod),
  foreign key (parentesco) references parentesco (cod)
);

create table funcionario (
  cod int not null auto_increment,
  nome varchar(40) not null,
  data_nasc date not null,
  email varchar(40) not null,
  telefone varchar(15),
  foto varchar(150),
  matricula char(4) not null,
  cargo int,
  genero int,
  turma int,
  primary key (cod),
  foreign key (cargo) references cargo (cod),
  foreign key (genero) references genero (cod),
  foreign key (turma) references turma (cod)
);

create table aluno (
  cod int not null auto_increment,
  nome varchar(40) not null,
  turma int,
  agenda int,
  primary key (cod),
  foreign key (turma) references turma (cod),
  foreign key (agenda) references agenda (cod)
);

create table alu_resp (
  cod int not null auto_increment,
  cod_aluno int,
  cod_resp int,
  primary key (cod),
  foreign key (cod_aluno) references aluno (cod),
  foreign key (cod_resp) references responsaveis (cod)
);

create table usuario (
  cod int not null auto_increment,
  login varchar(100) not null,
  senha varchar(100) not null,
  tipo enum('responsavel', 'funcionario') not null,
  cod_funcionario int,
  cod_responsavel int,
  primary key (cod),
  foreign key (cod_funcionario) references funcionario (cod),
  foreign key (cod_responsavel) references responsaveis (cod)
);