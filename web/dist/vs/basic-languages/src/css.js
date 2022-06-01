/*! For license information please see css.js.LICENSE.txt */
define("vs/basic-languages/src/css",["require","exports"],(function(e,n){n.conf={wordPattern:/(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,comments:{blockComment:["/*","*/"]},brackets:[["{","}"],["[","]"],["(",")"]],autoClosingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"',notIn:["string"]},{open:"'",close:"'",notIn:["string"]}]};var t="support.type.property-name",o="keyword.control.at-rule";n.language={defaultToken:"",tokenPostfix:".css",ws:"[ \t\n\r\f]*",identifier:"-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*",brackets:[{open:"{",close:"}",token:"punctuation.curly"},{open:"[",close:"]",token:"punctuation.bracket"},{open:"(",close:")",token:"punctuation.parenthesis"},{open:"<",close:">",token:"punctuation.angle"}],tokenizer:{root:[{include:"@selector"}],selector:[{include:"@comments"},{include:"@import"},["[@](keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)",{token:o,next:"@keyframedeclaration"}],["[@](page|content|font-face|-moz-document)",{token:o}],["[@](charset|namespace)",{token:o,next:"@declarationbody"}],["url(\\-prefix)?\\(",{token:"support.function.name",bracket:"@open",next:"@urldeclaration"}],{include:"@selectorname"},["[\\*]","entity.name.tag"],["[>\\+,]","punctuation"],["\\[",{token:"punctuation.bracket",bracket:"@open",next:"@selectorattribute"}],["{",{token:"punctuation.curly",bracket:"@open",next:"@selectorbody"}]],selectorbody:[["[*_]?@identifier@ws:(?=(\\s|\\d|[^{;}]*[;}]))",t,"@rulevalue"],["}",{token:"punctuation.curly",bracket:"@close",next:"@pop"}]],selectorname:[["(\\.|#(?=[^{])|%|(@identifier)|:)+","entity.name.selector"]],selectorattribute:[{include:"@term"},["]",{token:"punctuation.bracket",bracket:"@close",next:"@pop"}]],term:[{include:"@comments"},["url(\\-prefix)?\\(",{token:"support.function.name",bracket:"@open",next:"@urldeclaration"}],{include:"@functioninvocation"},{include:"@numbers"},{include:"@name"},["([<>=\\+\\-\\*\\/\\^\\|\\~,])","keyword.operator"],[",","punctuation"]],rulevalue:[{include:"@term"},["!important","literal"],[";","punctuation","@pop"],["(?=})",{token:"",next:"@pop"}]],warndebug:[["[@](warn|debug)",{token:o,next:"@declarationbody"}]],import:[["[@](import)",{token:o,next:"@declarationbody"}]],urldeclaration:[{include:"@strings"},["[^)\r\n]+","string"],["\\)",{token:"support.function.name",bracket:"@close",next:"@pop"}]],parenthizedterm:[{include:"@term"},["\\)",{token:"punctuation.parenthesis",bracket:"@close",next:"@pop"}]],declarationbody:[{include:"@term"},[";","punctuation","@pop"],["(?=})",{token:"",next:"@pop"}]],comments:[["\\/\\*","comment","@comment"],["\\/\\/+.*","comment"]],comment:[["\\*\\/","comment","@pop"],[".","comment"]],name:[["@identifier","support.property-value"]],numbers:[["(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?",{token:"constant.numeric",next:"@units"}],["#[0-9a-fA-F_]+(?!\\w)","constant.rgb-value"]],units:[["(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?","constant.numeric","@pop"]],keyframedeclaration:[["@identifier","support.function.name"],["{",{token:"punctuation.curly",bracket:"@open",switchTo:"@keyframebody"}]],keyframebody:[{include:"@term"},["{",{token:"punctuation.curly",bracket:"@open",next:"@selectorbody"}],["}",{token:"punctuation.curly",bracket:"@close",next:"@pop"}]],functioninvocation:[["@identifier\\(",{token:"support.function.name",bracket:"@open",next:"@functionarguments"}]],functionarguments:[["\\$@identifier@ws:",t],["[,]","punctuation"],{include:"@term"},["\\)",{token:"support.function.name",bracket:"@close",next:"@pop"}]],strings:[['~?"',{token:"string.punctuation",bracket:"@open",next:"@stringenddoublequote"}],["~?'",{token:"string.punctuation",bracket:"@open",next:"@stringendquote"}]],stringenddoublequote:[["\\\\.","string"],['"',{token:"string.punctuation",next:"@pop",bracket:"@close"}],[".","string"]],stringendquote:[["\\\\.","string"],["'",{token:"string.punctuation",next:"@pop",bracket:"@close"}],[".","string"]]}}}));