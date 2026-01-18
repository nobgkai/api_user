import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API documentation for User Management System",
    },
    servers: [
      {
        url: "/api",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "Bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // อ่าน comment จาก routes
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
