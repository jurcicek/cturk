README: MTurk Transcription and Validation HITs Installation Guide

author ping.zou
version 0.1 2010-07-21 
version 0.2 2010-08-11
version 0.3 integrated configuration

This is the installation guide for the MTurk Transcription and Validation HITs. The following steps have been verified on Ubuntu 9.10. 
 
0. Prepare the source
0.1 Get the source cturk-20100908.zip
0.2 Extract the source to /cturk

1. Install Perl 5.8.9
MTurk SDK for Perl is compatible up to Perl 5.8.9.

1.1 Download source of Perl 5.8.9
wget http://www.cpan.org/src/5.0/perl-5.8.9.tar.bz2

1.2 Compile Perl 5.8.9
tar -jxf perl-5.8.9.tar.bz2
cd perl-5.8.9
./Configure -des
sudo make install
(Log out and log in again)
perl -v

Version information should be like the following:

	This is perl, v5.8.9 built for i686-linux
	Copyright 1987-2008, Larry Wall

2. Install LAMP
2.1 Install LAMP (apache, mysql, php, and phpmyadmin)
sudo aptitude install apache2 mysql-server php5-cli php5-mysql phpmyadmin

2.2 Create cturk database and an account for accessing database
mysql -u root -p 
	mysql> CREATE DATABASE cturk;
	mysql> grant all on cturk.* to cturk@"%" identified by "lccturk";  
(create an account cturk, of which the password is lccturk.)
	mysql> quit;

3. Install necessary lib and tools
sudo aptitude install libmysqlclient15-dev libmysql++-dev libmysqlclient16-dev
sudo aptitude install libexpat1-dev
sudo aptitude install lame
sudo aptitude install shntool

4. Install Amazon MTurk SDK for Perl
4.1 Download Amazon MTurk SDK for Perl
Go to http://sourceforge.net/projects/mturksdk-perl/, and download Net-Amazon-MechanicalTurk-1.01.tgz

4.2 Install Amazon MTurk SDK for Perl
tar -xf Net-Amazon-MechanicalTurk-1.01.tgz 
cd Net-Amazon-MechanicalTurk-1.01
sudo perl mturk_install.pl
(Choose [1] XML::Parser, and install all option modules)
(Prepare AWS Access Key Id and AWS Secret Access Key for MechnicalTurk setup)
 
sudo perl -MCPAN -e shell
	cpan[1]>install XML::Simple
	cpan[2]>install Test::Simple
	cpan[3]>install DBD::mysql
	cpan[4]>install Data::Dumper
	cpan[5]>install YAML
	cpan[5]>install Text:WagnerFischer
	cpan[6]>exit

4.3 Configure Amazon MTurk SDK AWS account, if necessary
sudo perl -MNet::Amazon::MechanicalTurk::Configurer -e configure

5. Configure MTurk Transcription and Validation HITs 
MTVH can be configured by modifying two configuration files and one script
 * docs/config.xml for script settings
 * wwwroot/server/common.php for website settings
 * docs/publish.sh for WEB_ROOT and DOC_ROOT

5.1 Configure script settings
docs/config.xml contains the following contents:

<?xml version="1.0" encoding="UTF-8"?>
<root>
	<mturkServiceUrl>http://mechanicalturk.sandbox.amazonaws.com/?Service=AWSMechanicalTurkRequester</mturkServiceUrl>
	<!--
	<mturkServiceUrl>http://mechanicalturk.amazonaws.com/?Service=AWSMechanicalTurkRequester</mturkServiceUrl>
	-->
	<resourceRoot>/var/www/cturk-demo/resources</resourceRoot>
	<webappRoot>/var/www/cturk-demo/wwwroot</webappRoot>
	<webappUrl>http://10.12.7.134/cturk-demo/wwwroot</webappUrl>
	<transcriptionPrice>0.04</transcriptionPrice>
	<validationPrice>4</validationPrice>
	<mysql>
		<dbHost>localhost</dbHost>
		<dbName>cturk</dbName>
		<dbUser>cturk</dbUser>
		<dbPwd>lccturk</dbPwd>
		<dbPort>3306</dbPort>
		<dbPrefix>cturk_</dbPrefix>
	</mysql>
</root>

In details:
mturkServiceUrl: HIT publishing URL (sandbox or MTurk)
resourceRoot: resource root path, audio files must put into resources/wav/
webappRoot: Website root path 
webappUrl:¡¡Website public URL
transcriptionPrice: Price parmeter for the Trascription HIT. Refer to getTranscriptionPrice from config.pl/config2.pl for how price is calculated.
validationPrice: Price parameter for the Validation HIT. Refer to getValidationPrice from config.pl/config2.pl for how price is calculated. 
mysql: MySQL database settings, including: 
dbHost: DB host
dbName: DB name
dbUser: DB user
dbPwd: DB password
dbPort: DB port
dbPrefix: DB table prefix

Note that, path parameters, such as resourceRoot, cannot be ended with "/"


5.2 Configure website settings
Edit getConfig of wwwroot/server/common.php, in details:


function getConfig(){
	return array(
	'DB_TYPE'=>'mysql',
	'DB_HOST'=>'localhost',
	'DB_NAME'=>'cturk',
	'DB_USER'=>'cturk',
	'DB_PWD'=>'lccturk',
	'DB_PORT'=>'3306',
	'DB_PREFIX'=>'cturk_',
	);
}

5.3 Configure docs/publish.sh
Set the absolute path to the root of web application and the root of MTVH's scripts.
e.g.

WEB_ROOT="/var/www/cturk/wwwroot";
DOC_ROOT="/var/www/cturk/docs";

5.4 Copy MTurk Transcription and Validation HITs to Apache web document root (/var/www by default)
sudo cp -r cturk /var/www

5.5 Create tables for cturk database
mysql -u root -p
	mysql>use cturk;
	mysql>source /var/www/cturk/docs/createdb.sql;
	mysql>quit;
(Go to http://localhost/phpmyadmin to check that database cturk now has two tables, cturk_list and cturk_list2.)

6. Use MTurk Transcription and Validation HITs
Make sure the user, who publishes the HITs using MTVH, has the read and write rights to resources and wwwroot/data folders.

6.1 Publish Transcription HITs
cd /var/www/cturk/docs
bash publish.sh target-path answer-path
(target-path should contain at least one folder of HIT data. answer-path contains all known transcription for auto checking.)
e.g. 
	cd /var/www/cturk/docs
	sudo bash publish.sh /var/www/cturk/resources/wav/user/ /var/www/cturk/resources/wav/std/

6.2.1 Autocheck published Transcription HITs, and publish Validation HITs if autocheck returns approve.
(It is recommentded to set this comment auto-run daily.)
	cd /var/www/cturk/docs/cmd
	sudo bash withValidation.sh

6.2.2 Autocheck published Transcription HITs, but do not publish Validation HITs.
	cd /var/www/cturk/docs/cmd
	sudo bash noValidation.sh
	
6.2.3 Autocheck published Validation HITs only.	
	cd /var/www/cturk/docs/cmd
	sudo bash onlyValidation.sh
	
6.3.1 Remove all published HITs
(!!! Should be used only for demo purpose in the sandbox.)
	cd /var/www/cturk/docs/cmd/perl
	sudo perl removeAllHITs.pl
	
6.3.2 Remove all published HITs
(!!! Used only for debug purpose)
	cd /var/www/cturk/docs/cmd/perl
	sudo perl removePublishedHITs.pl