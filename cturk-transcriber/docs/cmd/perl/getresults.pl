#!/usr/bin/perl5.8
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

do "$cwd/config.pl";
my $dbh = getDBI();

my $ua = LWP::UserAgent->new();

sub requesterGetResult(){
	my($id, $path, $hitId, $hitTypeId, $status, $stdAnswers,  $audioLength, $publishDate)=@_;
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
		print $content;
		
		#hitId hitTypeId publishDate checkDate
		#id    group_id
		my $data = XMLin($content, KeepRoot => 1, ForceArray => 1);
		my $i = 0;
		while($data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]){
			my $assignmentId = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"id"}[1];
			my $assignmentStatus = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"state"}[0];
			#my $hitId = $hitId;
			my $workerId = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"worker_id"}[0];
			my $answers = XMLout($data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"data"}[0], XMLDecl => '<?xml version="1.0"?>', RootName => undef, NoEscape => 1);
			my $submitDate = $data->{"think"}[0]->{"data"}[0]->{"Assignment"}[0]->{"item"}[$i]->{"submitDate"}[0];
			my $statusX = 2;
			if($assignmentStatus eq "Rejected"){
				$statusX = 1;
			}
			if($status == 3 || $status == 31 || $status == 4){
				$statusX = $status;
			}
			if($assignmentStatus eq "Approved"){# || $assignmentStatus eq "Rejected"
				$statusX = 5;
			}
			if($assignmentStatus ne "Accepted"){
				#updateSth
				my $updateSth = $dbh->prepare(qq{
					UPDATE cturk_list
					SET AssignmentId = ?, AssignmentStatus = ?, WorkerId = ?, Answers = ?, status = ?
					WHERE id = ?
				});
				$updateSth->execute($assignmentId, $assignmentStatus, $workerId, $answers, $statusX, $id);
			}
			$i++;
		}
	}
}

my $searchSth = $dbh->prepare("
	SELECT id,path,hitid,hittypeid,status, StdAnswers, audioLength, publishDate
	FROM cturk_list 
	WHERE status = 1 or status = 2 or status = 3 or status = 31 or status = 4");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
	my $id = $ref->{'id'};
	my $path = $ref->{'path'};
	my $hitId = $ref->{'hitid'};
	my $hitTypeId = $ref->{'hittypeid'};
	my $status = $ref->{'status'};
	my $stdAnswers = $ref->{'StdAnswers'};
	my $audioLength = $ref->{'audioLength'};
	my $publishDate = $ref->{'publishDate'};
	&requesterGetResult($id, $path, $hitId, $hitTypeId, $status, $stdAnswers, $audioLength, $publishDate);
}

my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time());
$year += 1900;
$mon = sprintf("%02d", $mon + 1);
$mday = sprintf("%02d", $mday);
my $checkDate = "$mday$mon$year";
my $updateSth = $dbh->prepare("
	UPDATE cturk_list 
	SET checkDate='$checkDate' 
	WHERE status = 1 or status = 2 or status = 3 or status = 31 or status = 4");
$updateSth->execute();

$dbh->commit;
$dbh->disconnect;
