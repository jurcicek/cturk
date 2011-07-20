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

    order: '',//sorting order
    limit: 10,//items shown in a page
    page: 1,//page number
    count: 0,//total items
    hitGroupPaginator: null,
    
    load: function(){
        HITs.getHITs(false);
        HITs.bindEvent();
    },
    
    getHITs: function(isRefresh){
        HITs.order = $("#groupSortType").val();
        HITs.initHITGroups();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#hitGroupPaginatorText").html("");
            HITs.initPaginator();
        }
        Ajax.getAcceptedHITs({
            data: {
                order: HITs.order,
                limit: HITs.limit,
                page: HITs.page
            },
            success: function(o){
                if (o.status == 1) {
                    if (o.info == 0) {
                        $("#hitGroupPaginatorText").html("0-0 of 0 Results");
                        HITs.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">There are currently no HITs assigned to you.</div>';
                        $("#hitGroupList").html(html);
                    } else {
                        HITs.count = o.info;
                        HITs.refreshPagination();
                        HITs.showHITGroups(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        $("#groupSortButton").unbind("click").click(function(){
            HITs.page = 1;
            HITs.getHITs(false);
        });
    },
    
    initPaginator: function(){
        HITs.hitGroupPaginator = new MFPagination({
            id: "hitGroupPaginator",
            size: 0,
            itemsPerPage: HITs.limit,
            numDisplayEntries: 5,
            currentPage: HITs.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != HITs.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    HITs.page = pageIndex + 1;
                    HITs.getHITs(true);
                }
            }
        });
    },
    
    refreshPagination: function(){
        var start = HITs.limit * (HITs.page - 1) + 1;
        var end = (HITs.limit * HITs.page < HITs.count) ? HITs.limit * HITs.page : HITs.count;
        var count = HITs.count;
        if (count == 0) {
            start = 0;
        }
        var html = '';
        html += start + '-' + end + ' of ' + count + ' Results';
        $("#hitGroupPaginatorText").html(html);
        
        HITs.hitGroupPaginator.setOptions({
            size: count,
            currentPage: HITs.page - 1
        });
    },
    
    initHITGroups: function(){
        $("#hitGroupList").html('Loading data...');
    },
    
    showHITGroups: function(data, count){
        var html = '';
        var tip = {
            requester: 'The Requester that submitted the HITs in this group.',
            expireDate: 'The date these HITs will expire, and will no longer be available.',
            reward: 'The amount of money you can earn for completing each HIT in this group.',
            assignmentTime: 'The amount of time you have to complete the HIT, from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            description: 'A general description of HITs in this group.'
        };
        if (data.length == 0) {
            html += '<div class="hitMessage hitWarning">There are currently no HITs assigned to you.</div>';
        }
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            var fnReturnHIT = "javascript:HITs.returnHIT('" + o.Assignment['id'] + "');";
            var fnContinueHIT = "accepthit.html?hitId=" + o.Hit['id'];
            html += '<table width="100%" class="groupTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><span class="groupName">' + o.Group['name'] + '</span></td>';
            html += '    <td align="right">';
            html += '    <INPUT TYPE="BUTTON" VALUE="Return this HIT" ONCLICK="' + fnReturnHIT + '">';
            html += '    <INPUT TYPE="BUTTON" VALUE="Continue work on this HIT" ONCLICK="window.location.href=\'' + fnContinueHIT + '\'">';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .groupDataTable start
            var requesterName = o.Requester['firstname'] + ' ' + o.Requester['surname'];
            var expireDate = Util.getDate(o.Assignment['expireDate']);
            var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
            var timeAllotted = Util.getTime(o.Group['assignmentTime']);
            var hitsAvailable = o.Group['numAvailableHit'];
            var description = o.Group['description'];
            html += '      <table width="100%" class="groupDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['requester'] + '">Requester:</span> ' + requesterName + '</td>';
            html += '          <td width="33%"><span class="textTitle">Assignment Expiration Date: </span>' + expireDate + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle" title="' + tip['assignmentTime'] + '">Time Allotted: </span>' + timeAllotted + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['numAvailableHit'] + '">HITs Available: </span>' + hitsAvailable + '</td>';
            html += '          <td>&nbsp;</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td colspan="3"><span class="textTitle" title="' + tip['description'] + '">Description: </span>' + description + '</td>';
            html += '        </tr>';
            html += '      </table>';
            //-- .groupDataTable end
            html += '    </td>';
            html += '  </tr>';
            html += '</table>';
        }
        $("#hitGroupList").html(html);
    },
    
    returnHIT: function(assignmentId){
        $(".hitMessage").hide();
        Ajax.releaseHIT({
            data: {
                assignmentId: assignmentId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                    HITs.getHITs(true);
                }
            }
        });
    }
    
};
