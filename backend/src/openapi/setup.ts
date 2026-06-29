import type { Express } from 'express';
import { openApiSpec } from './spec.js';

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Siddhant Bill API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>body { margin: 0; } #swagger-ui { max-width: 1460px; margin: 0 auto; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`;

export function setupSwagger(app: Express) {
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.get(['/api/docs', '/api/docs/'], (_req, res) => {
    res.type('html').send(SWAGGER_HTML);
  });
}
