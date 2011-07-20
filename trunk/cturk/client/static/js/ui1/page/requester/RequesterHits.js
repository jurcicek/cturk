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

    order: '',// sorting order
    limit: 10,// number of items shown in a page
    page: 1,// number of page
    count: 0,// total items
    hitGroupPaginator: null,
    
    load: function(){
        var x = this;
        x.getHITs(false);
        x.bindEvent();
    },
    
    getHITs: function(isRefresh){
        var x = this;
        
        var groupId = "null";
        if (LocationSearch.has("groupId")) {
            groupId = LocationSearch.attr("groupId");
        }
        x.order = $("#groupSortType").val();
        x.initHITGroups();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#hitGroupPaginatorText").html("");
            x.initPaginator();
        }
        
        Ajax.getHITSummary({
            data: {
                groupId: groupId
            },
            success: function(o){
                x.showHITSummary(o.data, groupId);
            }
        });
        
        Ajax.getHITList({
            data: {
                groupId: groupId,
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
                        x.showHITs(o.data, groupId);
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
    
    showHITSummary: function(data, groupId){
        if (groupId != "null") {
            if (data.hitCount > 0) {
                $("#summaryInfo .groupName").html(data.Group['name']);
            } else {
                $("#summaryInfo .groupName").html("-");
            }
        } else {
            $("#summaryInfo .groupName").text("{All HITGroups}");
        }
        $("#summaryInfo .completedHits").html(data.CompletedHit.length);
        $("#summaryInfo .submittedAssignments").html(data.SubmittedAssignment.length);
        $("#summaryInfo .approvedAssignments").html(data.ApprovedAssignment.length);
        $("#summaryInfo .rejectedAssignments").html(data.RejectedAssignment.length);
        //$("#summaryInfo .closedAssignments").html(data.ClosedAssignment.length);
    },
    
    expireHIT: function(hitId){
        $(".hitMessage").html("").hide();
        var x = this;
        Ajax.expireHIT({
            data: {
                hitId: hitId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                    x.getHITs(true);
                }
            }
        })
    },
    
    showHITs: function(data, gId){
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
            var hitDetailUrl = 'hitdetail.html?hitId=' + o.Hit['id'];
            var fnExpire = "HITs.expireHIT('" + o.Hit['id'] + "')";
            html += '<table width="100%" class="groupTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><a href="' + hitDetailUrl + '" class="hitName">' + o.Hit['name'] + '</a></td>';
            html += '    <td align="right">';
            html += '    <INPUT TYPE="BUTTON" VALUE="Details" ONCLICK="window.location.href=\''+ hitDetailUrl + '\'">';
            html += '    <input type="button" class="fnButton" value="Expire" onclick="' + fnExpire + '" /></td>';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .groupDataTable start
            var requesterName = o.Requester['firstname'] + ' ' + o.Requester['surname'];
            var publishDate = Util.getDate(o.Hit['publishDate']);
            var expireDate = Util.getDate(o.Hit['expireDate']);
            var reward = o.Hit['currencyCode'] + ' ' + Util.getPrice(o.Hit['reward']);
            var timeAllotted = Util.getTime(o.Hit['assignmentTime']);
            var autoApproveTime = Util.getTime(o.Hit['autoApprovalTime']);
            var assignmentAmount = o.Assignment.length;
            var assignmentAmountX = "";
            var hitUrl = o.Hit['url'];
            for (var j = 0; j < assignmentAmount; j++) {
                if (o.Assignment[j].state == "Submitted") {
                    assignmentAmountX = '<span class="star"> * Need Approval *</span>';
                }
            }
            var hitState = o.Hit['state'];
            var description = o.Hit['description'];
            var userLink = "userinfo.html?userId=" + o.Requester['id'];
            html += '      <table width="100%" class="groupDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['requester'] + '">Requester:</span> <a href="' + userLink + '">' + requesterName + '</a></td>';
            html += '          <td width="33%"><span class="textTitle">HIT Publish Date: </span>' + publishDate + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['expireDate'] + '">HIT Expiration Date: </span>' + expireDate + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward + '</td>';
            html += '          <td><span class="textTitle">Auto Approve Time: </span>' + autoApproveTime + '</td>';
            html += '          <td><span class="textTitle">Assignments Amount: </span>' + assignmentAmount + assignmentAmountX + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle">HIT State: </span>' + hitState + '</a></td>';
            html += '          <td><span class="textTitle">HIT url: </span><a href="' + hitUrl + '">CLICK HERE TO VIEW</a></td>';
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
