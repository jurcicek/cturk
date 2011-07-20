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
        var x = this;
        x.getHITs(false);
        x.bindEvent();
    },
    
    getHITs: function(isRefresh){
        var x = this;
        x.order = $("#groupSortType").val();
        x.initHITGroups();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#hitGroupPaginatorText").html("");
            x.initPaginator();
        }
        Ajax.getWorkerAvailableHitGroupList({
            data: {
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    if (o.data.info == 0) {
                        $("#hitGroupPaginatorText").html("0-0 of 0 Results");
                        x.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">There are no available HITs at this moment.</div>';
                        $("#hitGroupList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showHITGroups(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#groupSortButton").unbind("click").click(function(){
            x.page = 1;
            x.getHITs(false);
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.hitGroupPaginator = new MFPagination({
            id: "hitGroupPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getHITs(true);
                }
            }
        });
    },
    
    refreshPagination: function(){
        var x = this;
        var start = x.limit * (x.page - 1) + 1;
        var end = (x.limit * x.page < x.count) ? x.limit * x.page : x.count;
        var count = x.count;
        if (count == 0) {
            start = 0;
        }
        var html = '';
        html += start + '-' + end + ' of ' + count + ' Results';
        $("#hitGroupPaginatorText").html(html);
        
        x.hitGroupPaginator.setOptions({
            size: count,
            currentPage: x.page - 1
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
            html += '<div class="hitMessage hitWarning">There are no available HITs at this moment.</div>';
        }
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            var previewHITUrl = 'previewhit.html?groupId=' + o.Group['id'];
            html += '<table width="100%" class="groupTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><a href="' + previewHITUrl + '" class="groupName">' + o.Group['name'] + '</a></td>';
            html += '    <td align="right">';
            html += '    <INPUT TYPE="BUTTON" VALUE="View a HIT in this group" ONCLICK="window.location.href=\'' + previewHITUrl + '\'">';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .groupDataTable start
            var requesterName = o.User['firstname'] + ' ' + o.User['surname'];
            var expireDate = Util.getDate(o.Group['expireDate']);
            var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
            var timeAllotted = Util.getTime(o.Group['assignmentTime']);
            var hitsAvailable = o.Group['numAvailableHit'];
            var description = o.Group['description'];
            html += '      <table width="100%" class="groupDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['requester'] + '">Requester:</span> ' + requesterName + '</td>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['expireDate'] + '">HIT Expiration Date: </span>' + expireDate + '</td>';
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
    }
    
};
