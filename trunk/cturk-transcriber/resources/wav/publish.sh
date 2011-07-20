#!/bin/sh

DTA=`echo ~/src/cturask4/cturk-transcriber/resources/wav/`$1

echo "Publishing:" $DTA

OLD_PWD=`pwd`
echo $OLD_PWD

cd ~/src/cturk-task4/cturk-transcriber/docs/
bash publish.sh $DTA ~/src/cturk-task4/cturk-transcriber/resources/wav/auto-valid-refs-TownInfo

cd $OLD_PWD

