/* eslint-disable @typescript-eslint/ban-ts-comment */
import ts, { ClassElement, ParameterDeclaration } from "typescript";
import fs from "fs";

import { RouteNode, ApiRoute } from "@thylacine-js/webapi-common";

function visitChildren(child: ts.Node, cb: (p: ts.Node) => void) {
  const t = child;
  if (t !== undefined) {
    cb(t);
    child.forEachChild((p) => this.visitChildren(p, cb));
  }
}
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
        ...createDeclaration(tree),
      ]
    ),
  ];
  const printer = ts.createPrinter();
  fs.writeFileSync("./apiClient.ts", printer.printFile(sourceFile));
}

function createDeclaration(route: RouteNode | ApiRoute<any>): ClassElement[] {
  const factory = ts.factory;
  if (route instanceof RouteNode) {
    return Array.from(route.children.values()).flatMap(createDeclaration);
  }

  return [
    factory.createMethodDeclaration(
      [factory.createToken(ts.SyntaxKind.PublicKeyword), factory.createToken(ts.SyntaxKind.AsyncKeyword)],
      undefined,
      factory.createIdentifier(route.operation),
      undefined,
      undefined,
      createParameterDeclaration(route),
      factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
        factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      ]),
      factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(factory.createSuper(), factory.createIdentifier(route.method)),
              undefined,
              Object.keys(route.params).length > 0
                ? [factory.createNoSubstitutionTemplateLiteral(route.interpolatedPath, route.interpolatedPath)]
                : [factory.createStringLiteral(route.path), factory.createIdentifier("params")]
            )
          ),
        ],
        true
      )
    ),
  ];
}

function createParameterDeclaration(route: ApiRoute<any>): ParameterDeclaration[] {
  const factory = ts.factory;
  const prog = ts.createProgram([this.filePath], { allowJs: true });
  const src = prog.getSourceFile(this.filePath);

  const tc = prog.getTypeChecker();

  visitChildren(src, (p) => {
    if (ts.isFunctionDeclaration(p)) {
      //console.log((p, src, prog));

      // console.log(prog.getTypeChecker().signatureToString(prog.getTypeChecker().getSignatureFromDeclaration(p)));
      p.parameters.forEach((q) => {
        const qs = tc.getSymbolAtLocation(q);

        // console.debug(
        //   `${q.name.getFullText()}: type is ${prog.getTypeChecker().typeToString(prog.getTypeChecker().getTypeAtLocation(q))}`
        // );
        visitChildren(p.body, (r) => {
          if (ts.isPropertyAccessExpression(r)) {
            if (tc.getSymbolAtLocation(r.expression).valueDeclaration === q) {
              console.log(r.getText());
            }
          }
        });
      });
    }
  });
  if (Object.keys(route.params).length > 0) {
    const params = [];
    for (const key in route.params) {
      params.push(
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier(key),
          undefined,
          factory.createTypeReferenceNode(route.params[key]),
          undefined
        )
      );
    }
    return params;
  } else
    return [
      factory.createParameterDeclaration(
        undefined,
        factory.createToken(ts.SyntaxKind.DotDotDotToken),
        factory.createIdentifier("params"),
        undefined,
        undefined,
        undefined
      ),
    ];
}
