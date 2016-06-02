var textArea = document.getElementById('codeArea');
var editor = CodeMirror.fromTextArea(textArea,{
	lineNumbers:true
});
editor.getDoc().setValue('var msg = "Hi";');