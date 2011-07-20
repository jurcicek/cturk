$(function(){
    var assignmentId = LocationSearch.attr("assignmentId");//ASSIGNMENT_ID_NOT_AVAILABLE
    var hitId = LocationSearch.attr("hitId");
    //workerId
    //turkSubmitTo
    
    var audioUrlPrefix = "";
    var XMLData = "";
    
    main();
    
    function main(){
        $("#assignmentId").val(assignmentId);
        $.ajax({
            url: Config.ajaxUrlPrefix + "/getTask.php",
            type: "GET",
            data: {
                id: LocationSearch.attr("id")
            },
            dataType: "json",
            success: function(data){
                if (typeof data.path != "undefined") {
                    var url = Config.dataUrlPrefix + data.path + "/session-fixed-question.xml";
                    audioUrlPrefix = Config.audioUrlPrefix + data.path;
                    getXMLData(url);
                }
            }
        });
    }
    
    function getXMLData(url){
        $.ajax({
            url: url,
            type: "GET",
            dataType: "xml",
            success: function(data){
                XMLData = data;
                showData();
            }
        });
    }
    
    function getFlashHtml(audioUrl){
        var html = '';
        html += '<object width="25" height="20" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">';
        html += '  <param value="static/flash/player.swf?file=' + audioUrl + '&amp;showDownload=false&amp;backColor=ffffff&amp;frontColor=000000&amp;songVolume=100" name="movie">';
        html += '  <param value="high" name="quality">';
        html += '  <param name="wmode" value="transparent">';
        html += '  <embed width="25" height="20" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" quality="high" src="static/flash/player.swf?file=' + audioUrl + '&amp;showDownload=false&amp;backColor=ffffff&amp;frontColor=000000&amp;songVolume=100">';
        html += '</object>';
        return html;
    }
    
    function showData(){
        $(XMLData).find("turn").each(function(){
            var sysText = $(this).find("systurn prompt").text();
            var html = '';
            html += '<tr class="trSys">';
            html += '  <td>System: </td>';
            html += '  <td></td>';
            html += '  <td>' + sysText + '</td>';
            html += '</tr>';
            
			$(this).find("userturn").each(function(){
				var audioFileName = $(this).find("rec").attr("fname");
				if (audioFileName != undefined) {
					var mp3FileName = audioFileName.substring(0, audioFileName.lastIndexOf(".")) + ".mp3";
					var userturnIndex = $(this).attr("turnnum");
					html += '<tr>';
					html += '  <td>User: </td>';
					html += '  <td>' + getFlashHtml(audioUrlPrefix + "/" + mp3FileName) + '</td>';
					html += '  <td><input type="text" name="userturn[' + userturnIndex + ']" value="" class="userText" /></td>';
					html += '</tr>';
				}
				});
            $("#dynamicTable tbody").append(html);
        });
        
        if (assignmentId == undefined || assignmentId == "" || assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
            $("input").attr("disabled", true);
        } else {
            $("input").attr("disabled", false);
        }
        
        $("#submitButton").unbind("click").click(function(){
            var hasPassed = true;
            $("#dynamicTable .userText").each(function(){
                if ($(this).val() == "") {
                    alert("This field is empty!");
                    this.focus();
                    this.select();
                    hasPassed = false;
                    return false;
                }
            });
            if (hasPassed) {
                $("#dynamicTableForm").submit();
            }
        });
    }
});
