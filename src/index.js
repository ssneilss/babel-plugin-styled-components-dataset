import { basename, extname, dirname } from 'path';
import * as t from 'babel-types';

const importLocalName = (name, state) => {
  let localName = name === 'default' ? 'styled' : name;

  state.file.path.traverse({
    ImportDeclaration: {
      exit(path) {
        const { node } = path;

        if (node.source.value === 'styled-components') {
          path.get('specifiers').forEach((specifier) => {
            if (specifier.isImportDefaultSpecifier()) {
              localName = specifier.node.local.name;
            }

            if (specifier.isImportSpecifier() && specifier.node.imported.name === name) {
              localName = specifier.node.local.name;
            }

            if (specifier.isImportNamespaceSpecifier()) {
              localName = specifier.node.local.name;
            }
          });
        }
      },
    },
  });

  return localName;
};

const isStyled = (tag, state) => {
  if (
    t.isCallExpression(tag) &&
    t.isMemberExpression(tag.callee) &&
    tag.callee.property.name !== 'default' /** ignore default for #93 below */
  ) {
    // styled.something()
    return isStyled(tag.callee.object, state);
  }

  return (
    (t.isMemberExpression(tag) && tag.object.name === importLocalName('default', state)) ||
    (t.isCallExpression(tag) && tag.callee.name === importLocalName('default', state)) ||
    (t.isCallExpression(tag) &&
      t.isCallExpression(tag.callee.object) &&
      tag.callee.object.callee.name === 'require' &&
      tag.callee.object.arguments[0].value === 'styled-components')
  );
};

const getPrefix = (state) => {
  let prefix;
  prefix = basename(state.file.opts.filename, extname(state.file.opts.filename));
  if (prefix === 'index') {
    [prefix] = dirname(state.file.opts.filename)
      .split('/')
      .reverse();
  }
  return prefix;
};

const getName = (state, path) => {
  let namedNode;
  path.find((p) => {
    // const X = styled
    if (p.isAssignmentExpression()) {
      namedNode = p.node.left;
      // const X = { Y: styled }
    } else if (p.isObjectProperty()) {
      namedNode = p.node.key;
      // class Y { (static) X = styled }
    } else if (p.isClassProperty()) {
      namedNode = p.node.key;
      // let X; X = styled
    } else if (p.isVariableDeclarator()) {
      namedNode = p.node.id;
    } else if (p.isStatement()) {
      // we've hit a statement, we should stop crawling up
      return true;
    }

    if (namedNode) return true;
    return false;
  });

  // foo.bar -> bar
  if (t.isMemberExpression(namedNode)) {
    namedNode = namedNode.property;
  }

  return t.isIdentifier(namedNode) ? namedNode.name : undefined;
};

export default function () {
  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        if (!isStyled(path.node.tag, state)) return;

        const key = state.opts.key ? `'${state.opts.key}'` : "'data-id'";
        const prefix = getPrefix(state);
        const name = getName(state, path);

        // eslint-disable-next-line no-param-reassign
        path.node.tag = t.callExpression(t.memberExpression(path.node.tag, t.identifier('attrs')), [
          t.objectExpression([
            t.objectProperty(t.identifier(key), t.stringLiteral(`${prefix}_${name}`)),
          ]),
        ]);
      },
    },
  };
}
