const connect_info = require('./configs/mysql')
const mysql = require('mysql')

module.exports = (function () {
    let mysql_pool;
    const initiate = async () => {
        return await mysql.createPool(connect_info)
    }
    return {
        get_pool: async function () {
            if (!mysql_pool) mysql_pool = await initiate();
            return mysql_pool;
        }
    }
})();