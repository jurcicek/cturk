#!/usr/bin/perl
# Get user's submitted answers from Amazon MTurk for those un-approved HITs. If there are valid answers, then write the answers to the database, and set HIT's status in the database to 2.

use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request;
use XML::Simple;
use Data::Dumper;
use DBI;
use Cwd;
use File::Basename;

my $cwd;
if ($0 =~ m{^/}) {
  $cwd = dirname($0);
} else {
  my $dir = getcwd();
  $cwd = dirname("$dir/$0");
}

do "$cwd/config2.pl";
my $dbh = getDBI();

my $ua = LWP::UserAgent->new();

sub requesterGetResult(){
	my($id, $hitId, $hitTypeId, $status)=@_;
	my $hitArg = {
		'_username' => getUsername(),
		'_password' => getPassword(),
		'_DEFAULT_AJAX_RETURN' => 'XML',
	};
	
	print "\n get HIT result:\n";
	my $url = getWebServiceUrl()."/requesters/getHITInfo/$hitId";
	my $resp = $ua->post($url,$hitArg,'Content_Type' => 'form-data');
	if($resp->is_success){
		my $content = $resp->content;
		print $content."\n";
		
		my $data = XMLin($content, KeepRoot => 1, ForceArray => 1);
		my $isSuccess = $data->{"think"}[0]->{"status"}[0];
		if($isSuccess eq "1"){
			my $i = 0;
			while($data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]){
				my $assignmentId = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"id"}[1];
				my $assignmentStatus = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"state"}[0];
				my $workerId = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"user_id"}[0];
				my $answers = XMLout($data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"data"}[0], XMLDecl => '<?xml version="1.0"?>', RootName => undef, NoEscape => 1);
				my $submitDate = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"submitDate"}[0];
			
				my $statusX = 2;
				if($assignmentStatus eq "Rejected"){
					$statusX = 1;
				}
				if($status == 3 || $status == 31 || $status == 4){
					$statusX = $status;
				}
				if($assignmentStatus eq "Approved" || $assignmentStatus eq "Rejected"){
					$statusX = 5;
				}
				if($assignmentStatus ne "Accepted"){
					my $updateSth = $dbh->prepare(qq{
						UPDATE cturk_list2
						SET AssignmentId = ?, AssignmentStatus = ?, WorkerId = ?, Answers = ?, status = ?
						WHERE id = ?
					});
					$updateSth->execute($assignmentId, $assignmentStatus, $workerId, $answers, $statusX, $id);
				}
				$i++;
			}
		}
	}
}


my $searchSth = $dbh->prepare("
	SELECT id,hitid,hittypeid,status 
	FROM cturk_list2 
	WHERE status = 1 or status = 2 or status = 3 or status = 31 or status = 4");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
	my $id = $ref->{'id'};
	my $hitId = $ref->{'hitid'};
	my $hitTypeId = $ref->{'hittypeid'};
	my $status = $ref->{'status'};
	&requesterGetResult($id, $hitId, $hitTypeId, $status);
}

my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time());
$year += 1900;
$mon = sprintf("%02d", $mon + 1);
$mday = sprintf("%02d", $mday);
my $checkDate = "$mday$mon$year";
my $updateSth = $dbh->prepare("
	UPDATE cturk_list2 
	SET checkDate='$checkDate' 
	WHERE status = 1 or status = 2 or status = 3 or status = 31 or status = 4");
$updateSth->execute();

$dbh->commit;
$dbh->disconnect;
