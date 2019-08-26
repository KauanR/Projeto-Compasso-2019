//classe e metodos para chamar nas rotas
class CriteriaDao {

    constructor(mysql) {
        this._mysql = mysql;
    }

    adiciona(criteria) {

        return new Promise((resolve, reject) => {
         
            this._mysql.query(
                "INSERT INTO `mydb`.`CRITERIA` (type, value, description, kpi_id) values(?,?,?,?)",
                [
                    criteria.type,
                    criteria.value,
                    criteria.description,
                    criteria.kpi_id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel adicionar');
                    }
        
                    resolve();
                }
            )
        });
    }

    remove(id) {

        return new Promise((resolve, reject) => {

            this._mysql.query(
                "DELETE FROM `mydb`.`CRITERIA` WHERE ID = ?",
                [
                    id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel excluir');
                    }
        
                    return resolve();
                }
            )
        })

    };

    atualiza(criteria) { 

        return new Promise((resolve, reject) => {

            this._mysql.query(
                "UPDATE `mydb`.`CRITERIA` SET type = ?, value = ?, description = ?, kpi_id = ? WHERE id = ?",
                [
                    criteria.type,
                    criteria.value,
                    criteria.description,
                    criteria.kpi_id,
                    criteria.id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel atualizar');
                    }
        
                    resolve();
                }
            )
        })
    }


}

module.exports = CriteriaDao;