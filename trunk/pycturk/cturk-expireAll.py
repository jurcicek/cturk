#! /usr/bin/python

# To change this template, choose Tools | Templates
# and open the template in the editor.

__author__="Filip"
__date__ ="$23-Mar-2011 16:16:43$"

import cturk

username, password, webService = cturk.getUserPasswordWebservice()

if __name__ == "__main__":
    publishedAssignementsFile = open("publishedAssignments.txt","r")

    for line in publishedAssignementsFile:
        groupId, hitId = line.strip().split(';')
        results = cturk.expireHIT(username, password, webService, hitId)

    publishedAssignementsFile.close()
