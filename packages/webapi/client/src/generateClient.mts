/* eslint-disable @typescript-eslint/ban-ts-comment */
import ts from "typescript";
import fs from "fs";
import { RouteNode } from "@thylacine-js/webapi-common/apiRoute.mjs";

export async function generateClientApiStubs(tree: RouteNode) {
  const sourceFile = ts.createSourceFile("client.ts", "", ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);

  const factory = ts.factory;
  //@ts-expect-error
  sourceFile.statements = [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(false, undefined, factory.createIdentifier("ApiClient")),
        ])
      ),
      factory.createStringLiteral("@thylacine-js/webapi-client/apiClient.mjs"),
      undefined
    ),
    factory.createClassDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("Client"),
      undefined,
      [
        factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
          factory.createExpressionWithTypeArguments(factory.createIdentifier("ApiClient"), undefined),
        ]),
      ],
      [
        factory.createConstructorDeclaration(
          undefined,
          [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier("host"),
              undefined,
              factory.createUnionTypeNode([
                factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                factory.createTypeReferenceNode(factory.createIdentifier("URL"), undefined),
                factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
              ]),
              factory.createPropertyAccessExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("process"),
                  factory.createIdentifier("env")
                ),
                factory.createIdentifier("API_ORIGIN")
              )
            ),
          ],
          factory.createBlock(
            [
              factory.createExpressionStatement(
                factory.createCallExpression(factory.createSuper(), undefined, [factory.createIdentifier("host")])
              ),
            ],
            true
          )
        ),
        ...tree.createDeclaration(),
      ]
    ),
  ];
  const printer = ts.createPrinter();
  fs.writeFileSync("./apiClient.ts", printer.printFile(sourceFile));
}
