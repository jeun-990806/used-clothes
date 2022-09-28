const swagger_ui = require("swagger-ui-express")
const swagger_js_doc = require("swagger-jsdoc")

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Used Clothes',
      description:
        '중고의류거래플랫폼 API',
    },
    servers: [
      {
        url: 'http://118.67.142.10/', // 요청 URL
      },
    ],
  },
  apis: ['./routers/*.js', './main.js'], //Swagger 파일 연동
}

const specs = swagger_js_doc(options)

module.exports = { swagger_ui, specs }