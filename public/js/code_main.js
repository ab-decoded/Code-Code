//Check if the changes are made by a user or due to change received from websockets.
var trueChanges=true;

$(document).ready(function(){
	CodeMirror.modeURL = "../components/codemirror/mode/%N/%N.js";
	$('#mode-select').dropdown();
	var textArea = document.getElementById('codeArea');
	var editor = CodeMirror.fromTextArea(textArea,{
		tabMode:"indent",
		lineNumbers:true,
		matchBrackets:true,
		autoCloseBrackets:true
	});
	editor.on("change",function(cm,change){
			if(trueChanges===true){			
				console.log(change);
				var res={
					"type":"codeChange",
					"url":window.location.href,
					"change":change
				};
				sock.send(JSON.stringify(res));
			}
			trueChanges=true;
	});
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

	sock.onmessage=function(change){
		change=JSON.parse(change.data);
		console.log("Haila server bolta hai: ");
		console.log(change);
		//These changes must not send the message to the websockets.
		trueChanges=false;
		//Make chnges to the clients
		editor.replaceRange(change.text[0],change.from,change.to);
	};

});
