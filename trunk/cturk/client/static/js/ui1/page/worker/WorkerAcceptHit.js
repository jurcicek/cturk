$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        C.user = o.data;
                        HITs.load(o.data);
                        
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

    userData: null,
    
    data: null,
    
    load: function(userData){
        HITs.userData = userData;
        HITs.getHITs();
    },
    
    getHITs: function(){
        if (!LocationSearch.has("hitId")) {
            var html = 'Invalid HIT id.';
            $("#hitErrorMessage").html(html).show();
            return;
        }
        var hitId = LocationSearch.attr("hitId");
        Ajax.getHITInfo({
            data: {
                hitId: hitId
            },
            success: function(o){
                if (o.status == 0) {
                    var html = 'There are no available HITs at this moment.';
                    $("#hitWarningMessage").html(html).show();
                } else {
                    HITs.data = o.data;
                    HITs.showData(o.data);
                    HITs.__startTimer();
                }
            }
        });
    },
    
    __timerId: null,
    __startTimer: function(){
        var x = this;
        if (x.__timerId != null) {
            window.clearInterval(x.__timerId);
            x.__timerId = null;
        }
        x.__timerId = window.setInterval(function(){
            try {
                var data = $("#hitFrame").contents().find("body").text();
                eval("var o = " + data);
                window.clearInterval(x.__timerId);
                
                if (o.status == 0) {
                    alert(o.info);
                    
                } else {
                    alert("Submit success.");
                }
                //window.location.reload();
                var groupId = null;
                if (x.data != null) {
                    groupId = x.data['Group'].id;
                }
                Ajax.hasAvailHIT({
                    data: {
                        groupId: groupId
                    },
                    success: function(o){
                        if (o.status == 0) {
                            var url = "myhits.html";
                            window.location.href = url;
                        } else {
                            var url = "previewhit.html?groupId=" + groupId;
                            window.location.href = url;
                        }
                    }
                });
                
            } catch (e) {
            
            }
        }, 500);
    },
    
    returnHIT: function(assignmentId){
        $("#hitErrorMessage").hide();
        $("#returnHitButton").attr("disabled", true);
        Ajax.releaseHIT({
            data: {
                assignmentId: assignmentId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    $("#returnHitButton").attr("disabled", false);
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                    window.setTimeout(function(){
                        var url = "myhits.html";
                        window.location.href = url;
                    }, 3000);
                }
            }
        });
    },
    
    showData: function(o){
        var html = '';
        var tip = {
            requester: 'Requester that submitted this HIT.',
            expireDate: '',
            reward: 'The amount of money you can earn for completing this HIT.',
            assignmentTime: 'The amount of time you have to complete the HIT from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            duration: "The amount of time remaining for you to complete this HIT.",
            description: 'A general description of the HIT.'
        };
        var hitName = o.Hit['name'];
        var requesterName = o.Requester['firstname'] + ' ' + o.Requester['surname'];
        var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
        var hitsAvailable = o.Group['numAvailableHit'];
        var duraion = Util.getTime(o.Group['assignmentTime']);
        var description = o.Hit['description'];
        
        var hitId = o.Hit['id'];
        var workerId = HITs.userData.User['id'];
        var assignmentId = "ASSIGNMENT_ID_NOT_AVAILABLE";
        for (var i = 0; i < o.Assignment.length; i++) {
            if (o.Assignment[i]['worker_id'] == HITs.userData.User['id'] && o.Assignment[i]['state'] == "Accepted") {
                assignmentId = o.Assignment[i].id;
                break;
            }
        }
        
        html += '<table id="hitDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        html += '        <th style="width:78%;">';
        html += '            <span class="hitName">' + hitName + '</span>';
        html += '        </th>';
        html += '        <th style="text-align:right;">';
        var fnReturnHit = "HITs.returnHIT('" + assignmentId + "')";
        html += '            <input id="submitHitButton" type="button" value="Submit HIT" disabled="disabled" style="float:left;" />';
        html += '            <input id="returnHitButton" type="button" value="Return HIT" onclick="' + fnReturnHit + '" style="float:right;" />';
        html += '        </th>';
        html += '    </tr>';
        html += '    <tr class="tableBody">';
        html += '        <td colspan="2">';
        html += '            <table class="hitDataDetail" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '                <tr>';
        html += '                    <td width="30%">';
        html += '                        <span class="textTitle" title="' + tip['requester'] + '">Requester: </span>' + requesterName;
        html += '                    </td>';
        html += '                    <td width="20%">';
        html += '                        <span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward;
        html += '                    </td>';
        html += '                    <td width="20%">';
        html += '                        <span class="textTitle" title="' + tip['numAvailableHit'] + '">HITs Available: </span>' + hitsAvailable;
        html += '                    </td>';
        html += '                    <td width="30%">';
        html += '                        <span class="textTitle" title="' + tip['assignmentTime'] + '">Time Allotted: </span>' + duraion;
        html += '                    </td>';
        html += '                </tr>';
        html += '                <tr>';
        html += '                    <td colspan="4">';
        html += '                        <span class="textTitle" title="' + tip['description'] + '">Description: </span>' + description;
        html += '                    </td>';
        html += '                </tr>';
        html += '            </table>';
        html += '        </td>';
        html += '    </tr>';
        html += '</table>';
        
        var frameHeight = o.Hit['frameHeight'];
        var frameUrl = o.Hit['url'];
        var url = frameUrl + '?assignmentId=' + assignmentId + '&workerId=' + workerId + '&hitId=' + hitId ;
/*        if (frameUrl.indexOf("?") > 0) {
            url = frameUrl + '&assignmentId=' + assignmentId;
        }
*/        html += '<iframe id="hitFrame" name="hitFrame" scrolling="auto" height="' + frameHeight + '" frameborder="0" align="center" width="100%" src="' + url + '"></iframe>';
        $("#hitData").html(html);
    }
    
};
