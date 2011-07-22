#!/bin/bash
# ping.zou 2010-07-20

WEB_ROOT="/home/zzzzz/public_html/zzzzzzzzzzz/cturk-transcriber/wwwroot";
DOC_ROOT="/home/zzzzz/public_html/zzzzzzzzzzz/cturk-transcriber/docs";

rm -r $WEB_ROOT/data/wav/`basename $1`;
mkdir $WEB_ROOT/data/wav/`basename $1`;
cp $1 $WEB_ROOT/data/wav -r;

cd $DOC_ROOT;
# generate question
perl5.8.9 genquestion.pl $1 $2;

# check audio total length
for d in $WEB_ROOT/data/wav/`basename $1`/*;do
  rm -f $d/*_all.wav
  shntool len $d/*.wav | sed -n '$p' | awk '{print $1}' > $d/len;
done

# convert wav to mp3
rm -r $WEB_ROOT/data/mp3/`basename $1`;
mkdir $WEB_ROOT/data/mp3/`basename $1`;
for f in $WEB_ROOT/data/wav/`basename $1`/*/*.wav;do
    dir=`dirname $f | sed 's=wav=mp3='`;
    if [ ! -d $dir ]; then
        mkdir $dir;
    fi
    file=`basename $f`;
#    ffmpeg -i $f -acodec mp3 -ab 192k $dir/${file%wav}mp3;
    lame -V 3 $f $dir/${file%wav}mp3;
done

# genautocheck
for d in $WEB_ROOT/data/wav/`basename $1`/*;do
  perl5.8.9 genautocheck.pl $d
done

# save to db
php import.php $1;

cd cmd/perl/
perl5.8.9 loadhits.pl
cd ../..
