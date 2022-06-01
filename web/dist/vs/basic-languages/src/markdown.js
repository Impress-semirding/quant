/*! For license information please see markdown.js.LICENSE.txt */
define("vs/basic-languages/src/markdown",["require","exports"],(function(e,t){function n(e){return d+e}var s="entity.name.tag",o="string",a="variable.source",c="meta.tag.assign.html",i="entity.other.attribute-name.html",r="string.html",d="entity.name.tag.tag-";t.conf={comments:{blockComment:["\x3c!--","--\x3e"]},brackets:[["{","}"],["[","]"],["(",")"],["<",">"]],autoClosingPairs:[]},t.language={defaultToken:"",tokenPostfix:".md",control:/[\\`*_\[\]{}()#+\-\.!]/,noncontrol:/[^\\`*_\[\]{}()#+\-\.!]/,escapes:/\\(?:@control)/,jsescapes:/\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,empty:["area","base","basefont","br","col","frame","hr","img","input","isindex","link","meta","param"],tokenizer:{root:[[/^(\s{0,3})(#+)((?:[^\\#]|@escapes)+)((?:#+)?)/,["white","entity.name.tag",s,s]],[/^\s*(=+|\-+)\s*$/,"entity.other.attribute-name"],[/^\s*((\*[ ]?)+)\s*$/,"meta.separator"],[/^\s*>+/,"comment"],[/^\s*([\*\-+:]|\d+\.)\s/,"keyword"],[/^(\t|[ ]{4})[^ ].*$/,o],[/^\s*~{3}\s*((?:\w|[\/\-#])+)?\s*$/,{token:o,next:"@codeblock"}],[/^\s*```\s*((?:\w|[\/\-#])+)\s*$/,{token:o,next:"@codeblockgh",nextEmbedded:"$1"}],[/^\s*`{3}\s*$/,{token:o,next:"@codeblock"}],{include:"@linecontent"}],codeblock:[[/^\s*~{3}\s*$/,{token:o,next:"@pop"}],[/^\s*`{3}\s*$/,{token:o,next:"@pop"}],[/.*$/,a]],codeblockgh:[[/```\s*$/,{token:"@rematch",switchTo:"@codeblockghend",nextEmbedded:"@pop"}],[/[^`]*$/,a]],codeblockghend:[[/\s*```/,{token:a,next:"@pop"}],[/./,"@rematch","@pop"]],linecontent:[[/&\w+;/,"string.escape"],[/@escapes/,"escape"],[/\b__([^\\_]|@escapes|_(?!_))+__\b/,"strong"],[/\*\*([^\\*]|@escapes|\*(?!\*))+\*\*/,"strong"],[/\b_[^_]+_\b/,"emphasis"],[/\*([^\\*]|@escapes)+\*/,"emphasis"],[/`([^\\`]|@escapes)+`/,"variable"],[/\{[^}]+\}/,"string.target"],[/(!?\[)((?:[^\]\\]|@escapes)*)(\]\([^\)]+\))/,["string.link","","string.link"]],[/(!?\[)((?:[^\]\\]|@escapes)*)(\])/,"string.link"],{include:"html"}],html:[[/<(\w+)\/>/,n("$1")],[/<(\w+)/,{cases:{"@empty":{token:n("$1"),next:"@tag.$1"},"@default":{token:n("$1"),bracket:"@open",next:"@tag.$1"}}}],[/<\/(\w+)\s*>/,{token:n("$1"),bracket:"@close"}],[/<!--/,"comment","@comment"]],comment:[[/[^<\-]+/,"comment.content"],[/-->/,"comment","@pop"],[/<!--/,"comment.content.invalid"],[/[<\-]/,"comment.content"]],tag:[[/[ \t\r\n]+/,"white"],[/(type)(\s*=\s*)(")([^"]+)(")/,[i,c,r,{token:r,switchTo:"@tag.$S2.$4"},r]],[/(type)(\s*=\s*)(')([^']+)(')/,[i,c,r,{token:r,switchTo:"@tag.$S2.$4"},r]],[/(\w+)(\s*=\s*)("[^"]*"|'[^']*')/,[i,c,r]],[/\w+/,i],[/\/>/,n("$S2"),"@pop"],[/>/,{cases:{"$S2==style":{token:n("$S2"),switchTo:"@embedded.$S2",nextEmbedded:"text/css"},"$S2==script":{cases:{$S3:{token:n("$S2"),switchTo:"@embedded.$S2",nextEmbedded:"$S3"},"@default":{token:n("$S2"),switchTo:"@embedded.$S2",nextEmbedded:"text/javascript"}}},"@default":{token:n("$S2"),next:"@pop"}}}]],embedded:[[/[^"'<]+/,""],[/<\/(\w+)\s*>/,{cases:{"$1==$S2":{token:"@rematch",next:"@pop",nextEmbedded:"@pop"},"@default":""}}],[/"([^"\\]|\\.)*$/,"string.invalid"],[/'([^'\\]|\\.)*$/,"string.invalid"],[/"/,"string",'@string."'],[/'/,"string","@string.'"],[/</,""]],string:[[/[^\\"']+/,"string"],[/@jsescapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/["']/,{cases:{"$#==$S2":{token:"string",next:"@pop"},"@default":"string"}}]]}}}));