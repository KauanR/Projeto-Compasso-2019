//classe e metodos para chamar nas rotas
class CriteriaDao {

    constructor(mysql) {
        this._mysql = mysql;
    }

    //metodo para adicionar nova kpi
    adicionaCriteria(criteria) {

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

    removeCriteria(id) {

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

    atualizaCriteria(kpi) { // METODO DANDO ERRADO

        return new Promise((resolve, reject) => {

            this._mysql.query(
                "UPDATE `mydb`.`CRITERIA` SET name = ?, description = ?, details = ?, category = ? WHERE id = ?",
                [
                    kpi.name,
                    kpi.description,
                    kpi.details,
                    kpi.category,
                    kpi.id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel excluir');
                    }
        
                    resolve();
                }
            )
        })
    }


}

module.exports = CriteriaDao;