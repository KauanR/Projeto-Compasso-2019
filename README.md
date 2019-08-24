É necessário criar um arquivo .env na raíz do repositório com as informações do banco de dados e do port, exemplo de arquivo .env: 
DBHOST="localhost"
DBUSER="root"
DBPASSWORD="adminadmin" 
DBNAME="my_db"
PORT=6663.

Como usar a classe Controller:
Deve ser informado no nome singular da rota, o nome plural da rota, o nome da tabela do banco de dados e o schema de validação para validar os dados que vão ser registrados nessa tabela, o shcema de validação usado é um JSON que contém as validações do do express-validator, documentação: https://express-validator.github.io/docs/schema-validation.html, para validar atributos que são NOT NULL deve ser colocado no schema de validação um atributo com o nome de "notNull" com o valor "true", exemplo:
{
    notNull: true
}

