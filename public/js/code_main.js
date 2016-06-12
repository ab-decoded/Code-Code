$(document).ready(function(){
	CodeMirror.modeURL = "../components/codemirror/mode/%N/%N.js";
	$('#mode-select').dropdown();
	var textArea = document.getElementById('codeArea');
	var editor = CodeMirror.fromTextArea(textArea,{
		lineNumbers:true
	});
	editor.getDoc().setValue('var msg = "Hi";');
	$('#mode-select').on('change',function(event){
		var info=CodeMirror.findModeByName(event.target.value);
		if(info){
			mode=info.mode;
			spec=info.mime;
		}
		console.log(info);
		if(mode){
			editor.setOption("mode",spec);
			CodeMirror.autoLoadMode(editor,mode);
		}
	});
});
