#!/bin/sh

DTA=$1
SLCT="untranscribed-"
TGT=$SLCT$DTA

mkdir $TGT

for i in `ls $DTA | grep voip`;do echo $i `ls $DTA/$i/*user-transcription.xml | grep -v _all.wav | wc -l`;done | sort +1 -2g > $TGT/dialogue_wavlist

cat $TGT/dialogue_wavlist | awk '$2<1{print $1;}' > $TGT/todo_wavlist

for i in `cat $TGT/todo_wavlist`;do ln -s ../$DTA/$i $TGT;done

