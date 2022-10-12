const router = require("express").Router();

const mysql_pool = require("../mysql_pools");

/**
 * @swagger
 * /clothe_metadata/list:
 *  get:
 *    tags: [clothe_metadata]
 *    description: 유효한 메타데이터 리스트를 반환합니다.
 *    parameters:
 *      - in: query
 *        name: "metadata_kind"
 *        schema:
 *          type: string
 *        description: "메타데이터 종류. 다음과 같은 값이 올 수 있습니다.<br><br>
 *                       <ul>
 *                        <li>conditions: 상태</li>
 *                        <li>colors: 색상</li>
 *                        <li>materials: 소재</li>
 *                       </ul>"
 *        required: true
 *
 *    responses:
 *      200:
 *        description: 조회 성공. 해당 메타데이터 정보 JSON 반환.
 *      500:
 *        description: DB 커넥션 오류 또는 존재하지 않는 메타데이터 종류.
 */

router.get("/list", async (request, response) => {
  let metadata_kind = request.query.metadata_kind;

  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        `SELECT * FROM ` + metadata_kind + ';',
        (error, rows) => {
          if (error) response.sendStatus(500);
          else {
              response.status(200);
              response.send(rows);
          }
        }
      );
    }
  });
});

module.exports = router;
