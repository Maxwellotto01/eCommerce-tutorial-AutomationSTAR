const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
