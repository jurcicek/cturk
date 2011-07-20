#!/usr/bin/perl5.8
# Generate Transcription HITs questions, 
#   Generate session-fixed-question.xml, adding 3 standard answers.
#   Generate reference.xml, containing the 3 standard answers.
use strict;
use warnings;
use XML::Simple;
use Data::Dumper;
use File::Basename;
use File::Copy;

my $userPath = $ARGV[0];
#my $userPath = "D:/www/wwwroot/cturk/resources/wav/user";
if(rindex($userPath,"/")+1 == length($userPath)){
    $userPath = substr($userPath, 0, rindex($userPath,"/"));
}
my $stdPath = $ARGV[1];
#my $stdPath = "D:/www/wwwroot/cturk/resources/wav/std";
if(rindex($stdPath,"/")+1 == length($stdPath)){
    $stdPath = substr($stdPath, 0, rindex($stdPath,"/"));
}

my $config = XMLin("config.xml", KeepRoot => 1, ForceArray => 1);
my $webappRoot = $config->{"root"}[0]->{"webappRoot"}[0];
my $outputPath = "$webappRoot/data/wav/".basename($userPath);

opendir USERDIR, $userPath;
print $userPath."\n";
my @userdir = readdir USERDIR;
closedir(USERDIR);

opendir STDDIR, $stdPath;
print $stdPath."\n";
my @stddir = readdir STDDIR;
closedir(STDDIR);
print "-------------------------";

