$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        C.user = o.data;
                        HITs.load();
                        
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

    data: null,
    
    load: function(){
        HITs.getHITs();
    },
    
    getHITs: function(){
        if (!LocationSearch.has("groupId")) {
            var html = 'Invalid HITGroup id.';
            $("#hitErrorMessage").html(html).show();
            return;
        }
        var groupId = LocationSearch.attr("groupId");
        Ajax.previewHIT({
            data: {
                groupId: groupId
            },
            success: function(o){
                if (o.status == 0) {
                    var html = 'There are no available HITs in this group.';
                    $("#hitWarningMessage").html(html).show();
                } else {
                    HITs.data = o.data;
                    HITs.showData(o.data);
                }
            }
        });
    },
    
    acceptHIT: function(hitId){
        $("#hitErrorMessage").hide();
        $("#acceptHitButton").attr("disabled", true);
        Ajax.acceptHIT({
            data: {
                hitId: hitId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    $("#acceptHitButton").attr("disabled", false);
                    
                } else {
                    var assignmentId = o.data['assignmentId'];
                    $("#hitSuccessMessage").html(o.info).show();
                    
                    //var frameHeight = HITs.data.Hit['frameHeight'];
                    //var frameUrl = HITs.data.Hit['url'];
                    //var url = frameUrl + '?assignmentId=' + assignmentId;
                    //if (frameUrl.indexOf("?") > 0) {
                    //    url = frameUrl + '&assignmentId=' + assignmentId;
                    //}
                    //$("#hitFrame").attr("src", url);
                    var hitId = o.data['hitId'];
                    window.setTimeout(function(){
                        var url = "accepthit.html?hitId=" + hitId;
                        window.location.href = url;
                    }, 3000);
                }
            }
        });
    },
    
    showData: function(o){
        var html = '';
        var tip = {
            requester: 'The Requester that submitted this HIT.',
            expireDate: '',
            reward: 'The amount of money you can earn for completing this HIT.',
            assignmentTime: 'The amount of time you have to complete the HIT, from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            duration: "The amount of time remaining for you to complete this HIT.",
            description: 'A general description of the HIT'
        };
        var hitName = o.Hit['name'];
        var requesterName = o.Requester['firstname'] + ' ' + o.Requester['surname'];
        var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
        var hitsAvailable = o.Group['numAvailableHit'];
        var duraion = Util.getTime(o.Group['assignmentTime']);
        var description = o.Hit['description'];
        html += '<table id="hitDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        html += '        <th>';
        html += '            <span class="hitName">' + hitName + '</span>';
        html += '        </th>';
        html += '        <th style="text-align:right;">';
        var fnAcceptHit = "HITs.acceptHIT('" + o.Hit['id'] + "')";
        html += '            <input id="acceptHitButton" type="button" value="Accept HIT" onclick="' + fnAcceptHit + '" />';
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
        var url = frameUrl + '?assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE';
        if (frameUrl.indexOf("?") > 0) {
            url = frameUrl + '&assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE';
        }
        html += '<iframe id="hitFrame" name="hitFrame" scrolling="auto" height="' + frameHeight + '" frameborder="0" align="center" width="100%" src="' + url + '"></iframe>';
        $("#hitData").html(html);
    }
    
};
