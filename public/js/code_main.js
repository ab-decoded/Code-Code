//Check if the changes are made by a user or due to change received from websockets.
var trueChanges=true;

$(document).ready(function(){
	CodeMirror.modeURL = "../components/codemirror/mode/%N/%N.js";
	$('#mode-select').dropdown();
	$('#theme-select').dropdown();
	var textArea = document.getElementById('codeArea');
	var editor = CodeMirror.fromTextArea(textArea,{
		tabMode:"indent",
		lineNumbers:true,
		matchBrackets:true,
		autoCloseBrackets:true
	});
	var elem = document.createElement('textarea');
	elem.innerHTML = decodeURI(code);
	var decoded = elem.value;

	editor.getDoc().setValue(decoded);
	
	var modeInfo=CodeMirror.findModeByName(mode);
	if(modeInfo){
		editor.setOption("mode",modeInfo.mime);
		CodeMirror.autoLoadMode(editor,modeInfo.mode);
		$('#mode-select').dropdown('set value',mode);
	}

	editor.on("change",function(cm,change){
		if(trueChanges===true){
			var changed_text=change.text[0];
			var text_length=change.text.length;
			if(text_length>1){
				for(i=1;i<text_length;i++)
					changed_text+=('\n'+change.text[i]);
			}
			change.text=changed_text;
			var res={
				"type":"codeChange",
				"url":window.location.href,
				"change":change,
				"code":cm.getValue()
			};
			sock.send(JSON.stringify(res));
		}
		trueChanges=true;
	});

	sock.onmessage=function(change){
		change=JSON.parse(change.data);
		console.log("Haila server bolta hai: ");
		console.log(change);
		//These changes must not send the message to the websockets.
		trueChanges=false;
		//Make changes to the clients
		switch(change.type){
			case "codeChange":
				editor.replaceRange(change.text,change.from,change.to);
				break;
			case "modeChange":
				var modeInfo=CodeMirror.findModeByName(change.mode);
				console.log("heheheh");
				console.log(modeInfo);
				if(modeInfo){
					editor.setOption("mode",modeInfo.mime);
					CodeMirror.autoLoadMode(editor,modeInfo.mode);
					$('#mode-select').dropdown('set value',change.mode);
				}
				break;
		}
	};

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
			var res={
				"type":"modeChange",
				"url":window.location.href,
				"change":{
					"mode":event.target.value
				}
			};
			sock.send(JSON.stringify(res));
		}
	});

	$('#theme-select').on('change',function(event){
		editor.setOption("theme",event.target.value);

	});

});
