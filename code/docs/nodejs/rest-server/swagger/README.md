The hand-written OpenAPI specification is `task.yaml`.

The server code is generated with:

    java -jar swagger-codegen-cli.jar generate -i task.yaml -l nodejs-server -o ./swag-server

Where `swagger-codegen-cli.jar` is the downloaded binary (for OpenAPI v3) from
[the Swagger Codegen website](https://github.com/swagger-api/swagger-codegen/tree/3.0.0?tab=readme-ov-file#prerequisites).

Note that this also creates a copy of the spec in
`./swag-server/api/swagger.yaml`. That copy is slightly different from the
input `task.yaml` - it's canonicalized and reformatted by the code generator.
