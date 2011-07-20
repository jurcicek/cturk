$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            HITs.load();
                            
                        } else {
                            alert("You are not requester. It will jump to worker page.");
                            window.location.href = "../worker/index.html";
                        }
                        
                    } else if (o.status == 0) {
                        alert("The login expired, please login again.");
                        location.href = "../index.html";
                    }
                }
            });
        }
    };
    
    C.load();
});

var HITs = {

    frameHeight: 500,
    
    data: null,
    
    load: function(){
        var x = this;
        x.getHitGroupData();
        x.bindEvent();
    },
    
    getHitGroupData: function(){
        var x = this;
        if (!LocationSearch.has("groupId")) {
            var html = 'Invalid HITGroup id.';
            $("#hitErrorMessage").html(html).show();
            return;
        }
        var groupId = LocationSearch.attr("groupId");
        Ajax.getGroupInfo({
            data: {
                groupId: groupId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitWarningMessage").html(o.info).show();
                    
                } else {
                    x.data = o.data;
                    x.setHtml();
                    x.bindEvent();
                }
            }
        });
    },
    
    setHtml: function(){
        var x = this;
        var data = x.data;
        var html = '';
        html += '<table width="90%" cellpadding="0" cellspacing="0" border="0">';
        html += '	<tr>';
        html += '		<td width="180">';
        html += '			<span class="text-title">Name *</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="name" value="' + '' + '" class="textBox required" />';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td style="height:110px;">';
        html += '			<span class="text-title">Description *</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<textarea name="description" class="required" rows="3" cols="50" style="width:60%; height:100px;"></textarea>';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Currency code</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="currencyCode" value="' + data['Group'].currencyCode + '" class="textBox" /> (USD, GBP, EUR....)';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Reward *</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="reward" value="' + data['Group'].reward + '" class="textBox required" /> (a floating point number)';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Expire date *</span>';
        html += '		</td>';
        html += '		<td>';
        var expireDate = data['Group'].expireDate;
        function toDate(expireDate){
            var d = new Date(parseFloat(expireDate));
            if (isNaN(d.getFullYear())) {
                return expireDate;
            }
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var hour = d.getHours();
            var minute = d.getMinutes();
            (month < 10) && (month = "0" + month);
            (day < 10) && (day = "0" + day);
            (hour < 10) && (hour = "0" + hour);
            (minute < 10) && (minute = "0" + minute);
            return d.getFullYear() + "/" + month + "/" + day + " " + hour + ":" + minute;
        }
        html += '			<input style="width: 60%;" type="text" id="expireDateCalendar" name="expireDate" value="' + toDate(expireDate) + '" class="textBox required" /> (yyyy/mm/dd HH:MM)';
        html += '           <div>Time zone:';
        var tzo = (new Date().getTimezoneOffset() / 60) * (-1);
        if (tzo > 0) {
            tzo = "+" + tzo;
        }
        html += tzo + '     </div>';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Assignment time *</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="assignmentTime" value="' + data['Group'].assignmentTime + '" class="textBox required" /> (time available to a worker for completing the HIT in seconds)';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Auto approval time *</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="autoApprovalTime" value="' + data['Group'].autoApprovalTime + '" class="textBox required" /> (a period after which the HIT is appereved automatically in seconds)';
        html += '		</td>';
        html += '	</tr>';
        html += '	<tr>';
        html += '		<td>';
        html += '			<span class="text-title">Max HITs</span>';
        html += '		</td>';
        html += '		<td>';
        html += '			<input style="width: 60%;" type="text" name="maxHits" value="' + data['Group'].maxHits + '" class="textBox" /> (a maximum number of HITs that can be submitted by a single worker)';
        html += '		</td>';
        html += '	</tr>';
        
        html += '	<tr>';
        html += '		<td colspan="2">';
        html += '		<table id="hitTable" width="100%" cellpadding="0" cellspacing="0" border="0">';
        var hitLength = data.Hit.length;
        for (var i = 0; i < hitLength; i++) {
            x.frameHeight = data.Hit[i].frameHeight;
            html += '	<tr>';
            html += '		<td width="180">';
            html += '			<span class="text-title">URL *</span>';
            html += '		</td>';
            html += '		<td >';
            html += '			<input style="width: 90%;" type="text" name="url[]" value="' + data.Hit[i].url + '" class="required" />';
            html += '		</td>';
            html += '		<td width="120">';
            html += '			<span class="text-title">Frame height *</span>';
            html += '		</td>';
            html += '		<td width="180">';
            html += '			<input style="width: 60%;" type="text" name="frameHeight[]" value="' + data.Hit[i].frameHeight + '" class="required" />';
            html += '		</td>';
            html += '		<td>';
            html += '			<input type="button" value="Delete" onclick="HITs.deleteThisHit(this)" />';
            html += '		</td>';
            html += '	</tr>';
        }
        html += '		</table>';
        html += '		<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="left">';
        html += '			<input type="button" value="New" onclick="HITs.newAHit();" />';
        html += '		</td></tr></table>';
        html += '		</td>';
        html += '	</tr>';
        
        html += '	<tr>';
        html += '		<td>&nbsp;</td>';
        html += '		<td>';
        html += '			<input type="submit" value="Duplicate Now" /> ';
        html += '			<input type="button" value="Cancel" onclick="window.location.href=\'hitgroups.html\'" style="margin-left:40px;" />';
        html += '		</td>';
        html += '	</tr>';
        html += '</table>';
        $("#form1").html(html);
        $("#form1 input[name='name']").val(data['Group'].name);
        $("#form1 textarea[name='description']").val(data['Group'].description);
    },
    
    bindEvent: function(){
        $("#expireDateCalendar").datepicker({
            dateFormat: "yy/mm/dd 00:00"
        });
        
        $("#form1").unbind("submit").submit(function(){
            var hasError = false;
            $("#form1 .required").each(function(){
                if ($(this).val() == "") {
                    hasError = true;
                    $(this).focus().select();
                    alert("This field can not be empty.");
                    return false;
                }
            });
            if (!hasError) {
                var v = new Date($("#expireDateCalendar").val()).getTime();
                if (!isNaN(v)) {
                    $("#expireDateCalendar").val(v);
                }
                Ajax.createMultipleHIT({
                    data: $("#form1").serialize(),
                    success: function(o){
                        alert(o.info);
                    }
                });
                
            }
            return false;
        });
    },
    
    newAHit: function(){
        var x = this;
        var html = '';
        html += '	<tr>';
        html += '		<td width="180">';
        html += '			<span class="text-title">url *</span>';
        html += '		</td>';
        html += '		<td width="180">';
        html += '			<input type="text" name="url[]" value="" class="required" />';
        html += '		</td>';
        html += '		<td width="180">';
        html += '			<span class="text-title">frameHeight *</span>';
        html += '		</td>';
        html += '		<td width="180">';
        html += '			<input type="text" name="frameHeight[]" value="' + x.frameHeight + '" class="required" />';
        html += '		</td>';
        html += '		<td>';
        html += '			<input type="button" value="Delete" onclick="HITs.deleteThisHit(this)" />';
        html += '		</td>';
        html += '	</tr>';
        $("#hitTable").append(html);
    },
    
    deleteThisHit: function(el){
        $(el).parent().parent().remove();
    }
    
};
