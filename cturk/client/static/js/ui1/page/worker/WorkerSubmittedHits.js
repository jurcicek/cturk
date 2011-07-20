$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        C.user = o.data;
                        Assignments.load();
                        
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

var Assignments = {

    data: [],
    order: '',// sorting order
    limit: 10,//items shown in a page
    page: 1,//page number
    count: 0,//total items
    hitGroupPaginator: null,
    
    load: function(){
        var x = this;
        
        if (LocationSearch.has("state")) {
            var assignmentState = LocationSearch.attr("state");
            $("#assignmentStateSelect").val(assignmentState);
        }
        x.getAssignments(false);
        x.bindEvent();
    },
    
    getAssignments: function(isRefresh){
        var x = this;
        //x.order = $("#groupSortType").val();
        x.order = "Assignment.id DESC";
        x.initAssignments();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#assignmentPaginatorText").html("");
            x.initPaginator();
        }
        var assignmentState = $("#assignmentStateSelect").val();
        Ajax.getAssignmentList({
            data: {
                userType: "workers",
                groupId: "null",
                workerId: "null",
                assignmentState: assignmentState,
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    x.data = o.data;
                    if (o.data.info == 0) {
                        $("#assignmentPaginatorText").html("0-0 of 0 Results");
                        x.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">No available assignment.</div>';
                        $("#assignmentList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showAssignments(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#assignmentStateSelect").unbind("change").change(function(){
            var v = $(this).val();
            LocationSearch.attr("state", v);
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.hitGroupPaginator = new MFPagination({
            id: "assignmentPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getAssignments(true);
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
        $("#assignmentPaginatorText").html(html);
        
        x.hitGroupPaginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    initAssignments: function(){
        $("#assignmentList").html('Loading data...');
    },
    
    showAssignments: function(o){
        var assignmentLength = o.length;
        var assignmentState = $("#assignmentStateSelect").val();
        var html = '';
        html += '<table class="groupTable groupDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        html += '        <td width="20%">';
        html += '            <span class="textTitle">Submit Date</span>';
        html += '        </td>';
        html += '        <td width="20%">';
        html += '            <span class="textTitle">Requester name</span>';
        html += '        </td>';
        html += '        <td width="20%">';
        html += '            <span class="textTitle">Requester username</span>';
        html += '        </td>';
        //html += '        <td>';
        //html += '            <span class="textTitle">Title of the HIT</span>';
        //html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Reward</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">State</span>';
        html += '        </td>';
        html += '        <td width="20%">';
        html += '            <span class="textTitle">Feedback</span>';
        html += '        </td>';
        html += '    </tr>';
        if (assignmentLength == 0) {
            html += '    <tr class="tableBody">';
            html += '        <td colspan="6" class="hitWarning hitMessage">No Assignment Data.</td>';
            html += '    </tr>';
            
        } else {
            for (var i = 0; i < assignmentLength; i++) {
                var data = o[i];
                var assignmentId = data.Assignment['id'];
                var submitDate = "-";
                data.Assignment['submitDate'] && (submitDate = Util.getDate(data.Assignment['submitDate']));
                var requesterName = data.Requester['firstname'] + " " + data.Requester['surname'];
                var requesterUsername = data.Requester['username'];
                var hitTitle = data.Hit['name'];
                var reward = data.Hit['currencyCode'] + ' ' + Util.getPrice(data.Hit['reward']);
                var assignmentState = data.Assignment['state'];
                var assignmentFeedback = data.Assignment['message'] ? data.Assignment['message'] : '';
                
                var styleString = "";
                //if ((i + 1) % 2 == 0) {
                //styleString = "background-color:#fff;";
                //}
                html += '    <tr class="tableBody" style="' + styleString + '">';
                html += '        <td>' + submitDate + '</td>';
                html += '        <td>' + requesterName + '</td>';
                html += '        <td>' + requesterUsername + '</td>';
                //html += '        <td>' + hitTitle + '</td>';
                html += '        <td>' + reward + '</td>';
                html += '        <td>' + assignmentState + ' </td>';
                html += '        <td>' + assignmentFeedback + ' </td>';
                html += '    </tr>';
                html += '    <tr><td colspan="6"><span class="textTitle">Title of the HIT</span> ' + hitTitle + '</td></tr>';
            }
            
            //html += '    <tr class="tableHead">';
            //html += '    </tr>';
            html += '</table>';
        }
        
        $("#assignmentList").html(html);
    }
    
};
