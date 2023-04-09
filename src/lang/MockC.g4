grammar MockC;

compilationUnit: translationUnit? EOF;
translationUnit: externalDeclaration+;
externalDeclaration:
	functionDefinition
	| declaration
	| ';'; // stray ;

functionDefinition: typeSpecifier declarator compoundStatement;
typeSpecifier: 'void' | 'int';
declarator: pointer? directDeclarator;
pointer: '*' pointer?;
directDeclarator:
	IDENTIFIER
	| IDENTIFIER '(' parameterList? ')';
constantExpression: conditionalExpression;
conditionalExpression:
	logicalOrExpression
	| logicalOrExpression '?' expressionList ':' conditionalExpression;
logicalOrExpression:
	logicalAndExpression
	| logicalOrExpression '||' logicalAndExpression;
logicalAndExpression:
	inclusiveOrExpression
	| logicalAndExpression '&&' inclusiveOrExpression;
inclusiveOrExpression:
	exclusiveOrExpression
	| inclusiveOrExpression '|' exclusiveOrExpression;
exclusiveOrExpression:
	andExpression
	| exclusiveOrExpression '^' andExpression;
andExpression:
	equalityExpression
	| andExpression '&' equalityExpression;
equalityExpression:
	relationalExpression
	| equalityExpression '==' relationalExpression
	| equalityExpression '!=' relationalExpression;
relationalExpression:
	shiftExpression
	| relationalExpression '<' shiftExpression
	| relationalExpression '>' shiftExpression
	| relationalExpression '<=' shiftExpression
	| relationalExpression '>=' shiftExpression;
shiftExpression:
	additiveExpression
	| shiftExpression '<<' additiveExpression
	| shiftExpression '>>' additiveExpression;
additiveExpression:
	multiplicativeExpression
	| additiveExpression '+' multiplicativeExpression
	| additiveExpression '-' multiplicativeExpression;
multiplicativeExpression:
	unaryExpression
	| multiplicativeExpression '*' unaryExpression
	| multiplicativeExpression '/' unaryExpression
	| multiplicativeExpression '%' unaryExpression;
unaryExpression:
	postfixExpression
	| unaryOperator unaryExpression;
postfixExpression:
	primaryExpression
	| postfixExpression '(' argumentExpressionList? ')';
argumentExpressionList:
	assignmentExpression (',' assignmentExpression)*;
primaryExpression:
	IDENTIFIER
	| STRING_LITERAL
	| NUMBER
	| '(' expressionList ')';
expressionList:
	assignmentExpression (',' assignmentExpression)*;
assignmentExpression:
	conditionalExpression
	| unaryExpression assignmentOperator assignmentExpression;
assignmentOperator:
	'=';
unaryOperator: '&' | '*';
parameterList: parameterDeclaration (',' parameterDeclaration)*;
parameterDeclaration: typeSpecifier declarator;
declaration: typeSpecifier initDeclarator ';';
initDeclarator: declarator ('=' initializer)?;
initializer: assignmentExpression;
initializerList: initializer | initializerList ',' initializer;
compoundStatement: '{' (declaration | statement)* '}';
statement:
	expressionStatement
	| compoundStatement
	| selectionStatement
	| iterationStatement
	| jumpStatement;
expressionStatement: expressionList? ';';
selectionStatement:
	'if' '(' expressionList ')' statement ('else' statement)?;
iterationStatement:
	'while' '(' expressionList ')' statement;
jumpStatement:
	'continue' ';'
	| 'break' ';'
	| 'return' expressionList? ';';

WHITESPACE: [ \r\n\t]+ -> skip;

STRING_LITERAL: '"' (~["\n\r] | '\\"')* '"';
CHARACTER_LITERAL: '\'' (~['\n\r] | '\\\'') '\'';

NUMBER: (DIGIT+) | ((NONZERODIGIT+ | ZERO) '.' DIGIT+);
IDENTIFIER: NONDIGIT (NONDIGIT | DIGIT)*;

fragment DIGIT: [0-9];
fragment NONZERODIGIT: [1-9];
fragment ZERO: [0];
fragment NONDIGIT: [a-zA-Z_];

BLOCK_COMMENT: '/*' .*? '*/' -> skip;
LINE_COMMENT: '//' ~[\r\n]* -> skip;