export default function createRoutesInjection(routes, layouts, appDir) {
  return `
${layouts.map(layout => `import ${layout.class_name}, * as ${layout.class_name}_Star from '${appDir}/layouts/${layout.file_path}';`).join('\n')}
${routes.map(route => `
import ${route.class_name}, * as ${route.class_name}_Star from '${appDir}/routes${route.file_path}';`).join('\n')}
const routes = [
  ${[...routes.map(route => `{
    path: '${route.route_path}',
    name: '${route.class_name}',
    module: ${route.class_name},
    loader: ${route.class_name}_Star.loader,
    action: ${route.class_name}_Star.action,
    layout: ${route.class_name}_Star.layout,
  }`), ...layouts.map(layout => `{
    name: '${layout.class_name}',
    module: ${layout.class_name},
    loader: ${layout.class_name}_Star.loader,
  }`)].join(',')
}
];
export { routes as 'ROUTES_LIST' };
`;
}