foreach my $subfolder(@userdir){
    if($subfolder ne "." && $subfolder ne ".." && $subfolder ne ".svn"){
        #print $subfolder."\n";
        my $path = "$userPath/$subfolder/session-fixed.xml";
        print "Reading file: $userPath/$subfolder/session-fixed.xml\n";
        my $data;
        eval {
            $data = XMLin("$path", KeepRoot => 1, ForceArray => 1);
        };
        if ($@) {#error
            print "[ERROR]Read XML file error: $path\n";
            
        }else{
            #print Dumper($data);
            my $dataLength = 0;
            while ($data->{"dialog"}[0]->{"turn"}[$dataLength]) {
                $dataLength++;
            }
            my $dataUserturnLength = 0;
            my $dataI = int(rand($dataLength));
            my $dataJ = int(rand($dataLength));
            my $dataK = int(rand($dataLength));
            #print "$dataI $dataJ $dataK";
            
            # random get std transcription.xml, copy audio, save as "session-fixed-question.xml", "transcription.xml"
            my @stddirAll;
            my $stddirIndex = 0;
			my $x = 2;
            foreach my $subStdfolder(@stddir){
				if($subStdfolder eq ".svn"){
					$x = 3;
				}
                if($subStdfolder ne "." && $subStdfolder ne ".." && $subStdfolder ne ".svn"){
                    $stddirAll[$stddirIndex] = "$stdPath/$subStdfolder";
                    $stddirIndex++;
                }
            }
            my $stddirCount = @stddir - $x;
            my $randIndex = int(rand($stddirCount));
            #print "$randIndex  $stddirAll[$randIndex]\n";
            my $stdFilePath = "$stddirAll[$randIndex]/transcription.xml";
            my $stddata;
            print "Reading file: $stdFilePath\n";
            eval {
                $stddata = XMLin("$stdFilePath", KeepRoot => 1, ForceArray => 1);
            };
            if ($@) {#error
                print "[ERROR]Read XML file error: $stdFilePath\n";
                
            }else{
                # get turn length
                my $turnLength = 0;
                while ($stddata->{"dialog"}[0]->{"turn"}[$turnLength]) {
                    my $userturnLength = 0;
                    while($stddata->{"dialog"}[0]->{"turn"}[$turnLength]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$turnLength]->{"userturn"}[$userturnLength]){
                        my $turnnum = $stddata->{"dialog"}[0]->{"turn"}[$turnLength]->{"userturn"}[$userturnLength]->{"turnnum"};
                        $stddata->{"dialog"}[0]->{"turn"}[$turnLength]->{"userturn"}[$userturnLength]->{"turnnum"} = "v$turnnum";
                        $userturnLength++;
                    }
                    $turnLength++;
                }
                #print $turnLength." ";
                
                #generate i,j,k
                my $i;
                my $j;
                my $k;
                my $userturnLength = 0;
                do{
                    $i = int(rand($turnLength));
                    $userturnLength = 0;
                    while($stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]){
                        $userturnLength++;
                    }
                }while(!($stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength-1]->{"transcription"}));
                #print "$i ";
                do{
                    $j = int(rand($turnLength));
                    $userturnLength = 0;
                    while($stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"}[$userturnLength]){
                        $userturnLength++;
                    }
                }while(!($stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"}[$userturnLength-1]->{"transcription"}) || $i==$j);
                #print "$j ";
                do{
                    $k = int(rand($turnLength));
                    $userturnLength = 0;
                    while($stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"}[$userturnLength]){
                        $userturnLength++;
                    }
                }while(!($stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"} && $stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"}[$userturnLength-1]->{"transcription"}) || $i==$k || $j==$k);
                #print "$i $j $k\n";
                #print "$k \n";
                
                
                # copy files
                my $tempIndex = 0;
                while(!$stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"}){
                    $tempIndex++;
                };
                my $from1 = "$stddirAll[$randIndex]/".$stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                my $to1 = "$outputPath/$subfolder/".$stddata->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                print "======\n";
				print $from1."\n".$to1."\n";
                print "======\n";
                copy($from1, $to1) or die "Copy failed: $!\n";
                
                $tempIndex = 0;
                while(!$stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"}){
                    $tempIndex++;
                };
                my $from2 = "$stddirAll[$randIndex]/".$stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                my $to2 = "$outputPath/$subfolder/".$stddata->{"dialog"}[0]->{"turn"}[$j]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                copy($from2, $to2) or die "Copy failed: $!\n";
                
                $tempIndex = 0;
                while(!$stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"}){
                    $tempIndex++;
                };
                my $from3 = "$stddirAll[$randIndex]/".$stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                my $to3 = "$outputPath/$subfolder/".$stddata->{"dialog"}[0]->{"turn"}[$k]->{"userturn"}[$tempIndex]->{"rec"}[0]->{"fname"};
                copy($from3, $to3) or die "Copy failed: $!\n";
                
                # save as "reference.xml"
                my $userturnI = $stddata->{"dialog"}[0]->{"turn"}[$i];
                for(my $t=$dataLength; $t>$dataI; $t--){
                    $data->{"dialog"}[0]->{"turn"}[$t] = $data->{"dialog"}[0]->{"turn"}[$t-1];
                }
                $dataLength++;
                $data->{"dialog"}[0]->{"turn"}[$dataI] = $userturnI;
                my $userturnJ =$stddata->{"dialog"}[0]->{"turn"}[$j];
                for(my $t=$dataLength; $t>$dataJ; $t--){
                    $data->{"dialog"}[0]->{"turn"}[$t] = $data->{"dialog"}[0]->{"turn"}[$t-1];
                }
                $dataLength++;
                $data->{"dialog"}[0]->{"turn"}[$dataJ] = $userturnJ;
                my $userturnK =$stddata->{"dialog"}[0]->{"turn"}[$k];
                for(my $t=$dataLength; $t>$dataK; $t--){
                    $data->{"dialog"}[0]->{"turn"}[$t] = $data->{"dialog"}[0]->{"turn"}[$t-1];
                }
                $dataLength++;
                $data->{"dialog"}[0]->{"turn"}[$dataK] = $userturnK;
                my $outputData = XMLout($data, XMLDecl => '<?xml version="1.0" encoding="UTF-8"?>', RootName => undef, NoEscape => 1);
                #print $outputData;
                open(OUTFILE, ">$outputPath/$subfolder/reference.xml");
                print OUTFILE ($outputData);
                close OUTFILE;
                
                
                # save as "session-fixed-question.xml"
                for(my $t=0; $t<$dataLength; $t++){
                    my $tLength = 0;
                    while($data->{"dialog"}[0]->{"turn"}[$t]->{"userturn"}[$tLength]){
                        if($data->{"dialog"}[0]->{"turn"}[$t]->{"userturn"}[$tLength]->{"transcription"}[0]){
                            $data->{"dialog"}[0]->{"turn"}[$t]->{"userturn"}[$tLength]->{"transcription"}[0] = undef;
                        }
                        $tLength++;
                    }
                    
                }
                my $outputData2 = XMLout($data, XMLDecl => '<?xml version="1.0" encoding="UTF-8"?>', RootName => undef, NoEscape => 1);
                open(OUTFILE2, ">$outputPath/$subfolder/session-fixed-question.xml");
                print OUTFILE2 ($outputData2);
                close OUTFILE2;
            }
        }
    }
}
