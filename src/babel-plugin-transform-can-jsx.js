var jsx = require('babel-plugin-syntax-jsx');
var template = require('babel-template');
var helper = require('babel-helper-builder-react-jsx');

var createWrappedFunctionAST = template('WRAPPER(SOURCE)');

module.exports = function(babel) {
    var t = babel.types;

    var visitor = helper({
		pre: function(state) {
		  var tagName = state.tagName;
		  var args = state.args;
		  if (t.react.isCompatTag(tagName)) {
			args.push(t.stringLiteral(tagName));
		  } else {
			args.push(state.tagExpr);
		  }
		},

		post: function(state, pass) {
		  state.callee = pass.get("jsxIdentifier")();
		}
    });

	visitor.Program = function(path, state) {
		let id = 'canJsx.h';

        state.set("jsxIdentifier", function() {
            return id
                .split(".")
                .map(function(name) {
                    return t.identifier(name);
                })
                .reduce(function(object, property) {
                    return t.memberExpression(object, property);
                });
        });
	};

	visitor.JSXAttribute = function(path) {
		if (t.isJSXElement(path.node.value)) {
			path.node.value = t.jSXExpressionContainer(path.node.value);
		}
	};

    /*
     * wrap functions containing JSX in makeObservable()
     * if they use destructured parameters
     */
    visitor.JSXIdentifier = function(path) {
        var parentFunction = path.getFunctionParent();
        var params = parentFunction.node.params;

        var alreadyWrapped = parentFunction.parent.callee &&
            parentFunction.parent.callee.name === 'makeObservable';
        var usesDestructuredParams = params[0].type === 'ObjectPattern';

        if (alreadyWrapped || !usesDestructuredParams) {
            return;
        }

        var wrappedParentFunction = createWrappedFunctionAST({
            WRAPPER: t.identifier('makeObservable'),
            SOURCE: parentFunction
        });

        parentFunction.replaceWith(wrappedParentFunction);
    };

    /*
     * convert on:click={handler} to onClick={handler}
     */
    visitor.JSXOpeningElement = function(path) {
        var attributes = path.get('attributes');

        attributes.forEach(function(attributePath) {
            var attribute = attributePath.get('name');
            var name = attribute.node.name;
            var namespace = attribute.node.namespace;

            if (namespace && namespace.name === 'on') {
                attribute.replaceWith(
                    t.JSXIdentifier(
                        'on' +
                        name.name.slice(0, 1).toUpperCase() +
                        name.name.slice(1)
                    )
                );
            }
        });
    };

    /*
     * Disallow namespaced attributes not handled above
     */
    visitor.JSXNamespacedName = function(path) {
        throw path.buildCodeFrameError(
            'Namespaced tags/attributes are not supported'
        );
    };

    return {
        name: 'transform-can-jsx',
        inherits: jsx,
        visitor: visitor
    };
};
