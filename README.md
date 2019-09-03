# Configuração inicial
É necessário criar um arquivo .env na raíz do repositório com as informações do banco de dados e do port, exemplo de arquivo .env:
```
DBHOST="localhost"
DBUSER="root"
DBPASSWORD=adminadmin 
DBNAME="my_db"
PORT=6663
```
Não bote aspas ao redor do DBPASSWORD. É necessário também rodar o comando "npm install".

# Como usar a classe Controller
Deve ser informado o nome da tabela do banco de dados e o schema de validação para validar os dados que vão ser registrados nessa tabela, o schema de validação usado é um JSON que contém as validações do do express-validator, documentação: https://express-validator.github.io/docs/schema-validation.html. Para validar atributos que são NOT NULL deve ser colocado no schema de validação um atributo com o nome de "notNull" com o valor "true", exemplo:
```javascript
{
    notNull: true
}
```
Cada mensagem de erro deve ter a informação apropriado sobre o erro. Eu recomendo criar uma nova classe dentro da pasta "controllers" que tenha o nome da tabela seguido pela palavra controller, em cammel case, e que herde da classe mãe Controller, como eu fiz no caso do CriteriaController:
```javascript
module.exports = class CriteriaController extends Controller {
    constructor() {
        super("criteria", {
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 500
                    }
                },
                notNull: true,
                errorMessage: "O valor de description deve ser uma string e deve ter entre 1 e 500 caractéres."
            },
            kpiId: {
                notNull: true,
                fk: "kpis"
            },
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                errorMessage: "O valor de type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            value: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O valor de value deve ser um inteiro maior que 0."
            }
        })
    }
}
```
A validação foi feita com base no código em SQL para a tabela:
``` SQL
CREATE TABLE IF NOT EXISTS `mydb`.`CRITERIA` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(100) NOT NULL,
  `value` INT NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `kpi_id` INT NOT NULL,
  PRIMARY KEY (`id`, `kpi_id`),
  INDEX `fk_CRITERIA_KPIS1_idx` (`kpi_id` ASC) VISIBLE,
  CONSTRAINT `fk_CRITERIA_KPIS1`
    FOREIGN KEY (`kpi_id`)
    REFERENCES `mydb`.`KPIS` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
```
Não é necessário definir uma validação para o atributo "id", pois ela já acontece na classe Controller. Um atributo que seja foreign key precisa ter no seu schema de validação o atributo "fk" com nome em plural da rota para acessar a tabela que essa foreign key referencia, exemplo:
```JSON
"kpiId": {
    "notNull": true,
    "fk": "kpis"
}
```
Não é preciso definir mensagem de erro e nem validação para inteiro maior que 0, pois isso acontece automaticamente na classe Controller.

# Como acessar as rotas
Para que as rotas criadas nesse controller possam ser acessadas é necessário ir até o arquivo config/custom-express.js, instanciar um novo objeto da classe desse controller e chamar a função app.use() mandando como parâmetro o atributo "router" do objeto instanciado, exemplo:
```javascript
const CriteriaController = require("../app/controllers/CriteriaController")
const criteriaController = new CriteriaController()
app.use(criteriaController.router)
```
Novas rotas vão ser criadas usando os nome da tabela em kebbab case. Exemplos:
```
-> "GET /criteria?id[$eq]=1": Pega dados com base na query;
-> "GET /criteria/:id: Pega dados com base no id;

-> "DELETE /criteria?id[$eq]=1": Apaga dados com base na query;
-> "DELETE /criteria/:id": Apaga dados com base no id;

-> "PATCH /criteria?id[$eq]=1": Atualiza dados com base na query e no JSON enviado;
-> "PATCH /criteria/:id": Atualiza dados com base no id e no JSON enviado;

-> "POST /criteria/multiple": Adiciona várias linhas para a tabela do banco com base nos JSONs enviados dentro do atributo "list".
-> "POST /criteria": Adiciona uma linha para a tabela do banco com base no JSON enviado.
```

