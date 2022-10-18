const router = require("express").Router();

const mysql_pool = require("../mysql_pools");

/**
 * @swagger
 * /category/main/list:
 *  get:
 *    tags: [category]
 *    description: 메인 카테고리 리스트를 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 조회 성공. 메인 카테고리 리스트 JSON 반환.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  main_category_id:
 *                    type: integer
 *                    example: 1
 *                  main_category_name:
 *                    type: string
 *                    example: 상의
 *      500:
 *        description: DB 커넥션 오류.
 */

router.get("/main/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query("SELECT * FROM main_categories;", (error, rows) => {
        if (error) response.sendStatus(500);
        else {
          response.status(200);
          response.send(rows);
        }
      });
    }
  });
});

/**
 * @swagger
 * /category/main/create:
 *  post:
 *    tags: [category]
 *    description: 메인 카테고리를 추가합니다.
 *    requestBody:
 *      description: 추가할 메인 카테고리 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              main_category_name:
 *                type: string
 *
 *    responses:
 *      200:
 *        description: 등록 성공. 등록된 메인 카테고리 정보 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                main_category_id:
 *                  type: integer
 *                  example: 1
 *                main_category_name:
 *                  type: string
 *                  example: 상의
 *      500:
 *        description: DB 커넥션 오류.
 */

router.post("/main/create", async (request, response) => {
  const category_name = request.body.main_category_name;

  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "INSERT INTO main_categories (main_category_name) VALUES ('" +
          category_name +
          "');",
        (error, result) => {
          if (error) response.sendStatus(500);
          else {
            response.status(200);
            response.send({
              main_cateogry_id: result.insertId,
              main_cateogry_name: category_name,
            });
          }
        }
      );
    }
  });
});

/**
 * @swagger
 * /category/main/list:
 *  get:
 *    tags: [category]
 *    description: 서브 카테고리 리스트를 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 조회 성공. 해당 메타데이터 정보 JSON 반환.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  main_category_id:
 *                    type: integer
 *                    example: 1
 *                  sub_category_id:
 *                    type: integer
 *                    example: 1
 *                  main_category_name:
 *                    type: string
 *                    example: 상의
 *                  category_name:
 *                    type: string
 *                    example: 티셔츠(긴소매)
 *      500:
 *        description: DB 커넥션 오류.
 */

router.get("/sub/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT sub_categories.main_category_id, sub_category_id, main_category_name, sub_category_name FROM sub_categories JOIN main_categories ON sub_categories.main_category_id=main_categories.main_category_id;",
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

/**
 * @swagger
 * /category/sub/create:
 *  post:
 *    tags: [category]
 *    description: 서브 카테고리를 추가합니다.
 *    requestBody:
 *      description: 추가할 서브 카테고리 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              main_category_id:
 *                type: integer
 *              sub_cateogry_id:
 *                type: integer
 *              sub_category_name:
 *                type: string
 *
 *    responses:
 *      200:
 *        description: 등록 성공. 등록된 서브 카테고리 정보 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                main_category_id:
 *                  type: integer
 *                  example: 1
 *                sub_category_name:
 *                  type: string
 *                  example: 상의
 *      500:
 *        description: DB 커넥션 오류.
 */

router.post("/sub/create", async (request, response) => {
  const main_category_id = request.body.main_category_id;
  const category_name = request.body.sub_category_name;

  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "INSERT INTO sub_categories (main_category_id, sub_category_name) VALUES (" +
          main_category_id +
          ", '" +
          category_name +
          "');",
        (error, result) => {
          console.log(error);
          if (error) response.sendStatus(500);
          else {
            response.status(200);
            response.send({
              main_category_id: main_category_id,
              sub_cateogry_id: result.insertId,
              sub_cateogry_name: category_name,
            });
          }
        }
      );
    }
  });
});

module.exports = router;