# Query em JSON
A query precisa informar um atributo válido da tabela do banco de dados, a operção (pegar, apagar ou atualizar) vai ser executada nas linhas que tiverem atributos que sejam iguais aos atributos da query, por exemplo a query:
```JSON
{
    "nome": {
        "$eq":"igor"
    }
}
``` 
executa a operação em todas as linhas que tiverem o atributo "nome" igual ao valor "igor". A estrutura da query em JSON é basicamente:
```Javascript
{

    "limit": {
        "$count": /*<int maior ou igual a 0>*/,
        "$offset": /*<int maior ou igual a 0>*/
    },

    "sort": {
        "$by": /*<atributo válido>*/,
        "$order": /*<"asc" ou "desc">*/
    },

    "except": /*<string de atributos válidos separados por vírgula>*/,

    /*<atributo válido>*/: {
        /*<"$eq", "$dif", "$ls", "$lse", "$gr" ou "$gre">*/: /*<valor válido para o atributo>*/,
        "$in": /*<string de valores válidos para o atributo separados por vírgula>*/
    }

}
```
A conversão de JSON para SQL acontece na classe DAO no método "gerarQuery". A opção "limit" define quantas linhas vão ser buscadas e a opção "sort" define o ordenamento das linhas buscadas, essas opções não podem ser usadas na operação "update" por causa de limitações do mysql. O except define quais atributos não vão ser retornados, só pode ser usado nas rotas de GET. O significados em SQL dos outros atributos são:
```Javascript
{
    $eq: "=",
    $dif: "!=",
    $ls: "<",
    $lse: "<=",
    $gr: ">",
    $gre: ">=",
    $in: "IN"
}
```
Exemplo prático:
```JSON
{

    "limit": {
        "$count": 1,
        "$offset": 0
    },

    "sort": {
        "$by": "id",
        "$order": "desc"
    },

    "except": "name,type",

    "value": {
        "$eq":1,
        "$dif":9,
        "$ls":2,
        "$lse":1,
        "$gr":0,
        "$gre":1,
        "$in": "1,2,3,4,5,6,7,8,9,10"
    }

}
```
# Como usar a classe OneToManyController
Essa classe serve para usar controllers dentro de outros controllers, o objetivo dela é representar a relação one-to-many do banco de dados. Para usar ela é preciso fazer as mesmas coisas que se faz com a classe Controller, mas passando também um controllers schema, o nome de cada atributo no controllers schema vai determinar o nome do atributo do array de JSONs "filhos". Exemplo:
```Javascript
module.exports = class KpiController extends OneToManyController {
    constructor() {
        super("kpis", {
            category: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                errorMessage: "O valor de category deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O valor de description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            details: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 65535
                    }
                },
                errorMessage: "O valor de details deve ser uma string e deve ter entre 1 e 65535 caractéres."
            },
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O valor de name deve ser uma string e deve ter entre 1 e 255 caractéres."
            }
        }, false, {
            kpisSurveys: {
                controller: new KpiSurveyController(),
                fkToThis: "kpiId"
            },
            criterias:{
                controller: new CriteriaController(),
                fkToThis: "kpiId"
            }
        })

    }
    
}
```
Exemplo de JSOn para adicionar uma kpi:
```JSON
{
    "category": "string",
    "description": "string",
    "details": "string",
    "name": "string",
    "kpisSurveys": [
        {
            "grupo": "string",
            "surveyId": "int"
        },
        {
            "grupo": "string",
            "surveyId": "int"
        }
    ],
    "criterias": [
        {
            "description": "string",
            "type": "string",
            "value": "int"
        },
        {
            "description": "string",
            "type": "string",
            "value": "int"
        }
    ]
}
```
A validação dos JSONs "filhos" é mesma do Controller "filho". Não é necessário informar o valor do "fkToThis", no caso do criterias é "kpiId", pois ele é preenchido com o valor que for informado nos params da rota. Exemplos de rotas geradas pelo OneToManyController para o controller "filho" CriteriaController:
```
-> "GET /kpis/:id/criteria?type[$eq]=igor": Pega dados das criterias, que tem o kpiId igual ao id dos params, com base na query;

-> "DELETE /kpis/:id/criteria?type[$eq]=igor": Apaga dados das criterias, que tem o kpiId igual ao id dos params, com base na query;

-> "PATCH /kpis/:id/criteria?type[$eq]=igor": Atualiza dados das criterias, que tem o kpiId igual ao id dos params, com base na query e no JSON enviado;

-> "POST /kpis/:id/criteria/multiple": Adiciona várias linhas para a tabela "criteria" do banco com base no array de JSONs enviado dentro do atributo "list", o "kpiId" é automaticamente preenchido com o id dos params".
-> "POST /kpis/:id/criteria": Adiciona uma linha para a tabela "criteria" do banco com base no JSON enviado, o "kpiId é automaticamente preenchido com o id dos params, o "kpiId" é automaticamente preenchido com o id dos params".
```
A mesma coisa para o controller "filho" KpiSurveyController. O nome da rota do "filho" ("/kpis/:id/${nomeDoFilho}") é definido pelo atributo nome desse controller "filho".

